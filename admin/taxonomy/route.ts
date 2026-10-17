import {NextRequest,NextResponse} from 'next/server';
import {getPool} from '@/lib/db';
import {gate,body,onlyKeys,slugValue,text,optionalText,transaction,audit,errorResponse,noCache,InputError} from '@/lib/server/admin-api';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){const a=await gate('catalog:read');if(a.error)return a.error;try{
 const [brands,categories]=await Promise.all([getPool().query('SELECT id,slug,name_en,name_ar FROM public.brands ORDER BY name_en'),getPool().query('SELECT id,slug,name_en,name_ar FROM public.categories ORDER BY name_en')]);
 return NextResponse.json({brands:brands.rows,categories:categories.rows},{headers:noCache});}catch(e){return errorResponse(e)}}
export async function POST(req:NextRequest){const a=await gate('taxonomy:write',req);if(a.error)return a.error;
 try{const v=await body(req);onlyKeys(v,['kind','slug','name_en','name_ar']);const kind=v.kind;
 if(kind!=='brand'&&kind!=='category')throw new InputError('Invalid taxonomy kind');const slug=slugValue(v.slug),name=text(v.name_en,'Name',180),arabic=optionalText(v.name_ar,'Arabic name',180),table=kind==='brand'?'brands':'categories';
 const item=await transaction(async client=>{const r=await client.query<{id:string}>(`INSERT INTO public.${table}(slug,name_en,name_ar) VALUES($1,$2,$3) RETURNING id`,[slug,name,arabic]);await audit(client,a.staff,`${kind}.create`,kind,r.rows[0].id,{slug});return r.rows[0]});
 return NextResponse.json({item},{status:201,headers:noCache});}catch(e){return errorResponse(e)}}
