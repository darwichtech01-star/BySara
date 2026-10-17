import {randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import sharp from 'sharp';
import {getPool} from '@/lib/db';
import {gate,identifier,text,transaction,audit,errorResponse,noCache,InputError} from '@/lib/server/admin-api';
import {MAX_INPUT_PIXELS,MAX_UPLOAD_BYTES,detectRasterMime,isImageSizeAllowed,imageStorageKey} from '@/lib/media/validation';
import {cleanupProductObject,mediaStorageReady,storeProductWebp} from '@/lib/media/storage';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){const a=await gate('catalog:read');if(a.error)return a.error;
 try{
  const id=req.nextUrl.searchParams.get('product_id');if(id)identifier(id,'Product');
  const r=await getPool().query(`SELECT id,product_id,variant_id,storage_path,public_url,alt_en,alt_ar,rights_confirmed,is_primary,sort_order
    FROM public.product_images WHERE ($1::uuid IS NULL OR product_id=$1::uuid) ORDER BY product_id,sort_order LIMIT 200`,[id]);
  return NextResponse.json({items:r.rows,uploadsEnabled:mediaStorageReady()},{headers:noCache});
 }catch(e){return errorResponse(e)}
}
async function parseLimitedFormData(req:NextRequest):Promise<FormData>{
 const ct=req.headers.get('content-type')??'';
 if(!/^multipart\/form-data\s*;/i.test(ct))throw new InputError('Use multipart/form-data');
 const len=req.headers.get('content-length');
 if(len && (!/^\d+$/.test(len)||Number(len)>MAX_UPLOAD_BYTES+32000))throw new InputError('Upload exceeds the size limit');
 if(!req.body)throw new InputError('Missing upload');
 const chunks:Uint8Array[]=[];let size=0;const reader=req.body.getReader();
 try{
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
   if(size>MAX_UPLOAD_BYTES+32000)throw new InputError('Upload exceeds the size limit');chunks.push(value);}
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength;}
 try{return await new Request('https://upload.invalid',{method:'POST',headers:{'content-type':ct},body:new Blob([new Uint8Array(bytes)])}).formData();}
 catch{throw new InputError('Invalid multipart upload');}
}
const field=(form:FormData,name:string):string=>{const value=form.get(name);if(typeof value!=='string')throw new InputError(`Invalid ${name}`);return value;};
export async function POST(req:NextRequest){
 const a=await gate('media:write',req);if(a.error)return a.error;
 if(!mediaStorageReady())return NextResponse.json({error:'Neon media credentials not configured. No upload was attempted.'},{status:503,headers:noCache});
 let objectKey:string|null=null;
 try{
  const form=await parseLimitedFormData(req);
  const allowed=new Set(['file','product_id','variant_id','alt_en','alt_ar','primary','rights_attested','rights_reference']);
  for(const key of form.keys())if(!allowed.has(key))throw new InputError(`Unexpected field: ${key}`);
  const file=form.get('file');if(!(file instanceof File))throw new InputError('Choose an image');
  if(!isImageSizeAllowed(file.size))throw new InputError('Image must be between 128 bytes and 6 MB');
  const productId=identifier(field(form,'product_id'),'Product');
  const variantId=field(form,'variant_id')?identifier(field(form,'variant_id'),'Variant'):null;
  const altEn=text(field(form,'alt_en'),'English image description',180);
  const altAr=typeof form.get('alt_ar')==='string'?String(form.get('alt_ar')).trim().slice(0,180):null;
  const primary=field(form,'primary')==='true';
  const attested=field(form,'rights_attested')==='true';
  const ref=field(form,'rights_reference').trim();
  if(!attested||ref.length<12||ref.length>250)throw new InputError('Usage rights must be attested with a reference (12–250 characters)');
  const input=new Uint8Array(await file.arrayBuffer());
  if(!detectRasterMime(input))throw new InputError('Only genuine JPEG, PNG or WebP images are accepted');
  let processed:Uint8Array;
  try{
   const pipeline=sharp(input,{limitInputPixels:MAX_INPUT_PIXELS,failOn:'error'});
   const md=await pipeline.metadata();
   if(!md.width||!md.height||md.width*md.height>MAX_INPUT_PIXELS)throw new InputError('Invalid image dimensions');
   processed=new Uint8Array(await pipeline.rotate().resize({width:3000,height:3000,fit:'inside',withoutEnlargement:true}).webp({quality:84,effort:4}).toBuffer());
  }catch(e){if(e instanceof InputError)throw e;throw new InputError('Unsupported or corrupt image');}
  objectKey=imageStorageKey(productId,randomUUID());
  const publicUrl=await storeProductWebp(objectKey,processed);
  const result=await transaction(async client=>{
    const p=await client.query<{status:string}>(`SELECT status FROM public.products WHERE id=$1::uuid FOR UPDATE`,[productId]);
    if(!p.rows[0])throw new InputError('Product not found');
    if(p.rows[0].status!=='draft')throw new InputError('Only Draft products may receive new media');
    if(variantId){const v=await client.query('SELECT 1 FROM public.product_variants WHERE id=$1::uuid AND product_id=$2::uuid',[variantId,productId]);if(!v.rowCount)throw new InputError('Variant does not belong to this product');}
    const count=await client.query<{n:number}>(`SELECT count(*)::int AS n FROM public.product_images WHERE product_id=$1::uuid`,[productId]);
    if(count.rows[0].n>=12)throw new InputError('Maximum 12 images per product');
    const exists=await client.query('SELECT 1 FROM public.product_images WHERE product_id=$1::uuid AND is_primary=true',[productId]);
    if(primary && exists.rowCount)throw new InputError('A primary image already exists; select another image after reviewing the draft');
    const r=await client.query<{id:string}>(`INSERT INTO public.product_images(product_id,variant_id,storage_path,public_url,alt_en,alt_ar,rights_confirmed,is_primary,sort_order)
      VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,true,$7,$8) RETURNING id`,[productId,variantId,objectKey,publicUrl,altEn,altAr||null,primary,count.rows[0].n]);
    await audit(client,a.staff,'media.upload','product_image',r.rows[0].id,{productId,variantId,objectKey,primary,usageRightsAttested:true,reference:ref,normalizedFormat:'webp'});
    return r.rows[0];
  });
  return NextResponse.json({item:{id:result.id,product_id:productId,public_url:publicUrl,alt_en:altEn,is_primary:primary,rights_confirmed:true}},{status:201,headers:noCache});
 }catch(e){
  if(objectKey){try{await cleanupProductObject(objectKey)}catch{/* Orphan detection is documented as operational follow-up. */}}
  return errorResponse(e);
 }
}
