# PHASE 5 IS CURRENT

For current Phase 5 status and run instructions see [README_PHASE5.md](README_PHASE5.md), [PHASE5_QA_REPORT.md](PHASE5_QA_REPORT.md), and [docs/MEDIA_STORAGE_PHASE5.md](docs/MEDIA_STORAGE_PHASE5.md). The legacy notes below document the earlier Phase 4 milestone and must not supersede the Phase 5 status.

# BY SARA — Greenfield Phase 4: Secure Admin CMS Foundation

**BY SARA — Beauty, Refined.** Built from the standalone Stitch design exports in a fresh Next.js 15 / TypeScript codebase using the locked Levantine Velvet & Champagne design system. Preserves the customer-facing Pages 01–13 built during Phases 1–3.

## Deployed NEW Neon infrastructure

- Project **`lingering-sea-03313730`** (`by-sara-greenfield-2026`), database **`bysara_v2`**, branch `br-sweet-brook-b9pcekde`.
- `sql/001_foundation.sql` deployed previously; **`sql/002_admin_operations.sql` applied in Phase 4** (stock movements only).
- Verified ten new app tables, RLS on all ten, and empty product/staff/customer/stock datasets. No legacy Neon or Vercel mutation.
- Neon Auth (Better Auth) provisioned, but **no Owner exists yet**. Follow `docs/OWNER_BOOTSTRAP.md` only with real identity and explicit authorization. No default credentials.

## Working implementation (requires configured server env and authorized Owner to operate)

- `/admin/products`: Product list, create Draft Product, edit text, add exact SKU/price/stock variant, explicit verification/publish review. All via protected `/api/admin/products`, `/api/admin/products/[id]`, `/api/admin/variants`.
- `/admin/taxonomy`: Read/create verified brand and category records via `/api/admin/taxonomy`.
- `/admin/inventory`: Read variants, transactional stock adjustment with mandatory reason, optimistic expected-quantity check and `stock_movements` + audit logs.
- `/admin/media`: Read approved image metadata. **Upload disabled (501)** until verified Neon Object Storage signing/storage flow is integrated; no arbitrary URL writing.
- `/admin/security`: Read-only audit activity, Owner-only access, redacts free-text review and stock notes.
- Protected Admin Shell filters navigation by effective role. Generic `/api/admin` mutation POST is disabled.
- Server uses verified Neon Auth session -> fresh active `staff_profiles` database lookup on every protected request, capability gates, strict request origin checks, typed field validation, parameterized SQL and transactions.

## Capabilities

| Role | View catalog | Edit drafts | Publish | Taxonomy | Stock | Upload media | Audit view | Manage staff |
|---|---|---|---|---|---|---|---|---|
| owner | yes | yes | yes | yes | yes | not yet | yes | not yet |
| admin | yes | yes | yes | yes | yes | not yet | no | no |
| editor | yes | yes | no | no | no | no | no | no |
| viewer | yes | no | no | no | no | no | no | no |

Permissions marked `not yet` may appear as future capability flags; no enabling endpoint is implemented. Database constraints guard publication and the single active Owner. A direct DB superuser can bypass app-level controls: restrict DB credentials operationally.

## Before executing anything

1. Review `SETUP.md`, `.env.example`, and `docs/OWNER_BOOTSTRAP.md`.
2. Never target an old database or the old Vercel project. Verify NEW project `lingering-sea-03313730`, `bysara_v2`.
3. Add server-only secrets to `.env.local`. In production `APP_ORIGIN` must equal the new HTTPS deployment origin or all Admin mutations fail closed.
4. Run `npm install`, `npm run typecheck`, `npm test`, `npm run build` once npm connectivity works.
5. Provision a **real** Owner identity through an approved separate process, then test authorization and role-denial via authenticated E2E sessions on staging.
6. Upload real, licensed product images after implementing Neon storage integration. Do not attempt publication without rights, warning/INCI requirements and a verified SKU.

**NO-GO for live commerce / production at this stage.** Missing complete build/typecheck, authenticated E2E, signed object-storage uploads, initial Owner onboarding, deployment and populated approved catalog. See `PHASE4_QA_REPORT.md`.
