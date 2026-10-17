import {NextRequest,NextResponse} from 'next/server';
import {gate,body,onlyKeys,identifier,text,optionalText,usd,count,bool,transaction,audit,errorResponse,noCache,InputError} from '@/lib/server/admin-api';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){const a=await gate('catalog:write',req);if(a.error)return a.error;
 try{const v=await body(req);onlyKeys(v,['product_id','sku','label_en','label_ar','price_usd','stock_qty','is_active','stock_reason']);
  const product=identifier(v.product_id,'Product'),sku=text(v.sku,'SKU',100),label=text(v.label_en,'Variant name',180),price=usd(v.price_usd),stock=v.stock_qty===null||v.stock_qty===undefined?null:count(v.stock_qty),active=v.is_active===undefined?false:bool(v.is_active,'is_active');
  if(active&&(price===null||stock===null))throw new InputError('Active SKU requires verified price and quantity');
  if(stock!==null){const r=await gate('inventory:adjust',req);if(r.error)return r.error;}
  const stockReason=stock!==null&&stock>0?text(v.stock_reason,'Verified stock intake source',500):null;
  if(stockReason && stockReason.length<12)throw new InputError('Stock intake requires a reason of at least 12 characters');
  const item=await transaction(async client=>{
   const existing=await client.query('SELECT status FROM public.products WHERE id=$1::uuid FOR UPDATE',[product]);
   if(!existing.rows[0])throw new InputError('Product not found');if(existing.rows[0].status!=='draft')throw new InputError('Add variants while product is Draft');
   const r=await client.query<{id:string}>(`INSERT INTO public.product_variants(product_id,sku,label_en,label_ar,price_usd,stock_qty,is_active)
    VALUES($1::uuid,$2,$3,$4,$5,$6,$7) RETURNING id`,[product,sku,label,optionalText(v.label_ar,'Arabic variant name',180),price,stock,active]);
   if(stockReason&&stock!==null&&stock>0){
    await client.query(`INSERT INTO public.stock_movements(variant_id,before_qty,after_qty,reason,actor_id) VALUES($1::uuid,0,$2,$3,$4::uuid)`,[r.rows[0].id,stock,stockReason,a.staff.id]);
   }
   await audit(client,a.staff,'variant.create','variant',r.rows[0].id,{product,sku,priceSet:price!==null,stockRecorded:stock!==null,stockReason:stockReason??null});
   return r.rows[0];});return NextResponse.json({item},{status:201,headers:noCache});
 }catch(e){return errorResponse(e)}
}
