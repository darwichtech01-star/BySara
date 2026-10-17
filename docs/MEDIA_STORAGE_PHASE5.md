# Neon Object Storage — BY SARA Greenfield Phase 5

Neon project `lingering-sea-03313730`; database `bysara_v2`.
New bucket `by-sara-v2-product-media` was created on the main branch with `public_read` access. Public read is intentional for **approved product images**, NOT public writes. No product images have been uploaded by this phase.

## How upload works

1. Owner/Admin must sign in through new Neon Auth and have an active staff_profiles role with `media:write`.
2. POST `/api/admin/media` with multipart/form-data, correct same-origin request, a Draft product ID, file, exact product ALT, rights attestation, documented rights reference and optional primary flag.
3. The request body is limited to ~6MB plus multipart overhead. Image magic bytes must be JPEG, PNG or WebP. `sharp` decodes, limits pixel count and normalizes into metadata-free WebP; SVG/HTML/executable disguised as image is rejected.
4. Server writes to S3-compatible Neon Storage with branch-bound credentials (not browser credentials), then commits `product_images` + `audit_logs` in one DB transaction. On DB failure it attempts best-effort storage-object cleanup. Storage service interruptions can leave an orphan requiring reconciliation, so upload success must only be shown after the DB commit.
5. Only draft products are uploadable; existing primary image prevents another primary. Usage-rights checkbox is a **recorded attestation** and cannot independently prove licensing — operators must verify supporting evidence.
6. Downloading images requires that the bucket access `public_read` works from the actual public storefront. Independently verify resulting public URLs and Content-Type before production release.

## Credentials / Vercel preview

Using the **new** Neon project and target branch, obtain scoped S3 storage credentials using Neon Console/CLI or approved management API. Put them ONLY in server-side Vercel or local `.env.local` values:

- `DATABASE_URL` — pooled postgres URL for the **new** `bysara_v2` database, never client-exposed.
- `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` — independent new provider credentials.
- `APP_ORIGIN` — HTTPS URL of the **new** Vercel deployment; never reuse the old BY SARA URL.
- `AWS_ENDPOINT_URL_S3` — current branch-scoped Neon storage endpoint.
- `AWS_REGION` — `eu-central-1`.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — dedicated storage-scoped credentials; do not commit.
- `NEON_STORAGE_BRANCH_ID` — current greenfield branch identifier, default `br-sweet-brook-b9pcekde` for main. The known Preview branch is `br-tiny-water-b9p2xphd`.

Do not use shared or legacy secrets. Configure file-size limits on the hosting layer and rate limits/WAF; application upload controls are not an abuse-prevention substitute. Validate actual upload, retrieval, deletion/orphan cleanup and RBAC using **verified accounts** on an isolated Preview branch before production.

## Not done

No storage access key was generated, copied, or disclosed. No actual S3 media upload or browser E2E was executed. Build and typecheck require installing npm dependencies. No images, products or owner identities have been fabricated or seeded.
