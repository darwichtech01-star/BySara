/** BY SARA greenfield environment binding. No secret values are exposed to the client. */
export type TargetEnvironment='main'|'preview';
const targets={
 main:{branch:'br-sweet-brook-b9pcekde',dbHost:'ep-bitter-flower-b9z8sqci',authHost:'ep-bitter-flower-b9z8sqci',storageHost:'br-sweet-brook-b9pcekde'},
 preview:{branch:'br-tiny-water-b9p2xphd',dbHost:'ep-silent-rice-b9eftr6y',authHost:'ep-silent-rice-b9eftr6y',storageHost:'br-tiny-water-b9p2xphd'}
} as const;
export function parseTarget(value:unknown):TargetEnvironment{
 if(value==='main'||value==='preview')return value;
 throw new Error('BY_SARA_TARGET must explicitly select main or preview');
}
export function getTarget(value:unknown=process.env.BY_SARA_TARGET){return targets[parseTarget(value)];}
export function assertDatabaseTarget(connectionString:string,target:TargetEnvironment):void{
 let url:URL;
 try{url=new URL(connectionString);}catch{throw new Error('Invalid PostgreSQL URL');}
 const host=targets[target].dbHost;
 const hostnames=[`${host}.c-7.eu-central-1.aws.neon.tech`,`${host}-pooler.c-7.eu-central-1.aws.neon.tech`];
 if(!['postgres:','postgresql:'].includes(url.protocol)||decodeURIComponent(url.pathname.slice(1))!=='bysara_v2'||!hostnames.includes(url.hostname))
  throw new Error('BY SARA greenfield PostgreSQL target mismatch');
 if(url.searchParams.get('sslmode')==='disable')throw new Error('PostgreSQL TLS must not be disabled');
}
export function assertAuthTarget(baseUrl:string,target:TargetEnvironment):void{
 let url:URL;try{url=new URL(baseUrl);}catch{throw new Error('Invalid Neon Auth URL');}
 if(url.protocol!=='https:'||url.hostname!==`${targets[target].authHost}.neonauth.c-7.eu-central-1.aws.neon.tech`||url.pathname!=='/bysara_v2/auth'||url.username||url.password||url.search||url.hash)
  throw new Error('BY SARA greenfield Neon Auth target mismatch');
}
export function assertStorageTarget(endpoint:string,branch:string,target:TargetEnvironment):void{
 let url:URL;try{url=new URL(endpoint);}catch{throw new Error('Invalid Neon Storage URL');}
 if(branch!==targets[target].branch||url.protocol!=='https:'||url.hostname!==`${targets[target].storageHost}.storage.c-7.eu-central-1.aws.neon.tech`||url.pathname!=='/'||url.search||url.hash||url.username||url.password)
  throw new Error('BY SARA greenfield media branch mismatch');
}
export function assertAppOrigin(origin:string):void{
 let url:URL;try{url=new URL(origin);}catch{throw new Error('Invalid APP_ORIGIN');}
 if(url.protocol!=='https:'||url.hostname==='by-sara.vercel.app'||url.hostname==='by-sara-39n41hxic-darwich-tech.vercel.app'||url.username||url.password||url.search||url.hash||url.pathname!=='/')
  throw new Error('APP_ORIGIN must be a dedicated new HTTPS site');
}
