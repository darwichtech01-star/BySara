# BY SARA — Greenfield Phase 6

Production infrastructure & real verification **scaffolding**. Status: **NO-GO**.

Start: `docs/PHASE6_RELEASE_OPERATIONS.md`.

## Commands

```bash
npm run check:repository
npm test
npm install --no-audit --no-fund   # requires network; generate and commit package-lock.json
npm run typecheck
npm run build
npm run preflight:preview        # requires PRIVATE environment vars set locally
```

All application and service integrations remain disabled until environment configuration and live tests confirm them. The existing old `by-sara` deployment and historic Neon project are out of scope and unchanged.

### Phase 6 new files

- `src/lib/runtime-target.ts` — explicit greenfield branch binding.
- `scripts/preflight.mjs` — secret-safe structured configuration check.
- `scripts/check-repository.mjs` — accidental historic references / secret material scanner.
- `scripts/check-preview-url.mjs` — rejects unapproved Preview URL patterns.
- `tests/target-binding.test.mjs` and `tests/preview-url.test.mjs` — executable protections.
- `.github/workflows/ci.yml` and `.github/workflows/preview-e2e.yml` — fail-closed build gate and manual preview browser tests.
- `docs/PHASE6_RELEASE_OPERATIONS.md` — full checklist.
- `PHASE6_QA_REPORT.md` — reproducible evidence and blockers.
