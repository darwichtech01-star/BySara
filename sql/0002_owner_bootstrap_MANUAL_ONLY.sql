-- BY SARA GREENFIELD only. NOT AN AUTOMATIC MIGRATION.
-- Execute MANUALLY, only after the user approves the exact verified Neon Auth user UUID.
-- Requirements: independently confirmed email ownership, verified email, not banned,
-- correctly scoped to the new project lingering-sea-03313730/database bysara_v2.
-- NEVER apply this script to a legacy project or to a user identifier copied from another project.
-- This script intentionally fails until an authorized operator replaces the placeholder UUID.
BEGIN;
DO $verify_owner_identity$
DECLARE selected_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
 IF selected_id='00000000-0000-0000-0000-000000000000'::uuid THEN
  RAISE EXCEPTION 'ABORT: Replace placeholder ONLY after Owner identity approval';
 END IF;
 IF current_database()<>'bysara_v2' THEN RAISE EXCEPTION 'WRONG DATABASE'; END IF;
 IF EXISTS(SELECT 1 FROM public.staff_profiles WHERE role='owner' AND is_active) THEN
  RAISE EXCEPTION 'ABORT: Active Owner already exists';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM neon_auth."user" WHERE id=selected_id AND "emailVerified" IS TRUE AND COALESCE(banned,false) IS FALSE) THEN
  RAISE EXCEPTION 'ABORT: Neon Auth user not found / unverified / banned';
 END IF;
 INSERT INTO public.staff_profiles(user_id,role,is_active) VALUES(selected_id,'owner',true);
END $verify_owner_identity$;
COMMIT;
