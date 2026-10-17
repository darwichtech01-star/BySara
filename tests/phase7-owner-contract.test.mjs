import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(name)=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Owner bootstrap remains manual, fails on placeholder and requires verified unbanned Neon Auth identity',()=>{
 const sql=read('sql/0002_owner_bootstrap_MANUAL_ONLY.sql');
 assert.match(sql,/ABORT: Replace placeholder/);
 assert.match(sql,/"emailVerified" IS TRUE/);
 assert.match(sql,/COALESCE\(banned,false\) IS FALSE/);
 assert.match(sql,/Active Owner already exists/);
 assert.match(sql,/current_database\(\)<>'bysara_v2'/);
 assert.doesNotMatch(sql,/DELETE\s+FROM\s+neon_auth/i);
});
test('staff auth is gated independently of disabled customer auth',()=>{
 const env=read('.env.example');
 const staff=read('src/components/admin/StaffSignIn.tsx');
 const customer=read('src/components/store/AccountAuthForm.tsx');
 assert.match(env,/NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH=false/);
 assert.match(env,/NEXT_PUBLIC_ENABLE_STAFF_LOGIN=false/);
 assert.match(staff,/NEXT_PUBLIC_ENABLE_STAFF_LOGIN/);
 assert.match(customer,/NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH/);
 assert.doesNotMatch(staff,/signUp|register\(/);
});
test('admin layout routes denied users to dedicated staff sign-in',()=>{
 const layout=read('src/app/admin/layout.tsx');
 assert.match(layout,/href="\/staff-login"/);
 assert.match(layout,/requireStaffCapability\('catalog:read'\)/);
});
test('read-only Preview workflow checks approved hostname before installing browsers',()=>{
 const file=read('.github/workflows/preview-e2e.yml');
 const smoke=file.indexOf('node scripts/preview-readiness.mjs');
 const browser=file.indexOf('playwright install');
 assert(smoke>=0&&browser>smoke);
 assert.match(file,/BY_SARA_APPROVED_PREVIEW_HOST/);
 assert.doesNotMatch(file,/deploy-to-production|production-deploy|vercel --prod/i);
});
