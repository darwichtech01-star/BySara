import {NextRequest,NextResponse} from 'next/server';
import {getPool} from '@/lib/db';
import {gate,body,onlyKeys,slugValue,text,identifier,optionalText,InputError,transaction,audit,errorResponse,noCache} from '@/lib/server/admin-api';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){
 const a=await gate('catalog:read');if(a.error)return a.error;
 try{
  const {rows}=await getPool().query(`SELECT p.id,p.slug,p.name_en,p.name_ar,p.description_en,p.inci,p.warnings,p.status,p.is_verified,p.media_rights_confirmed,p.requires_inci,p.brand_id,p.category_id,b.name_en AS brand_name,c.name_en AS category_name,
   (SELECT count(*)::int FROM public.product_variants v WHERE v.product_id=p.id) AS variant_count,
   (SELECT count(*)::int FROM public.product_images i WHERE i.product_id=p.id) AS image_count
   FROM public.products p JOIN public.brands b ON b.id=p.brand_id JOIN public.categories c ON c.id=p.category_id
   ORDER BY p.created_at DESC LIMIT 200`);
  return NextResponse.json({items:rows},{headers:noCache});
 }catch(e){return errorResponse(e)}
}
export async function POST(req:NextRequest){
 const a=await gate('catalog:write',req);if(a.error)return a.error;
 try{
  const data=await body(req);onlyKeys(data,['slug','name_en','name_ar','brand_id','category_id','description_en','inci','warnings','requires_inci']);
  const slug=slugValue(data.slug),name=text(data.name_en,'Name',180),brand=identifier(data.brand_id,'Brand'),category=identifier(data.category_id,'Category');
  const requiresInci=data.requires_inci===undefined?true:data.requires_inci;
  if(typeof requiresInci!=='boolean')throw new InputError('Invalid requires_inci');
  if(requiresInci===false){const elevated=await gate('catalog:publish',req);if(elevated.error)return elevated.error;}
  const result=await transaction(async client=>{
   const r=await client.query<{id:string}>(`INSERT INTO public.products(slug,name_en,name_ar,brand_id,category_id,description_en,inci,warnings,requires_inci)
    VALUES($1,$2,$3,$4::uuid,$5::uuid,$6,$7,$8,$9) RETURNING id`,[slug,name,optionalText(data.name_ar,'Arabic name',180),brand,category,optionalText(data.description_en,'Description',3000),optionalText(data.inci,'INCI',4000),optionalText(data.warnings,'Warnings',2500),requiresInci]);
   await audit(client,a.staff,'product.create','product',r.rows[0].id,{slug,initialStatus:'draft'});return r.rows[0];
  });return NextResponse.json({item:result},{status:201,headers:noCache});
 }catch(e){return errorResponse(e)}
}
