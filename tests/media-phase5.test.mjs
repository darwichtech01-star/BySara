import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {detectRasterMime,isImageSizeAllowed,MAX_UPLOAD_BYTES,imageStorageKey,buildPublicObjectUrl} from '../src/lib/media/validation.ts';
const src=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('detects actual image magic bytes and rejects SVG/HTML',()=>{
 assert.equal(detectRasterMime(Uint8Array.of(0xff,0xd8,0xff,1)),'image/jpeg');
 assert.equal(detectRasterMime(Uint8Array.of(137,80,78,71,13,10,26,10)),'image/png');
 assert.equal(detectRasterMime(new TextEncoder().encode('RIFF0000WEBPVP8 ')),'image/webp');
 assert.equal(detectRasterMime(new TextEncoder().encode('<svg onload=alert(1)>')),null);
 assert.equal(detectRasterMime(new TextEncoder().encode('<html>')),null);
});
test('enforces bounded file sizes',()=>{
 assert.equal(isImageSizeAllowed(127),false);assert.equal(isImageSizeAllowed(128),true);
 assert.equal(isImageSizeAllowed(MAX_UPLOAD_BYTES),true);assert.equal(isImageSizeAllowed(MAX_UPLOAD_BYTES+1),false);
});
test('storage key ignores untrusted filenames and cannot escape product path',()=>{
 const id='11111111-1111-4111-8111-111111111111',nonce='22222222-2222-4222-8222-222222222222';
 assert.equal(imageStorageKey(id,nonce),`products/${id}/${nonce}.webp`);
 assert.throws(()=>imageStorageKey('../../legacy',nonce));
});
test('public URL builder pins a Neon storage endpoint',()=>{
 const endpoint='https://br-sweet-brook-b9pcekde.storage.c-7.eu-central-1.aws.neon.tech';
 const k=imageStorageKey('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
 assert.equal(buildPublicObjectUrl(endpoint,'by-sara-v2-product-media',k),`${endpoint}/by-sara-v2-product-media/${k}`);
 assert.throws(()=>buildPublicObjectUrl('https://evil.example', 'by-sara-v2-product-media',k));
});
test('media upload uses server-side role and origin gates, bounded binary processing',()=>{
 const route=src('../src/app/api/admin/media/route.ts');
 assert.match(route,/gate\('media:write',req\)/);
 assert.match(route,/parseLimitedFormData\(req\)/);
 assert.match(route,/detectRasterMime\(input\)/);
 assert.match(route,/sharp\(input/);
 assert.match(route,/rights_reference/);
 assert.match(route,/status!=='draft'/);
 assert.match(route,/FOR UPDATE/);
 assert.match(route,/audit\(client,a\.staff,'media\.upload'/);
});
test('no storage credentials are exposed to browser by Media Manager',()=>{
 const ui=src('../src/components/admin/MediaManager.tsx');
 for(const secret of ['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','NEON_API_KEY','DATABASE_URL'])assert.equal(ui.includes(secret),false);
 assert.match(ui,/form\.append\('rights_attested'/);
});
test('initial Owner onboarding remains manual and restricted',()=>{
 const sql=src('../sql/001_foundation.sql');
 assert.match(sql,/trg_by_sara_guard_owner/);
 const route=src('../src/app/api/admin/route.ts');
 assert.doesNotMatch(route,/owner\.create|owner\.reset|bootstrap/);
});
