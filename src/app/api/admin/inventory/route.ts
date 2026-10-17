import {NextRequest,NextResponse} from 'next/server';
import {getPool} from '@/lib/db';
import {gate,body,onlyKeys,identifier,count,text,transaction,audit,errorResponse,noCache,InputError} from '@/lib/server/admin-api';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){const a=await gate('catalog:read');if(a.error)return a.error;
 try{const id=req.nextUrl.searchParams.get('product_id');if(id)identifier(id,'Product');
  const result=await getPool().query(`SELECT v.id,v.product_id,v.sku,v.label_en,v.stock_qty,v.price_usd,p.name_en AS product_name,p.status
  FROM public.product_variants v JOIN public.products p ON p.id=v.product_id
  WHERE ($1::uuid IS NULL OR v.product_id=$1::uuid) ORDER BY p.name_en,v.sku LIMIT 200`,[id]);
  return NextResponse.json({items:result.rows},{headers:noCache});}catch(e){return errorResponse(e)}}
export async function POST(req:NextRequest){const a=await gate('inventory:adjust',req);if(a.error)return a.error;
 try{const v=await body(req);onlyKeys(v,['variant_id','expected_before_qty','after_qty','reason']);
  const variant=identifier(v.variant_id,'Variant'),before=count(v.expected_before_qty,'Expected quantity'),after=count(v.after_qty,'New quantity'),reason=text(v.reason,'Reason',500);
  if(reason.length<12)throw new InputError('Provide a documented reason (at least 12 characters)');
  const result=await transaction(async client=>{
   const rows=await client.query<{stock_qty:number|null;product_id:string}>(`SELECT stock_qty,product_id FROM public.product_variants WHERE id=$1::uuid FOR UPDATE`,[variant]);
   if(!rows.rows[0])throw new InputError('Variant not found');
   const old=rows.rows[0].stock_qty;if(old===null)throw new InputError('Count initial stock through a verified inventory intake workflow');
   if(old!==before)throw new InputError('Inventory changed; reload and reconcile before saving');
   if(old===after)throw new InputError('No inventory change');
   await client.query(`UPDATE public.product_variants SET stock_qty=$1,updated_at=now() WHERE id=$2::uuid`,[after,variant]);
   await client.query(`INSERT INTO public.stock_movements(variant_id,before_qty,after_qty,reason,actor_id) VALUES($1::uuid,$2,$3,$4,$5::uuid)`,[variant,old,after,reason,a.staff.id]);
   await audit(client,a.staff,'inventory.adjust','variant',variant,{before:old,after,reason});
   return {variant_id:variant,before:old,after};});
  return NextResponse.json({item:result},{headers:noCache});
 }catch(e){return errorResponse(e)}
}
