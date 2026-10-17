import {NextResponse} from 'next/server';
import {publishedStoreConfig} from '@/lib/server/catalog';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 try {
  const config=await publishedStoreConfig();
  return NextResponse.json({...config,status:config.whatsapp||config.phone||config.email||config.instagram||config.address?'ready':'not-configured'},{headers:{'cache-control':'no-store'}});
 } catch {
  return NextResponse.json({whatsapp:null,phone:null,email:null,instagram:null,address:null,status:'unavailable'},{status:503,headers:{'cache-control':'no-store'}});
 }
}
