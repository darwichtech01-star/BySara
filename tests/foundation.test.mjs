import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('server-only database boundary',()=>assert.match(fs.readFileSync('src/lib/db.ts','utf8'),/server-only/));
test('generic admin mutation endpoint is closed',()=>assert.match(fs.readFileSync('src/app/api/admin/route.ts','utf8'),/status:405/));
test('no dummy inventory or product catalog',()=>assert.match(fs.readFileSync('src/app/api/catalog/route.ts','utf8'),/items:\[\]/));
test('official design tokens',()=>assert.match(fs.readFileSync('src/styles/tokens.css','utf8'),/#3B1024/));
