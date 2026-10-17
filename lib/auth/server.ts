import 'server-only';
import {createNeonAuth} from '@neondatabase/auth/next/server';
import {assertAuthTarget,parseTarget} from '@/lib/runtime-target';

type NeonServer = ReturnType<typeof createNeonAuth>;
let instance: NeonServer|undefined;
export function authIsConfigured():boolean {
 if((process.env.NEON_AUTH_COOKIE_SECRET?.length??0)<32)return false;
 try{assertAuthTarget(process.env.NEON_AUTH_BASE_URL??'',parseTarget(process.env.BY_SARA_TARGET));return true;}catch{return false;}
}
/** Lazy so unconfigured builds fail CLOSED rather than crashing during module import. */
export function getAuth():NeonServer|null {
 if(!authIsConfigured()) return null;
 return instance ??= createNeonAuth({baseUrl:process.env.NEON_AUTH_BASE_URL!, cookies:{secret:process.env.NEON_AUTH_COOKIE_SECRET!,sessionDataTtl:60}});
}
