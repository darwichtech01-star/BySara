import {test} from 'node:test';import assert from 'node:assert/strict';
import {validatePreviewURL} from '../scripts/check-preview-url.mjs';
test('new preview URL accepted',()=>assert.equal(validatePreviewURL('https://by-sara-greenfield-2026-git-develop-team.vercel.app'),true));
test('old production excluded',()=>assert.equal(validatePreviewURL('https://by-sara.vercel.app'),false));
test('http and unrelated host excluded',()=>{assert.equal(validatePreviewURL('http://by-sara-greenfield-2026-a.vercel.app'),false);assert.equal(validatePreviewURL('https://some-other-site.vercel.app'),false)});
test('URLs with query credentials excluded',()=>assert.equal(validatePreviewURL('https://by-sara-greenfield-2026-a.vercel.app/?token=xyz'),false));
