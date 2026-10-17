import {NextResponse} from 'next/server';
import {gate,noCache} from '@/lib/server/admin-api';
import {capabilitiesFor} from '@/lib/authorization';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){const result=await gate('catalog:read');if(result.error)return result.error;return NextResponse.json({status:'authorized',role:result.staff.role,capabilities:capabilitiesFor(result.staff.role)},{headers:noCache});}
export async function POST(){return NextResponse.json({error:'Use resource-specific, protected Admin APIs'},{status:405,headers:noCache});}
