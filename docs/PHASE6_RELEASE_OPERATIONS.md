# BY SARA — Phase 6: Preview, CI/CD, Owner Activation, Release Gates

Status: **NO-GO** (not deployed, not live-tested, no Owner identity has been established).

This repository is **GREENFIELD ONLY**. Leave the previous Neon/Vercel/GitHub assets untouched. Never enter secrets into code, chat, commits, or screenshots.

## 1. Verified greenfield resources

| Resource | Actual identifier | Notes |
|---|---|---|
| Neon project | `lingering-sea-03313730` | `by-sara-greenfield-2026` |
| Database | `bysara_v2` | PostgreSQL 17 |
| Main branch | `br-sweet-brook-b9pcekde` | Data modifications prohibited without approval |
| Preview branch | `br-tiny-water-b9p2xphd` | Use for QA; empty of users/products |
| Main compute hostname | `ep-bitter-flower-b9z8sqci.c-7.eu-central-1.aws.neon.tech` | Use only with target `main` |
| Preview compute hostname | `ep-silent-rice-b9eftr6y.c-7.eu-central-1.aws.neon.tech` | Use only with target `preview` |
| Product Media bucket | `by-sara-v2-product-media` | `public_read` is not public upload |
| Neon Auth | Better Auth, provisioned on both branches | No Auth user or staff record is present |
| GitHub | Authenticated identity observed: `darwichtech01-star` | New repo creation not available through current connector |
| New Vercel project | **NOT CREATED** | The connected account returned `403 Forbidden` on project create previously |

### Explicit environment binding

New server-side module `src/lib/runtime-target.ts` ensures the configured database, Auth and Storage endpoint correspond to **the same designated greenfield environment**. Set `BY_SARA_TARGET=preview` for QA. This does not replace trusted deployment identity checks or integration tests.

Use `BY_SARA_TARGET=main` only when an approved production environment exists. The source code does not create one automatically.

## 2. GitHub repository setup (manual until connector has create permission)

In the intended GitHub account, create a **new private repository** named `by-sara-greenfield-2026` (not the old repository), with **no template files**. On a local copy of this project:

```bash
npm run check:repository
# Only proceed after auditing the source and local .env files.
git init -b main
git add .
git commit -m "chore: BY SARA greenfield Phase 6 foundation"
git remote add origin https://github.com/OWNER/by-sara-greenfield-2026.git
git push -u origin main
```

Replace `OWNER` with the actual authorized GitHub organization or username; never assume an organization owns it. Verify that `.env`, `.env.local`, any S3 secrets, and other credentials are excluded. Avoid sharing database dumps or customer data.

## 3. Install, build, test

The Phase 6 environment couldn't retrieve npm registry packages. The repository does **not** contain `package-lock.json`. To establish reproducible builds, from a trusted networked machine:

```bash
npm install --no-audit --no-fund
npm run check:repository
npm test
npm run typecheck
npm run build
```

Review and commit the generated `package-lock.json` separately; after that, CI uses **`npm ci`**. Until it exists, the CI **build job intentionally fails closed**. A zero-dependency test pass alone is not a production build.

Two GitHub Actions workflows have been added:
- `.github/workflows/ci.yml`: scan and tests, then `npm ci`, typecheck, and Next.js build, without secrets or deployment.
- `.github/workflows/preview-e2e.yml`: manual E2E on an independently deployed new Vercel Preview URL. Explicit URL restriction prevents accidentally testing the historical production domain. E2E is read-only/unauthenticated; its results have not been executed yet.

## 4. New Vercel project (manual permission fix required)

1. Resolve project-create permissions on the **DarwichTech** Vercel team (the connector returned `403`).
2. Create a **NEW** Next.js project named `by-sara-greenfield-2026` linked to the private GitHub repository. Do not reconnect or rename the old `by-sara` project.
3. Enable Preview deployment protection. Restrict shared Preview URLs and data to authorized reviewers.
4. Add Preview environment variables in Vercel settings only. Bind them to **Neon preview** (`br-tiny-water-b9p2xphd`), never the default/main database branch.
5. Create/verify the exact Preview origin in the **new Neon Auth trusted domains**, and configure email verification/delivery/rate limiting safely.
6. Only after a real Preview deployment exists, run the `Preview E2E` GitHub Action with its exact HTTPS URL.
7. Avoid automatic production release. Production promotion requires explicit approval after all P0 issues close.

