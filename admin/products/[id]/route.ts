import {NextRequest,NextResponse} from 'next/server';
import {getPool} from '@/lib/db';
import {gate,body,onlyKeys,text,identifier,optionalText,bool,transaction,audit,errorResponse,noCache,InputError} from '@/lib/server/admin-api';
export const runtime='nodejs';export const dynamic='force-dynamic';
type Params={params:Promise<{id:string}>};
export async function GET(_req:NextRequest,{params}:Params){
 const a=await gate('catalog:read');if(a.error)return a.error;
 try{const id=identifier((await params).id,'Product');
  const [p,v,i]=await Promise.all([
   getPool().query('SELECT * FROM public.products WHERE id=$1::uuid',[id]),
   getPool().query('SELECT id,sku,label_en,price_usd,stock_qty,is_active FROM public.product_variants WHERE product_id=$1::uuid ORDER BY created_at',[id]),
   getPool().query('SELECT id,storage_path,public_url,alt_en,rights_confirmed,is_primary,variant_id,sort_order FROM public.product_images WHERE product_id=$1::uuid ORDER BY sort_order',[id])]);
  if(!p.rows[0])return NextResponse.json({error:'Not found'},{status:404,headers:noCache});
  return NextResponse.json({item:p.rows[0],variants:v.rows,images:i.rows},{headers:noCache});
 }catch(e){return errorResponse(e)}
}
export async function PATCH(req:NextRequest,{params}:Params){
 // Elevated rights are separately checked for publication/verification decisions.
 const a=await gate('catalog:write',req);if(a.error)return a.error;
 try{const id=identifier((await params).id,'Product'),v=await body(req);
  onlyKeys(v,['name_en','name_ar','description_en','inci','warnings','requires_inci','status','is_verified','media_rights_confirmed','verification_note']);
  if(!Object.keys(v).length)throw new InputError('No changes submitted');
  const elevated=['status','is_verified','media_rights_confirmed'].some(x=>Object.hasOwn(v,x)) || v.requires_inci===false;
  if(elevated){const p=await gate('catalog:publish',req);if(p.error)return p.error;}
  if((v.is_verified===true||v.media_rights_confirmed===true||v.status==='published') && (!v.verification_note||typeof v.verification_note!=='string'||v.verification_note.trim().length<15))throw new InputError('Provide a documented review note (at least 15 characters)');
  const fields:string[]=[],paramsValues:unknown[]=[];let n=1;
  const add=(key:string,value:unknown)=>{fields.push(`${key}=$${n++}`);paramsValues.push(value)};
  if('name_en' in v)add('name_en',text(v.name_en,'Name',180));
  for(const k of ['name_ar','description_en','inci','warnings'] as const)if(k in v)add(k,optionalText(v[k],k,k==='description_en'?3000:4000));
  if('requires_inci' in v)add('requires_inci',bool(v.requires_inci,'requires_inci'));
  if('is_verified' in v){add('is_verified',bool(v.is_verified,'is_verified'));add('verified_at',v.is_verified?new Date().toISOString():null)}
  if('media_rights_confirmed' in v)add('media_rights_confirmed',bool(v.media_rights_confirmed,'media_rights_confirmed'));
  if('status' in v){if(!['draft','published','archived'].includes(String(v.status)))throw new InputError('Invalid status');add('status',v.status)}
  if(!fields.length)throw new InputError('No changes submitted');
  const result=await transaction(async client=>{
   const current=await client.query('SELECT status FROM public.products WHERE id=$1::uuid FOR UPDATE',[id]);
   if(!current.rows[0])return null;
   if(current.rows[0].status==='published' && Object.keys(v).some(k=>!['status','verification_note'].includes(k)))throw new InputError('Unpublish and re-review before editing published product data');
   paramsValues.push(id);
   const r=await client.query<{id:string;status:string}>(`UPDATE public.products SET ${fields.join(', ')} WHERE id=$${n}::uuid RETURNING id,status`,paramsValues);
   await audit(client,a.staff,'product.update','product',id,{fields:Object.keys(v).filter(x=>x!=='verification_note'),previousStatus:current.rows[0].status,newStatus:r.rows[0].status,reviewNote:typeof v.verification_note==='string'?v.verification_note.trim().slice(0,1000):null});
   return r.rows[0];
  });return result?NextResponse.json({item:result},{headers:noCache}):NextResponse.json({error:'Not found'},{status:404,headers:noCache});
 }catch(e){return errorResponse(e)}
}
