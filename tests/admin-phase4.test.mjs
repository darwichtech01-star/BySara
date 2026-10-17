import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {can,capabilitiesFor} from '../src/lib/authorization.ts';
const read=(f)=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const api='src/app/api/admin/';
test('No roleless, customer or viewer write access',()=>{for(const role of [null,'viewer'])for(const cap of ['catalog:write','catalog:publish','inventory:adjust','media:write','staff:manage','taxonomy:write'])assert.equal(can(role,cap),false)});
test('Editor can draft but cannot publish, alter inventory or media',()=>{assert.equal(can('editor','catalog:write'),true);for(const c of ['catalog:publish','inventory:adjust','media:write','audit:read'])assert.equal(can('editor',c),false)});
test('Admin cannot elevate staff or inspect restricted audit',()=>{assert.equal(can('admin','staff:manage'),false);assert.equal(can('admin','audit:read'),false);assert.equal(can('admin','inventory:adjust'),true)});
test('Owner includes needed capabilities but role is not auto-seeded',()=>{assert.equal(capabilitiesFor('owner').includes('staff:manage'),true);assert.doesNotMatch(read('sql/002_admin_operations.sql'),/INSERT\s+INTO\s+public\.staff_profiles/i)});
test('Every mutation API enforces capability and same-origin',()=>{
 for(const [file,cap] of [['products/route.ts','catalog:write'],['products/[id]/route.ts','catalog:write'],['variants/route.ts','catalog:write'],['inventory/route.ts','inventory:adjust'],['taxonomy/route.ts','taxonomy:write'],['media/route.ts','media:write']]){const s=read(api+file);assert.match(s,new RegExp(`gate\\('${cap.replace(':','\\:')}',req\\)`),file)}
 const guard=read('src/lib/server/admin-api.ts');assert.match(guard,/Origin verification failed/);assert.match(guard,/APP_ORIGIN/);assert.match(guard,/NODE_ENV==='production'/);
});
test('Resource mutations commit business and audit changes in one SQL transaction',()=>{
 for(const file of ['products/route.ts','products/[id]/route.ts','variants/route.ts','taxonomy/route.ts','inventory/route.ts']){const s=read(api+file);assert.match(s,/transaction\(async client=>/);assert.match(s,/await audit\(/)}
 const helper=read('src/lib/server/admin-api.ts');for(const tok of ["client.query('BEGIN')","client.query('COMMIT')","client.query('ROLLBACK')"])assert.ok(helper.includes(tok));
});
test('Inventory update requires expected old quantity and stock movement',()=>{let s=read(api+'inventory/route.ts');for(const token of ['expected_before_qty','SELECT stock_qty,product_id','FOR UPDATE','INSERT INTO public.stock_movements','Inventory changed'])assert.ok(s.includes(token));});
test('Published content cannot be rewritten silently; publication requires review note',()=>{const s=read(api+'products/[id]/route.ts');assert.match(s,/Unpublish and re-review/);assert.match(s,/verification_note/);assert.match(read('sql/001_foundation.sql'),/by_sara_guard_publish/)});
test('Media uploads are fail-closed without scoped storage credentials',()=>{assert.match(read(api+'media/route.ts'),/mediaStorageReady/);assert.match(read(api+'media/route.ts'),/status:503/);assert.match(read(api+'media/route.ts'),/gate\('media:write',req\)/)});
test('New stock movements have RLS and a database-audited actor',()=>{const s=read('sql/002_admin_operations.sql');assert.match(s,/ENABLE ROW LEVEL SECURITY/);assert.match(s,/neon_auth\."user"/);assert.match(s,/CHECK\(before_qty <> after_qty\)/)});
test('Admin navigation is role-filtered on the server',()=>{const s=read('src/components/AdminLayout.tsx');assert.match(s,/getStaffContext/);assert.match(s,/can\(role,r.capability\)/)});
