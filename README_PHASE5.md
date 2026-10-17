# BY SARA — Greenfield Phase 5

**Current status: Development / NO-GO for Production**

Phase 5 adds a secure media-upload implementation, Neon Storage bucket, Preview branch, and safe manual Owner onboarding documentation. It preserves the Phase 4 Next.js storefront and Admin CMS.

## Key deliverables

- `src/app/api/admin/media/route.ts` — authenticated S3 media upload; no public writes, no arbitrary URL attachment.
- `src/lib/media/validation.ts`, `src/lib/media/storage.ts` — image validation and branch-bound S3 client.
- `src/components/admin/MediaManager.tsx` — actual upload UI / disabled state.
- `sql/003_media_dependency_hardening.sql` — database trigger hardening on inserts into published product variants/images; **already applied** to this greenfield main branch, inherited by preview.
- `docs/OWNER_ONBOARDING_PHASE5.md` — secure manual procedure, not executed.
- `docs/MEDIA_STORAGE_PHASE5.md` — scoped credential setup, behavior, limitations.
- `tests/media-phase5.test.mjs`, `tests/e2e/public-smoke.spec.ts` — local and browser smoke checks; browser E2E not yet run.
- `PHASE5_QA_REPORT.md`, `tests.phase5.log` — evidence and limitations.

## Run locally

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Set server-only values in `.env.local` from `.env.example`. Do not paste secrets into ChatGPT, GitHub commits, public web assets, client variables, or logs.

On an approved independently deployed Preview URL:

```bash
E2E_BASE_URL=https://NEW-PREVIEW.example npm run test:e2e
```

Browser binaries and Playwright packages must be installed separately. No trusted live tests were run in this environment because npm could not fetch dependencies.
