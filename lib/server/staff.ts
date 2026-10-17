import 'server-only';
import {getAuth} from '@/lib/auth/server';
import {getPool} from '@/lib/db';
import {can,type Capability,type Role} from '@/lib/authorization';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type Staff={id:string;role:Role};
export type StaffResult={status:'ok';staff:Staff}|{status:'unauthenticated'|'forbidden'|'unavailable';staff:null};
/** Server-session -> trusted staff_profiles lookup; no role claims or request body are trusted. */
export async function getStaffContext():Promise<StaffResult> {
 if(!getAuth()||!process.env.DATABASE_URL)return {status:'unavailable',staff:null};
 try {
  const session=(await getAuth()!.getSession()).data;
  const id=session?.user?.id;
  if(typeof id!=='string'||!uuid.test(id))return {status:'unauthenticated',staff:null};
  const r=await getPool().query<{role:Role}>('SELECT role FROM public.staff_profiles WHERE user_id=$1::uuid AND is_active IS TRUE LIMIT 1',[id]);
  if(!r.rows[0])return {status:'forbidden',staff:null};
  const role=r.rows[0].role;
  if(!['owner','admin','editor','viewer'].includes(role))return {status:'forbidden',staff:null};
  return {status:'ok',staff:{id,role}};
 }catch{return {status:'unavailable',staff:null};}
}
export async function authorize(capability:Capability):Promise<StaffResult>{
 const c=await getStaffContext();if(c.status!=='ok')return c;
 return can(c.staff.role,capability)?c:{status:'forbidden',staff:null};
}
export async function requireStaffCapability(capability:Capability):Promise<Staff|null>{const c=await authorize(capability);return c.status==='ok'?c.staff:null;}
