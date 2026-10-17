# Phase 7 — Release evidence register

All statuses below start **NOT VERIFIED**. Record evidence URL/path, tester, UTC timestamp, target and release commit before marking any row verified.

| Gate | Initial status | Evidence required |
| --- | --- | --- |
| New private GitHub repository created | NOT VERIFIED | Repo URL + commit SHA |
| `package-lock.json` committed | NOT VERIFIED | Git diff + `npm ci` success |
| Next.js TypeScript check | NOT VERIFIED | CI logs attached to SHA |
| Next.js production build | NOT VERIFIED | CI logs attached to SHA |
| New Vercel project linked | NOT VERIFIED | Project ID, team, Git source |
| Preview URL mapped to intended commit | NOT VERIFIED | Deployment metadata |
| Preview points to isolated Neon branch | NOT VERIFIED | Redacted env mapping + API probe |
| Neon Auth trusted Preview domain | NOT VERIFIED | Console configuration screenshot without secrets |
| Approved and verified first Owner | NOT VERIFIED | Human approval + redacted Auth/Staff evidence |
| Denied-role/unauthenticated RBAC tests | NOT VERIFIED | 401/403 E2E evidence |
| Real product Draft and safe media upload | NOT VERIFIED | Isolated Preview logs and object verification |
| Storage failure cleanup / orphan test | NOT VERIFIED | Isolated failure-injection evidence |
| Desktop & mobile E2E | NOT VERIFIED | Playwright report |
| Non-fabricated catalog, policy & contact records | NOT VERIFIED | Approved real data evidence |
| Review of security, backups & incident procedures | NOT VERIFIED | Documented signoff |
| Production release authorization | NOT VERIFIED | Explicit GO decision |

Never mark a row complete by reading a design mockup, passing syntax tests or inspecting a green READY deployment.
