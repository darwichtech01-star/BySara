# BY SARA Greenfield — Phase 3 QA & Integration Evidence

**Date:** 2026-10-17  
**Target:** new Neon project `lingering-sea-03313730` / branch `br-sweet-brook-b9pcekde` / database `bysara_v2`.  
**Legacy projects:** not touched.

## Verified via connected Neon PostgreSQL

- Created **nine** application tables: `brands`, `categories`, `products`, `product_variants`, `product_images`, `store_public_config`, `store_policies`, `staff_profiles`, `audit_logs`.
- Enabled RLS on all nine application tables; no permissive public policies added. **Caveat:** the privileged server-side database owner may bypass RLS; this is not a substitute for API authorization and least-privilege DB roles.
- Verified publication and protected-Owner guard triggers each present, plus cross-product variant/image FK.
- Current new database has **0** catalog products, **0** image records, **0** contacts, **0** staff records and **0** Neon Auth users.
- Executed the actual public catalog SQL as a read-only query against the new database; returned `[]` without SQL errors.
- No Owner account, password, staff role or production data was created or copied.
- The applied SQL is reflected in `sql/001_foundation.sql`; the production database was initialized through the connected SQL service, with separate follow-up constraint/function verification.

## Implemented in source

- Server-only SQL read adapter for `/api/catalog` selecting approved published products with active priced variants, safety text and verified primary media.
- Public contact endpoint reads only an explicitly published config row, and returns null values when no approved configuration exists.
- Policy page reads only approved published documents and safely renders plain text; missing policies are not invented.
- Database connection checks that the target database is `bysara_v2` before constructing a pool.
- Neon Auth SDK proxy and lazy server-side setup wired; auth UI is **feature-gated OFF** by default until verified configuration is supplied.
- Server-side admin layout and GET boundary verify a Neon Auth session plus an active staff profile and capability. Admin POST remains intentionally disabled.
- Migration includes publication triggers, protected Owner trigger, RLS, FK constraints, and no seeded business or identity records.

## Automated checks run

- Node test suite (`npm test`): **24 passed / 0 failed** (local contract, UI and helper tests).
- TypeScript compiler parser syntax scan: **52 `.ts` and `.tsx` files**, **0 parse errors** (syntax only, not semantic typechecking).
- `npm install`: **NOT RUN SUCCESSFULLY** — npm registry DNS request failed with `EAI_AGAIN`.
- `npm run typecheck`: **NOT RUN / NOT VERIFIED** because dependencies were unavailable.
- `npm run build`: **NOT RUN / NOT VERIFIED** for the same reason.
- Auth cookie/session flows, SMTP/email verification, new Owner onboarding, production RLS user roles, authenticated E2E, and media upload: **NOT VERIFIED**.

## Hard launch blockers

1. Install dependencies and generate reviewed lockfile; pass typecheck and Next build.
2. Configure new Neon `DATABASE_URL` and dedicated strong `NEON_AUTH_COOKIE_SECRET` server-side; verify Auth proxy and first-owner setup manually with approved identity.
3. Implement granular CRUD authorization and audit mutations (Phase 4) before opening Admin write actions.
4. Configure secure storage upload with authorization; import only rights-approved catalog records and approved contact/policy content.
5. Verify release in a **new** Vercel project (new project creation was previously denied 403 by connector); no old project reuse.
6. Run negative RBAC tests, full E2E, mobile/RTL, accessibility and production smoke checks.

**Release decision: NO-GO (foundation, not production launch).**
