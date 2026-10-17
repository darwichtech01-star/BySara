#!/usr/bin/env node
/** Read-only HTTPS smoke test for an explicitly approved, isolated BY SARA preview.
 * Never writes product/user/stock data; never sends credentials; never follows redirects.
 */
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {validatePreviewURL} from './check-preview-url.mjs';
const probes=[
 {path:'/',kind:'html',name:'Homepage'},
 {path:'/shop',kind:'html',name:'Shop'},
 {path:'/account',kind:'html',name:'Account'},
 {path:'/api/health',kind:'health',name:'Health disclosure'},
 {path:'/api/catalog',kind:'catalog',name:'Catalog API'},
 {path:'/api/store-config',kind:'config',name:'Store configuration'},
 {path:'/api/admin',kind:'admin',name:'Unauthenticated admin denial'},
 {path:'/api/admin/media',kind:'admin',name:'Unauthenticated media denial'},
];
export function validateApprovedPreview(input,approvedHost){
 if(!validatePreviewURL(input)||typeof approvedHost!=='string'||!approvedHost.trim())return false;
 try {const u=new URL(input);return u.hostname===approvedHost&&u.hostname.toLowerCase()===approvedHost;} catch {return false;}
}
export function classifyProbe(probe,status,body,headers){
 if(status>=300&&status<400)return {ok:false,reason:'Redirect detected; no redirects are trusted in an unauthenticated smoke'};
 if(probe.kind==='admin')return {ok:status===401||status===403,reason:status===503?'Authorization service is unavailable, not verified':`HTTP ${status}`};
 if(status!==200)return {ok:false,reason:`Expected HTTP 200, got ${status}`};
 if(probe.kind==='html')return {ok:headers['content-type']?.includes('text/html')&&body.includes('BY SARA'),reason:'Missing HTML content or BY SARA identity'};
 let j;try{j=JSON.parse(body)}catch{return {ok:false,reason:'API returned invalid JSON'}}
 if(probe.kind==='health')return {ok:j.service==='by-sara-greenfield'&&j.status!=='healthy'&&j.status!=='operational',reason:'Health endpoint must be truthful; no unverified uptime assertion'};
 if(probe.kind==='catalog')return {ok:Array.isArray(j.items)&&j.status==='ready',reason:j.status==='not-configured'?'Catalog not connected to DB':`Invalid catalog state ${String(j.status)}`};
 if(probe.kind==='config')return {ok:typeof j.status==='string'&&j.status!=='unavailable',reason:'Store config unavailable'};
 return {ok:false,reason:'Unknown probe type'};
}
export async function runReadOnlyProbes(origin,approvedHost,request=fetch){
 if(!validateApprovedPreview(origin,approvedHost))throw new Error('Preview URL must match the exact pre-approved Vercel hostname');
 const checks=[];
 for(const probe of probes){
  let result;
  try {
   const response=await request(new URL(probe.path,origin),{method:'GET',redirect:'manual',signal:AbortSignal.timeout(10000),headers:{Accept:probe.kind==='html'?'text/html':'application/json'}});
   const raw=await response.text();
   const body=raw.slice(0,400000);
   result=classifyProbe(probe,response.status,body,{'content-type':response.headers.get('content-type')??''});
   result={...result,status:response.status};
  }catch(e){result={ok:false,reason:e instanceof Error?e.name:'Network error',status:null};}
  checks.push({name:probe.name,path:probe.path,pass:result.ok,status:result.status??null,detail:result.ok?'Verified':result.reason});
 }
 return {preview:origin,read_only:true,checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length};
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1]??'')).href){
 const origin=process.env.E2E_BASE_URL??'';
 const approvedHost=process.env.BY_SARA_APPROVED_PREVIEW_HOST??'';
 try{
  const report=await runReadOnlyProbes(origin,approvedHost);
  for(const row of report.checks)console.log(`${row.pass?'PASS':'BLOCKED'} ${row.name}: ${row.status??'NETWORK'} — ${row.detail}`);
  console.log(`Read-only Preview: ${report.passed}/${report.checks.length} passed. This does NOT authorize production launch.`);
  if(report.failed)process.exitCode=1;
 }catch(e){console.error('BLOCKED:',e.message);process.exitCode=1;}
}
