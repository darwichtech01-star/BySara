# Phase 7 — First Owner: deliberate, auditable human onboarding

**NOT EXECUTED.** There is currently no registered Neon Auth user or active staff/Owner in the BY SARA new project.

1. Confirm Neon **new project** `lingering-sea-03313730`, database `bysara_v2`, and selected environment `phase5-preview` for testing. The old BY SARA project remains out of scope.
2. An authorized human owner determines the email they control. Do not paste the email, their password, MFA codes, recovery links or provider credentials into code or chat.
3. When an approved and access-protected Preview exists, register its **exact new hostname** as a trusted Neon Auth domain on the **Preview branch only**, using an authorized account; do not add historic production domains.
4. Use the documented Neon Auth invitation/registration flow to create the identity under the **new** project. Verify email using the actual inbox and provider workflow. Do not use test-only users or fabricated addresses.
5. Confirm the user UUID, `emailVerified=true`, and `banned=false` from the Neon Auth user directory; the user must approve that precise identity. Do not infer identity from display name. Keep details private.
6. Independently inspect the `public.staff_profiles` table to verify no active Owner exists. With explicit approval only, review and execute `sql/0002_owner_bootstrap_MANUAL_ONLY.sql` with the approved UUID. The script defaults to a failing placeholder and rejects unverified, banned or duplicate-Owner assignments.
7. Enable `NEXT_PUBLIC_ENABLE_STAFF_LOGIN=true` **only for the new approved Preview** after the auth service is working. Keep customer registration disabled. `/staff-login` is the separate login route; opening it alone does not grant permissions.
8. Test real sessions: Owner can view authorized Admin resources; unauthenticated and unauthorized users receive 401/403; verify server-side RBAC against a known denied-role user. Never run production write tests on `main`.
9. Document test evidence, approved reviewer and timestamp in the private release record. Do not publish Owner credentials or screenshots with tokens.

Do not modify the old Owner, any old Neon project, or any previous Vercel deployment. The approval step is not delegated to an unattended automation.
