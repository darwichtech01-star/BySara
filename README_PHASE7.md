# BY SARA — Phase 7: Preview verification & controlled first Owner onboarding

**Status: LOCAL CODE/READ-ONLY CLOUD AUDIT COMPLETED; LIVE DEPLOYMENT BLOCKED; PRODUCTION NO-GO.**

This is an additive phase on the independent Next.js/TypeScript greenfield app. It does **not** reuse the prior `by-sara` Vercel deployment or the old Neon project. No credentials are embedded, no Owner is created, and no real customer/product records are seeded.

## What changed

- Introduced `scripts/preview-readiness.mjs`: dependency-free, read-only HTTPS smoke against a separately approved exact Preview hostname, checking public pages, catalog/config health and meaningful unauthenticated 401/403 denials. Rejects broken services (503), redirects, and unapproved hostnames. No mutation calls.
- Updated the GitHub manual Preview E2E workflow: require approved hostname in `by-sara-preview` environment, fail on preflight problems, only then install dependencies/browser and run Playwright.
- Added a separately gated staff sign-in route `/staff-login`, independent from disabled customer registration. Default `NEXT_PUBLIC_ENABLE_STAFF_LOGIN=false`.
- Added an **unexecuted** Owner bootstrap SQL template with placeholder UUID, verified-email check, ban check and active-Owner collision protection.
- Updated Admin denial navigation and stricter Playwright denial criteria (503 fails, never counts as a valid denial).
- Added QA unit tests, release evidence checklist, and step-by-step handoff for creating a new private GitHub repository and new Vercel project.

## Commands (on a machine that can reach npm)

```bash
npm install --package-lock-only
npm ci
npm run check:repository
npm test
npm run typecheck
npm run build
```

Then, **only after the new Vercel project exists, exact Preview hostname is approved, and public Preview APIs are connected**:

```bash
export E2E_BASE_URL='https://<new-approved-vercel-preview-hostname>'
export BY_SARA_APPROVED_PREVIEW_HOST='<exact-new-approved-vercel-preview-hostname>'
npm run smoke:preview
npm run test:e2e
```

Do not literally use angle-bracket placeholders in environment variables. Do not use the old BY SARA production domain.

## Preview and Owner prerequisites

Read `docs/PHASE7_PREVIEW_SETUP.md`, `docs/PHASE7_OWNER_ACTIVATION.md` and `docs/PHASE7_RELEASE_EVIDENCE_TEMPLATE.md` in that order. The Owner onboarding script is not part of automated migrations; running it requires explicit approval and confirmed identity.

## Cloud facts verified read-only (17 Oct 2026)

- New Neon project: `lingering-sea-03313730` / `by-sara-greenfield-2026`.
- `main` branch: `br-sweet-brook-b9pcekde`, preview branch: `br-tiny-water-b9p2xphd`; database `bysara_v2`.
- Each branch: 10 application tables, 0 Auth users, 0 staff Owners, 0 Draft or Published products, 0 media rows and 0 audit events.
- Preview Neon Auth trusted domains: none configured.
- GitHub repository `darwichtech01-star/BySara`: connected; all integration work is on `phase7-integration` and `main` remains unchanged.
- New Vercel project `by-sara-greenfield-2026`: not found; earlier create attempt returned permission 403.

These are infrastructure facts, not a claim of successful login or operating Preview.

## GitHub CI integration update — 17 Oct 2026

- Corrected Next.js App Router / `.github/workflows` repository paths on `phase7-integration`.
- Aligned Next.js to `^16.0.0` because Neon Auth `0.6.0-beta` requires Next 16+ (npm peer dependency resolution).
- Fixed Neon Auth GET/POST proxy route context typing for Next 16.
- GitHub Actions quality gates now run for `phase7-integration`. Source checks (67 tests), TypeScript and production build passed in run https://github.com/darwichtech01-star/BySara/actions/runs/38989343486.
- A Node 22 runner successfully generated and committed `package-lock.json` on the integration branch. The next quality gate is a clean **npm ci** run using that committed lockfile, followed by typecheck and build.
- Vercel project creation `by-sara-greenfield-2026` still denied by Vercel team permissions (403). No new deployment or Owner account was created.
- **Production remains NO-GO.** A successful build does not prove Neon Auth session behavior, storage uploads, or live Playwright E2E.
