import {defineConfig,devices} from '@playwright/test';
/** No production auto-deployment and no stateful/write E2E cases. Use your isolated PREVIEW URL. */
const target=process.env.E2E_BASE_URL;
const candidate=target ? new URL(target) : null;
const approvedHost=process.env.BY_SARA_APPROVED_PREVIEW_HOST;
if(!candidate || !approvedHost || candidate.hostname!==approvedHost || candidate.protocol!=='https:' || !candidate.hostname.startsWith('by-sara-greenfield-2026-') || !candidate.hostname.endsWith('.vercel.app') || candidate.search || candidate.hash || candidate.pathname!=='/')
 throw new Error('E2E_BASE_URL must be a new BY SARA greenfield preview deployment, never the old production');
export default defineConfig({testDir:'tests/e2e',retries:0,workers:2,timeout:30000,use:{baseURL:target,trace:'retain-on-failure'},projects:[{name:'chromium-desktop',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Pixel 7']}}]});
