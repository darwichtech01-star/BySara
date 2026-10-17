import {NextResponse} from 'next/server';
import {getPool} from '@/lib/db';
import {gate,errorResponse,noCache} from '@/lib/server/admin-api';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){const a=await gate('audit:read');if(a.error)return a.error;
 try{const r=await getPool().query(`SELECT id,operation,entity_type,entity_id,created_at,actor_id,
 change_summary - 'reason' - 'reviewNote' AS change_summary FROM public.audit_logs ORDER BY created_at DESC LIMIT 100`);
 return NextResponse.json({items:r.rows},{headers:noCache});}catch(e){return errorResponse(e)}}
