#!/usr/bin/env node
import {fileURLToPath} from 'node:url';
export function validatePreviewURL(input){
 let u;try{u=new URL(input)}catch{return false;}
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')return false;
 if(!u.hostname.endsWith('.vercel.app'))return false;
 // A separate, newly created deployment, not historical BY SARA and not the production alias.
 if(['by-sara.vercel.app','by-sara-39n41hxic-darwich-tech.vercel.app'].includes(u.hostname))return false;
 return u.hostname.startsWith('by-sara-greenfield-2026-');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(!validatePreviewURL(process.env.E2E_BASE_URL)){console.error('BLOCKED: preview E2E URL is not a new isolated BY SARA preview deployment');process.exitCode=1;}
 else console.log('Preview URL matches the expected new-project hostname pattern. Verify deployment-to-branch mapping separately.');
}
