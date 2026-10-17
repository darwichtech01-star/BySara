import 'server-only';
import {NextRequest,NextResponse} from 'next/server';
import type {PoolClient} from 'pg';
import {getPool} from '@/lib/db';
import {authorize,type Staff} from '@/lib/server/staff';
import type {Capability} from '@/lib/authorization';
import {assertAppOrigin} from '@/lib/runtime-target';
export const noCache={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export class InputError extends Error {constructor(message:string){super(message);this.name='InputError';}}
export function text(input:unknown,label:string,max=300):string {
 if(typeof input!=='string'||!input.trim()||input.length>max)throw new InputError(`${label} is required (max ${max} characters)`);
 return input.trim();
}
export function optionalText(input:unknown,label:string,max=2000):string|null {
 if(input===null||input===undefined||input==='')return null;
 if(typeof input!=='string'||input.length>max)throw new InputError(`${label} must be text (max ${max} characters)`);
 return input.trim()||null;
}
export function identifier(input:unknown,label='ID'):string {if(typeof input!=='string'||!uuid.test(input))throw new InputError(`Invalid ${label}`);return input;}
export function slugValue(input:unknown):string{const value=text(input,'Slug',90);if(!slug.test(value))throw new InputError('Slug must be lowercase with hyphens');return value;}
export function count(input:unknown,label='Quantity'):number{
 if(typeof input!=='number'||!Number.isSafeInteger(input)||input<0||input>1000000)throw new InputError(`Invalid ${label}`);return input;
}
export function usd(input:unknown):number|null {
 if(input===null||input===undefined||input==='')return null;
 if(typeof input!=='number'||!Number.isFinite(input)||input<=0||input>1000000||Math.abs(Math.round(input*100)-input*100)>1e-6)throw new InputError('Price must be positive USD with at most two decimals');return input;
}
export function bool(input:unknown,label:string):boolean{if(typeof input!=='boolean')throw new InputError(`${label} must be true or false`);return input;}
export function json(body:unknown):Record<string,unknown>{if(!body||typeof body!=='object'||Array.isArray(body))throw new InputError('Expected a JSON object');return body as Record<string,unknown>}
export function onlyKeys(v:Record<string,unknown>,allowed:string[]):void{for(const key of Object.keys(v))if(!allowed.includes(key))throw new InputError('Unexpected field: '+key);}
export async function body(req:NextRequest):Promise<Record<string,unknown>>{
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new InputError('Content-Type must be application/json');
 const raw=await req.text();if(raw.length>20000)throw new InputError('Request too large');
 try{return json(JSON.parse(raw));}catch(e){if(e instanceof InputError)throw e;throw new InputError('Invalid JSON');}
}
export function csrf(req:NextRequest):boolean{
 const origin=req.headers.get('origin');if(!origin)return false;
 try{
  if(process.env.NODE_ENV==='production'&&!process.env.APP_ORIGIN)return false;
  if(process.env.NODE_ENV==='production')assertAppOrigin(process.env.APP_ORIGIN??'');
  const caller=new URL(origin), actual=new URL(req.url), expected=process.env.APP_ORIGIN?new URL(process.env.APP_ORIGIN):actual;
  return caller.origin===expected.origin && (caller.protocol==='https:' || (process.env.NODE_ENV!=='production' && caller.protocol==='http:'));
 }catch{return false;}
}
export async function gate(capability:Capability,req?:NextRequest):Promise<{staff:Staff;error:null}|{staff:null;error:NextResponse}> {
 const result=await authorize(capability);
 if(result.status!=='ok'){
  const status=result.status==='unauthenticated'?401:result.status==='forbidden'?403:503;
  return {staff:null,error:NextResponse.json({error:result.status},{status,headers:noCache})};
 }
 if(req && !csrf(req))return {staff:null,error:NextResponse.json({error:'Origin verification failed'},{status:403,headers:noCache})};
 return {staff:result.staff,error:null};
}
export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>{
 const client=await getPool().connect();try{await client.query('BEGIN');const result=await fn(client);await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK').catch(()=>{});throw e;}finally{client.release()}
}
export async function audit(client:PoolClient,staff:Staff,operation:string,entity:string,id:string,summary:Record<string,unknown>):Promise<void>{
 await client.query(`INSERT INTO public.audit_logs(actor_id,operation,entity_type,entity_id,change_summary) VALUES($1::uuid,$2,$3,$4,$5::jsonb)`,[staff.id,operation,entity,id,JSON.stringify(summary)]);
}
export function errorResponse(e:unknown):NextResponse{
 if(e instanceof InputError)return NextResponse.json({error:e.message},{status:400,headers:noCache});
 const x=e as {code?:string,message?:string};
 if(x.code==='23505')return NextResponse.json({error:'Duplicate SKU, slug, or primary image'},{status:409,headers:noCache});
 if(x.code==='23503')return NextResponse.json({error:'Related record not found or still referenced'},{status:409,headers:noCache});
 if(x.code==='23514'||x.message?.startsWith('PUBLISH_BLOCKED'))return NextResponse.json({error:'Business validation blocked the change'},{status:422,headers:noCache});
 // Details are intentionally not returned (SQL, paths, provider secrets and customer data).
 return NextResponse.json({error:'Operation unavailable; no success has been recorded'},{status:503,headers:noCache});
}
