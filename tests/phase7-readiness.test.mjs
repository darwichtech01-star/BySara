import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyProbe,validateApprovedPreview,runReadOnlyProbes} from '../scripts/preview-readiness.mjs';
const hostname='by-sara-greenfield-2026-git-test-darwich-tech.vercel.app';
const origin='https://'+hostname;
const headers={'content-type':'application/json'};
test('preview requires an exact host allowlist, not just plausible name',()=>{
 assert.equal(validateApprovedPreview(origin,hostname),true);
 assert.equal(validateApprovedPreview(origin,hostname.replace('darwich-tech','other')),false);
 assert.equal(validateApprovedPreview('https://by-sara.vercel.app','by-sara.vercel.app'),false);
 assert.equal(validateApprovedPreview(origin+'/admin',hostname),false);
 assert.equal(validateApprovedPreview(origin+'/?secret=x',hostname),false);
 assert.equal(validateApprovedPreview('http://'+hostname,hostname),false);
});
test('denied admin is verified only with 401/403, never with 503 or 200',()=>{
 for(const code of [401,403])assert.equal(classifyProbe({kind:'admin'},code,'{}',headers).ok,true);
 for(const code of [200,302,503])assert.equal(classifyProbe({kind:'admin'},code,'{}',headers).ok,false);
});
test('catalog must be connected, not simply empty because unavailable',()=>{
 assert.equal(classifyProbe({kind:'catalog'},200,JSON.stringify({status:'ready',items:[]}),headers).ok,true);
 assert.equal(classifyProbe({kind:'catalog'},200,JSON.stringify({status:'not-configured',items:[]}),headers).ok,false);
 assert.equal(classifyProbe({kind:'catalog'},503,JSON.stringify({status:'unavailable',items:[]}),headers).ok,false);
});
test('health cannot falsely claim operational when unverified',()=>{
 assert.equal(classifyProbe({kind:'health'},200,JSON.stringify({service:'by-sara-greenfield',status:'unverified'}),headers).ok,true);
 assert.equal(classifyProbe({kind:'health'},200,JSON.stringify({service:'by-sara-greenfield',status:'operational'}),headers).ok,false);
});
test('all live requests are GET, no redirects, no authorization headers',async()=>{
 const seen=[];
 const fakeFetch=async(url,options)=>{
  seen.push({path:new URL(url).pathname,method:options.method,redirect:options.redirect,headers:options.headers});
  const path=new URL(url).pathname;
  const admin=path.startsWith('/api/admin');
  const content=admin?'{}':path==='/api/catalog'?JSON.stringify({status:'ready',items:[]}):path==='/api/health'?JSON.stringify({service:'by-sara-greenfield',status:'foundation-only'}):path==='/api/store-config'?JSON.stringify({status:'not-configured'}):'<html>BY SARA</html>';
  return {status:admin?403:200,headers:{get:()=>path.startsWith('/api/')?'application/json':'text/html'},text:async()=>content};
 };
 const result=await runReadOnlyProbes(origin,hostname,fakeFetch);
 assert.equal(result.failed,0);assert.equal(seen.length,8);
 assert(seen.every(x=>x.method==='GET'&&x.redirect==='manual'&&!('Authorization' in x.headers)));
});
test('any denied/failed API makes smoke fail, not silently pass',async()=>{
 const f=async()=>({status:503,headers:{get:()=>''},text:async()=>'{"status":"unavailable"}'});
 const r=await runReadOnlyProbes(origin,hostname,f);assert.equal(r.failed,8);
});
