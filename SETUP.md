# BY SARA Phase 2 — Local Setup and Integration Boundary

1. Unzip and run `npm install` in the project root.
2. Start `npm run dev`; visit `/`, `/shop`, `/search`, `/wishlist`, `/inquiry-bag`, `/brands`, `/categories`, `/gifting`, `/about`, `/contact`, `/help`, `/account`.
3. The public catalog is intentionally empty because fresh Neon database contains no verified approved products. Do not copy old catalog or publish dummy products.
4. To integrate Neon in a subsequent backend phase, inspect the **new** project's actual schema and implement a server-only read query with publication safeguards. Return the typed contract in `src/lib/storefront.ts`; never query the database directly from the browser.
5. To integrate WhatsApp, store a business-approved international number **server-side** with validated public configuration returned from `/api/store-config`. Do not hardcode the number in a product page or publish claims of sent messages.
6. To integrate customer login, implement and test Neon Auth's supported secure flow. Do not create duplicate credentials or reuse old project Owner.
7. To preview: run `npm run typecheck`, `npm test`, `npm run build`. Vercel new-project creation was previously blocked by connector permissions; do not target the old project.
8. No scripts here alter Neon project, mutate Vercel, or write production products.

**Production caution**: `src/components/store/StoreContext.tsx` stores the user's shortlist in localStorage. It is not a trusted source for price, stock, status or orders. The published catalog endpoint remains authoritative.

## Phase 3 — Fresh Neon integration

Database project is **`lingering-sea-03313730`**, database **`bysara_v2`**. There are no seeded catalog or contacts and no Owner account has been created.

1. Read and review `sql/001_foundation.sql`. Apply it **only** to the new project/branch after verifying the project and database IDs. Capture the migration result before considering the DB configured.
2. Configure `DATABASE_URL` for that exact new branch in `.env.local` (server only). Never put it in `NEXT_PUBLIC_*` variables.
3. `NEON_AUTH_BASE_URL` points to the newly created Better Auth instance. Generate an independent `NEON_AUTH_COOKIE_SECRET` of at least 32 random characters in your local environment. Do not commit it.
4. Set `NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH=true` only after confirming the auth-proxy, cookies, secure origin, and live sign-in work correctly. Sign-up, email verification, recovery, SMTP and abuse prevention require separate configuration.
5. Owner bootstrap requires the real new Neon Auth UUID created by the legitimate Owner. Never guess a UUID or clone users from the former project. Only an approved privileged operator may link this exact UUID to a single active `owner` profile; verify provider identity first. Do not accept a caller-supplied UUID via a public API.
6. All public products must be individually verified and have a valid priced active SKU and rights-approved primary image. No demo products. Product images and business contact channels remain empty until uploaded and approved.
7. `src/app/api/admin` is GET read-only with live session+role guard; POST remains disabled (501). Phase 4 will introduce audited server-side mutation endpoints and end-to-end auth tests.
8. Run `npm ci` after a verified lockfile is generated, followed by `npm run typecheck`, `npm test`, and `npm run build`. Do not claim any checks not actually run.
9. Existing Vercel and previous Neon project are intentionally not used.

Note: RLS is enabled, with no direct-client policies. Application SQL executes as a trusted server-side database role; owner roles may bypass RLS. Enforce privileges in APIs and use minimum grants / distinct restricted SQL roles when deploying. **RLS enablement alone does not prove authorization.**

## Phase 4 — Admin setup and security

1. `sql/002_admin_operations.sql` is **already applied** to the NEW Neon project on `main`. Do NOT rerun on another database or the legacy project. It adds `stock_movements` and its RLS protection; no records were inserted.
2. Set **server-only** `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` and `APP_ORIGIN` for the new HTTPS Vercel domain. Do not use the prior Vercel domain. The database URL must name exactly `bysara_v2` or the server rejects it.
3. Confirm Neon Auth cookies and session lookup in a separate Preview environment. Set `NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH=true` only after real authentication testing.
4. Follow `docs/OWNER_BOOTSTRAP.md` with the verified UUID and explicit authorization; do not guess Owner identity, store passwords or reuse legacy account information.
5. Active Owner/Admin can create taxonomy and product Drafts; Owner/Admin can approve/publish only after independently reviewing manufacturer data, media rights, safety copy, actual stock and prices.
6. In production, Admin JSON mutations require a browser `Origin` that matches `APP_ORIGIN`. Missing/unconfigured Origin or a different Origin returns 403. `APP_ORIGIN` is mandatory for writes.
7. Media uploads are intentionally unavailable. Connecting secure Neon Object Storage and signed upload verification is the next required milestone; a file input without storage integration is not acceptable.
8. Admin API uses a trusted server-only PostgreSQL connection. RLS has no direct-client policies; do not connect customers directly with this privileged database role.
9. Before deploy, complete **typecheck + Next build + authenticated role-denial E2E + SQL integration tests**. Last local `npm install` failed because registry.npmjs.org could not resolve (`EAI_AGAIN`); see QA report.
