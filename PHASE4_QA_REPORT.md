# BY SARA — Phase 4 Engineering QA Report

**Date:** 2026-10-17  
**Scope:** Greenfield Next.js 15 / TypeScript Phase 4 — Products CMS, taxonomy, inventory adjustments, audited RBAC foundation.  
**Intended database:** **NEW** Neon `lingering-sea-03313730` / `bysara_v2` only.  
**Production Release:** **NO-GO** — development handoff only.

## 1. Verified Neon changes (live operations, new project only)

- Auth integration was provisioned in Phase 1–3; no user/Owner created.
- `sql/001_foundation.sql` remains applied from Phase 3 (nine tables plus publication and Owner guards).
- In Phase 4, applied `sql/002_admin_operations.sql` statements one at a time using Neon read/write action **to the new database only**: stock movements table, related index, RLS enablement and public-grant revocations.
- Verified with a real query: `public.stock_movements` table exists, RLS is `true`, row count `0`. Before Phase 4 the new application had nine app tables; it now has **ten**.
- No product, image, SKU, inventory adjustment, Auth user or staff profile was seeded. No existing BY SARA legacy resource was modified.

## 2. Code delivered

| Surface | Status | Boundary |
|---|---|---|
| Admin access | Implemented, unverified in live login | Neon Auth session + new project's active staff profile per request; no email/role claims from UI |
| Admin navigation | Implemented | Links filtered by server-resolved role |
| Product list/create Draft | Implemented | Server-gated read/write; SQL transactions; audit |
| Edit product descriptive fields | Implemented | Published product must first be unpublished and reviewed |
| Publish/verification | Implemented with gates | Owner/Admin capability, evidence note, DB publication trigger; **not yet E2E verified** |
| Brands & categories | Read/create implemented | Owner/Admin only for writes |
| SKU / variants | Create implemented | Exact SKU, verified USD price, inventory intake notes, audit |
| Inventory adjustments | Implemented | Expected-before concurrency check, transaction, `stock_movements`, audit |
| Image gallery | Read-only | No object storage upload/association until secure integration |
| Security / audit | Owner-only read | Redacts sensitive free-text notes |
| Staff management | Not implemented | No account creation/change API by design |
| Business settings, policies, promotions, inquiries | Deferred | Separate later integration milestones |

## 3. Actual tests run

- **35 / 35** Node test cases passed using `npm test` on the Phase 4 directory, including prior storefront assertions, capability-policy negative checks, security-boundary contract assertions and transactional/audit source contracts.
- **66 / 66 TypeScript/TSX files parsed successfully** using TypeScript's parser from the locally installed global TypeScript 5.8.3. This confirms syntax only, **not type correctness**.
- Database migration and table/RLS/empty-state queries confirmed live on NEW Neon.
- `npm install --prefer-offline --no-audit --no-fund --fetch-timeout=6000 --fetch-retries=0` **failed with `EAI_AGAIN`**: `registry.npmjs.org` could not be resolved.
- `npm run typecheck` and `npm run build`: **NOT VERIFIED**, because project dependencies could not be installed.
- Authenticated create/update/publish, real session cookies, CSRF reverse-proxy behavior, database rollback, permission denial, media storage, uploads, and browser/mobile E2E tests: **NOT RUN**. Contract tests do not substitute for these runtime tests.

## 4. Blockers and mitigations

**P0 — new Owner not onboarded:** Neon Auth has no authorized Owner. Use `docs/OWNER_BOOTSTRAP.md` with a real verified identity and explicit approval. Never copy old accounts or use invented passwords.

**P0 — no verified live authentication:** Verify provider redirects/cookies and per-route 401/403 behavior after deployment to isolated Preview. `APP_ORIGIN` must match the new production HTTPS origin before enabling mutation endpoints.

**P0 — npm/build not verified:** Run `npm install`, `npm run typecheck`, `npm test`, `npm run build` on developer machine or CI with npm registry access. Resolve actual issues before any release approval.

**P0 — secure media upload not implemented:** Current media UI/API intentionally read-only; `/api/admin/media` POST returns 501. Build signed upload, object validation, ownership checks, and verified image association before commercial launch.

**P0 — no approved business records:** Catalog, contact configuration, owner/roles and legal policies are empty. No fake data is seeded. Only verified merchant information may be added.

**P1 — SQL role minimization:** RLS on tables with an owner-level server connection does not automatically enforce staff RBAC. Restrict Vercel env privileges, apply least-privileged SQL roles and defense in depth after tests.

**P1 — concurrency/cross-table publishing:** Run genuine PostgreSQL integration tests on a disposable branch to validate publish-guard behavior during concurrent image, variant and inventory operations.

**P1 — audit reliability:** Confirm audit rows and stock movements are written for both success and failure paths, including transaction rollback, with authenticated users.

## 5. Acceptance for Phase 5

- Verified app starts/builds with complete dependency lockfile and clean TypeScript checks.
- Exactly one new authorized Owner linked by an audited identity-controlled bootstrap.
- Real server-side auth & role denial tested for viewer/editor/admin/owner and anonymous actors.
- Secure Neon Object Storage upload and association implemented and tested.
- Product drafting, variant intake, stock reconciliation, media publishing and catalog visibility tested on a temporary Neon development branch and Vercel Preview.
- No changes to historical BY SARA Neon/Vercel infrastructure.
