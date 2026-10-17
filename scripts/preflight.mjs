#!/usr/bin/env node
/** Pure environment preflight. Never print connection strings, auth secrets or passwords. */
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const hosts={
 preview:{database:'ep-silent-rice-b9eftr6y',auth:'ep-silent-rice-b9eftr6y',branch:'br-tiny-water-b9p2xphd'},
 main:{database:'ep-bitter-flower-b9z8sqci',auth:'ep-bitter-flower-b9z8sqci',branch:'br-sweet-brook-b9pcekde'}
};
export function assess(mode,env){
 const failures=[];const check=(cond,reason)=>{if(!cond)failures.push(reason)};
 check(Object.hasOwn(hosts,mode),'Choose preview or main');
 if(!Object.hasOwn(hosts,mode))return failures;
 const target=hosts[mode];
 check(env.BY_SARA_TARGET===mode,'BY_SARA_TARGET must match the selected environment');
 check(typeof env.NEON_AUTH_COOKIE_SECRET==='string'&&env.NEON_AUTH_COOKIE_SECRET.length>=32,'NEON_AUTH_COOKIE_SECRET is missing or short');
 for(const [label,key] of [['DB','DATABASE_URL'],['Neon Auth','NEON_AUTH_BASE_URL'],['Origin','APP_ORIGIN'],['Object Storage','AWS_ENDPOINT_URL_S3']]){
  check(Boolean(env[key]),`${label}: required configuration missing`);
 }
 try{
  const db=new URL(env.DATABASE_URL);const full=`${target.database}.c-7.eu-central-1.aws.neon.tech`;
  check(['postgres:','postgresql:'].includes(db.protocol),'DB URL must be PostgreSQL');
  check(db.hostname===full||db.hostname===`${target.database}-pooler.c-7.eu-central-1.aws.neon.tech`,'DB branch endpoint mismatch');
  check(decodeURIComponent(db.pathname.slice(1))==='bysara_v2','DB name must be bysara_v2');
  check(db.searchParams.get('sslmode')!=='disable','DB TLS cannot be disabled');
 }catch{check(false,'DB URL is invalid');}
 try{
  const auth=new URL(env.NEON_AUTH_BASE_URL);
  check(auth.protocol==='https:' && auth.hostname===`${target.auth}.neonauth.c-7.eu-central-1.aws.neon.tech`&&auth.pathname==='/bysara_v2/auth','Neon Auth endpoint mismatch');
 }catch{check(false,'Neon Auth URL invalid');}
 try{
  const origin=new URL(env.APP_ORIGIN);
  check(origin.protocol==='https:' && !origin.username && !origin.password && !origin.search && !origin.hash && origin.pathname==='/' && !['by-sara.vercel.app','by-sara-39n41hxic-darwich-tech.vercel.app'].includes(origin.hostname),'APP_ORIGIN must be a new HTTPS deployment');
 }catch{check(false,'APP_ORIGIN invalid');}
 try{
  const storage=new URL(env.AWS_ENDPOINT_URL_S3);
  check(storage.protocol==='https:'&&storage.hostname===`${target.branch}.storage.c-7.eu-central-1.aws.neon.tech`,'Neon Storage endpoint mismatch');
 }catch{check(false,'Neon Storage endpoint invalid');}
 check(env.NEON_STORAGE_BRANCH_ID===target.branch,'Neon Storage branch must match database target');
 check(env.AWS_REGION==='eu-central-1','Neon Storage region must be eu-central-1');
 check(Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),'Neon Storage scoped keys must be configured');
 if(mode==='preview')check(env.NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH!=='true','Public customer login must remain disabled until verified');
 return failures;
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1]??'')).href){
 const mode=process.argv[2];const errs=assess(mode,process.env);
 if(errs.length){for(const e of errs)console.error('BLOCKED:',e);process.exitCode=1;}
 else console.log(`Preflight passed for ${mode} (configuration structure only; no live API smoke or deployment verification)`);
}
