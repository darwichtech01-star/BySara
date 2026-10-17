# BY SARA — Phase 5 Engineering QA — 17 October 2026

## Scope

Greenfield project only. Old BY SARA Neon and Vercel projects were left unchanged. This is a **code & schema milestone**, NOT evidence of launch readiness.

### Live Neon greenfield inspection

- Project `lingering-sea-03313730`, database `bysara_v2`, main `br-sweet-brook-b9pcekde`.
- Neon Storage enabled, regional S3 endpoint present.
- Created `by-sara-v2-product-media` bucket with `public_read`, not public_write.
- Created independent `phase5-preview` branch `br-tiny-water-b9p2xphd`, verified READY with inherited bucket.
- Added DB trigger protections on `product_variants` and `product_images` INSERTs affecting published products.
- No products, images, staff, Owner, or Auth users were created.

### Code implemented

- Signed-in/authorized server-side media POST requires `media:write` and same-origin request.
- Bounded multipart processing, actual image magic-byte detection, robust Sharp decode and normalization to stripped WebP.
- Draft-only target, verified variant/product relation, 12 images maximum per product, no duplicate primary image.
- Rights attestation with reference and dedicated Audit event; statement is an operator attestation, NOT independent legal verification.
- Upload from server-only branch-scoped Neon S3 credentials, DB image + audit transaction, best-effort orphan cleanup.
- New Media Manager UI with upload form, consent and explicit disabled state when credentials absent.
- Owner onboarding runbook includes verified-email identity and manual bootstrap instructions, but **no Owner has been created**.
- Playwright smoke tests are written for a future isolated HTTPS Preview but **not executed**.

### Verification

- `node --experimental-strip-types --test tests/*.test.mjs` — **42 passed / 0 failed**, details in `tests.phase5.log` (local contract/logic tests only).
- Global TypeScript transpilation syntax check: **68 TS/TSX files / 0 parse diagnostics**; this is NOT a complete `tsc` typecheck.
- SQL schema, trigger and Storage configuration inspected via connected Neon read operations.
- New Preview branch checked; contains no seeded product or staff data.
- Npm dependency installation timed out. `next build`, `tsc --noEmit`, real upload to S3, Neon Auth session tests, Owner onboarding, authenticated CRUD E2E, and Playwright browser runs remain **NOT RUN / UNVERIFIED**.

### Security/operational conditions before production

1. Generate restricted, branch-specific Storage credentials **out of band** and put them only in the new server deployment environment.
2. Confirm actual image upload, rendering/public read, correct region/bucket, error behavior and orphan reconciliation using authorized Preview identities.
3. Configure new Neon Auth and email verification, sign-in, recovery, restricted trusted origins and session expiry; provision Owner only with explicit approval.
4. Run TypeScript, Build, tests, and Playwright on the Preview branch (no production writes).
5. Add Vercel project, GitHub repository and secrets only under newly created project names after access is available.
6. Define content review policy for product rights and publication; do not publish products with unverified data.
7. Add rate limiting, WAF/abuse prevention and request logging while protecting private logs and PII.
8. Production release decision is **NO-GO** pending above evidence.
