# New BY SARA Owner — manual approved bootstrap only

**Owner is NOT created in Phase 3.** Existing accounts/projects must never be copied from the legacy application.

1. Confirm the new Neon Project ID is `lingering-sea-03313730`, database `bysara_v2`, branch `br-sweet-brook-b9pcekde`.
2. Owner personally registers/authenticates through the configured and verified Neon Auth provider (do not record or email a password). Confirm a verified email and their consent to privileged access.
3. Independently verify the new Neon Auth user UUID in the provider admin console and `neon_auth."user"` record. Never trust a UUID or email supplied by an unauthenticated HTTP request.
4. A privileged database operator can separately bootstrap the *exact verified UUID* after approval. Example **template only, DO NOT EXECUTE UNCHANGED**:
   ```sql
   INSERT INTO public.staff_profiles(user_id,role,is_active)
   SELECT id,'owner',true FROM neon_auth."user"
    WHERE id = '<VERIFIED-NEW-NEON-AUTH-UUID>'::uuid;
   ```
5. Verify `SELECT count(*) FROM public.staff_profiles WHERE role='owner' AND is_active;` returns 1. Confirm server-side /admin authorization, that all customer and ordinary staff requests fail closed, and inspect audit coverage.
6. A unique index prevents a second concurrently active Owner; trigger protects active Owner from ordinary update/deletion. This is **not** a guarantee against database-superuser access or administrative bypasses; restrict direct database administrator access operationally.

Never create default credentials, guess emails or copy legacy staff/user identities.

## Phase 4 — Staff & Owner operational policy

The new database had **zero** Neon Auth users and staff profiles when Phase 4 was prepared. Do NOT assume any authenticated visitor is an administrator. An exact, identity-verified Owner UUID must be linked by an authorized operator using the process above. To improve accountability, the operator should separately record the identity verification, approval, and a safe `owner.bootstrap` event (no credentials) in the relevant audit system in the same approved provisioning workflow.

`public.staff_profiles` defines `owner`, `admin`, `editor`, `viewer` roles. There is no universal `staff` role; Staff is a generic business category, not the database permission. Owner and Admin publishing approvals still require evidence and the PostgreSQL publication guard.

**No Owner, Admin or Staff account was created or modified in Phase 4.** No API endpoint here provisions, resets, demotes or elevates staff identities. Enrollment, confirmation and email recovery need separate audited security review.
