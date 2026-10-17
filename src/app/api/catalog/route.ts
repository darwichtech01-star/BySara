import {NextResponse} from 'next/server';
import {publishedCatalog} from '@/lib/server/catalog';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 try {
  const data=await publishedCatalog();
  return NextResponse.json(data,{headers:{'cache-control':'no-store, max-age=0'}});
 } catch {
  return NextResponse.json({items:[],status:'unavailable',message:'Catalog temporarily unavailable.'},{status:503,headers:{'cache-control':'no-store'}});
 }
}