### Preview environment variable matrix (values not secrets)

| Variable | Preview value / instruction |
|---|---|
| `BY_SARA_TARGET` | `preview` |
| `DATABASE_URL` | Server-only PostgreSQL URL for preview compute host; obtain from new Neon project; **never commit** |
| `NEON_AUTH_BASE_URL` | `https://ep-silent-rice-b9eftr6y.neonauth.c-7.eu-central-1.aws.neon.tech/bysara_v2/auth` |
| `NEON_AUTH_COOKIE_SECRET` | New random 32+ character server-only secret |
| `NEON_STORAGE_BRANCH_ID` | `br-tiny-water-b9p2xphd` |
| `AWS_ENDPOINT_URL_S3` | `https://br-tiny-water-b9p2xphd.storage.c-7.eu-central-1.aws.neon.tech` |
| `AWS_REGION` | `eu-central-1` |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | New scoped Neon Storage credentials; server-only, branch-bound |
| `APP_ORIGIN` | New verified HTTPS Preview origin (not the old Vercel project) |
| `NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH` | `false` until explicit security and email-flow verification |

`node scripts/preflight.mjs preview` checks environment structure; it does **not** perform live connection or credential validation and it is not a sign-off.

### Environment-specific credentials

Do not reuse the main branch's Database URL or Auth URL in Preview. Object Storage branch inherited bucket presence does not prove successful upload credentials. Credential scopes must be verified through real read/write tests with authorized test assets.

## 5. Secure Owner onboarding (pending explicit user input/approval)

Neon Auth directory contains zero users in the new preview branch. No account was created here.

1. Decide and verify the intended Owner's email **out of band**, without collecting a password in chat.
2. Configure Neon Auth on the **new project**; verify trusted domain, verified email, recovery, session cookies, and rate limits.
3. The Owner signs up/accepts invitation through the supported provider UI on the intended branch.
4. Before assigning Owner privilege, independently verify their UUID, provider email verification and unbanned status, and confirm absence of an existing Owner. Obtain explicit approval.
5. Run the reviewed one-time transaction in `docs/OWNER_ONBOARDING_PHASE5.md` only from trusted admin tooling; capture a sanitized audit reference. Never provide an unauthenticated bootstrap endpoint.
6. Test legitimate owner session, denied staff/customer access, 401/403 and expired sessions using real browser sessions, then verify account protection. These tests are NOT RUN.

## 6. Release gate status

| Gate | Status |
|---|---|
| Greenfield PostgreSQL schema / Preview separation | Verified through Neon metadata and SELECTs |
| Local unit/security contract tests | PASSED (see `PHASE6_QA_REPORT.md`) |
| TypeScript syntax compilation | PASSED (syntax only; not typecheck) |
| npm dependencies installed | BLOCKED — npm registry inaccessible |
| Committed lockfile + npm ci | NOT RUN / MISSING LOCKFILE |
| Next.js production build | NOT RUN |
| Real Auth 401/403/Owner tests | NOT RUN — no Owner |
| Actual upload & cleanup using scoped Storage | NOT RUN — no credentials |
| GitHub remote creation | NOT CREATED |
| New Vercel project and Preview deployment | NOT CREATED (`403` previously) |
| Browser E2E | NOT RUN |
| Production release | NO-GO |

## 7. Phase 7 criteria

Only after CI build and a fresh private Preview are available: perform authenticated end-to-end tests for catalog management, variant updates, stock conflict detection, successful media upload and cleanup, safe publish guard denial, audit trail, and owner role protection. Any test data goes to the preview branch only. No fabricated products, prices or customer messages may enter production. Capture minimal sanitized evidence of success or failure before requesting GO/NO-GO.
