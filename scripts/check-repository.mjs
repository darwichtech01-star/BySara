#!/usr/bin/env node
/** Static guardrails; excludes licensed design reference exports and screenshots. */
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();
const included=['src','.github','scripts','sql','tests'];
const blockedProjectIds=[/dark-sea-58234313/i,/br-autumn-poetry-bahfv1h7/i,/hsauqpeaxagnzcvwmltz/i];
const oldDomain=/by-sara-39n41hxic-darwich-tech\.vercel\.app/i;
let examined=0;const errors=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,e.name);if(e.isDirectory()){if(!['node_modules','.git','design-references'].includes(e.name))walk(file);continue;}
 if(!/\.(ts|tsx|js|mjs|json|yaml|yml|sql)$/.test(e.name))continue;
 const data=fs.readFileSync(file,'utf8');examined++;
 for(const regex of blockedProjectIds)if(regex.test(data) && !(file.endsWith('check-repository.mjs')) && !path.relative(root,file).startsWith('tests/'))errors.push(`Historical project ID in ${path.relative(root,file)}`);
 // Negative tests and explicit security deny-lists intentionally contain old domain literals.
 const base=path.relative(root,file).replaceAll('\\','/');
 if(oldDomain.test(data) && !base.startsWith('tests/') && !base.startsWith('scripts/') && base!=='src/lib/runtime-target.ts')errors.push(`Old deployment URL used in ${base}`);
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(data))errors.push(`Private key content in ${path.relative(root,file)}`);
 }}
for(const folder of included)walk(path.join(root,folder));
for(const name of ['.env','.env.local','.env.production','credentials.json'])if(fs.existsSync(path.join(root,name)))errors.push(`Sensitive local file present in source tree: ${name}`);
if(!fs.existsSync(path.join(root,'package-lock.json')))console.warn('NOT VERIFIED: npm lockfile is missing; npm ci / reproducible dependency checks cannot run until generated.');
if(errors.length){errors.forEach(e=>console.error('BLOCKED:',e));process.exitCode=1;}else console.log(`Repository policy scan passed (${examined} source/config files); no old project identifiers or secret files detected.`);
