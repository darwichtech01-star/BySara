import {NextRequest,NextResponse} from 'next/server';
import {getAuth} from '@/lib/auth/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'cache-control':'no-store'};
export async function GET(request:NextRequest){
 const auth=getAuth(); if(!auth)return NextResponse.json({error:'Authentication not configured'},{status:503,headers});
 return auth.handler().GET(request);
}
export async function POST(request:NextRequest){
 const auth=getAuth(); if(!auth)return NextResponse.json({error:'Authentication not configured'},{status:503,headers});
 return auth.handler().POST(request);
}
