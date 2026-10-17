# BY SARA GREENFIELD — Owner onboarding and verification (NOT EXECUTED)

Project: `lingering-sea-03313730` — database `bysara_v2` — main `br-sweet-brook-b9pcekde`.

## Current verified state (17 October 2026)

Neon Auth / Better Auth is connected. There are **zero** Auth users and **zero** staff_profiles in the new greenfield project. No Owner credentials, owner account, or privilege assignment were created in this phase. The old BY SARA project was not queried or changed as part of owner provisioning.

## Approved manual process — requires user approval and an identity

1. Confirm the Owner's chosen email **out of band**. Do not provide a password or session token in this chat.
2. Configure the new Neon Auth service's email delivery, verification, approved sign-up/invite process, trusted domains, and rate limits **for the new origin**. Leave `NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH=false` until verified.
3. The Owner creates a new Neon Auth identity using the verified provider flow; confirm it is a **NEW** identity within this project, not a legacy account.
4. A trusted database operator verifies the UUID, provider email, `emailVerified=true`, `banned=false`, and that no active Owner profile exists. Never rely solely on email provided through an unauthenticated request.
5. With **explicit owner approval** and after confirming the exact project, run the following one-time transaction from a trusted secure database console. Replace the placeholder with the provider-verified UUID. The query requires the identity to be verified, unbanned, and unique; it will fail closed otherwise. **Do not run the template unchanged.**

```sql
BEGIN;
DO $$
DECLARE chosen uuid := '<PROVIDER-VERIFIED-NEW-OWNER-UUID>'::uuid;
BEGIN
 IF current_database() <> 'bysara_v2' THEN RAISE EXCEPTION 'WRONG_DATABASE'; END IF;
 IF EXISTS(SELECT 1 FROM public.staff_profiles WHERE role='owner') THEN RAISE EXCEPTION 'OWNER_ALREADY_EXISTS'; END IF;
 IF NOT EXISTS(SELECT 1 FROM neon_auth."user" u
     WHERE u.id=chosen AND u."emailVerified"=true AND coalesce(u.banned,false)=false)
 THEN RAISE EXCEPTION 'OWNER_IDENTITY_NOT_VERIFIED'; END IF;
 INSERT INTO public.staff_profiles(user_id,role,is_active) VALUES (chosen,'owner',true);
 INSERT INTO public.audit_logs(actor_id,operation,entity_type,entity_id,change_summary)
 VALUES(chosen,'owner.bootstrap','staff_profile',chosen::text,'{"approval_required":true}'::jsonb);
END $$;
COMMIT;
```

6. Test sign-in with a real authenticated browser session, verify privileged and unauthorized API cases (401/403), document that Owner cannot be demoted or deleted with ordinary application operations, then sign out and recheck session expiry. **Do not store personal credentials in logs or screenshots.**
7. Add new staff only through reviewed invitation / provisioning workflows. No open public Owner registration endpoint.

## Safeguards

- There is no public bootstrap API and no automatic Owner creation.
- The existing Owner guard prevents ordinary updates/deletes of the active Owner profile.
- Server-side Admin RBAC always looks up `staff_profiles` using the session identity.
- `NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH` is a UI feature gate, **not** an authorization mechanism.
- Database owner privileges inherently bypass application RLS; restrict them to trusted server-side credentials.
