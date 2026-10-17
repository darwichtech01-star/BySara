import {NextRequest,NextResponse} from 'next/server';
import {getAuth} from '@/lib/auth/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'cache-control':'no-store'};
type AuthRouteContext={params:Promise<{path:string[]}>};
export async function GET(request:NextRequest,context:AuthRouteContext){
 const auth=getAuth(); if(!auth)return NextResponse.json({error:'Authentication not configured'},{status:503,headers});
 return auth.handler().GET(request,context);
}
export async function POST(request:NextRequest,context:AuthRouteContext){
 const auth=getAuth(); if(!auth)return NextResponse.json({error:'Authentication not configured'},{status:503,headers});
 return auth.handler().POST(request,context);
}
