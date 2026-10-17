-- PHASE 4 MIGRATION: new greenfield project/database ONLY.
-- Project lingering-sea-03313730; database bysara_v2.
-- Safe for an empty inventory schema. No inserts or Owner/Auth account creation.
BEGIN;
CREATE TABLE IF NOT EXISTS public.stock_movements (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
 before_qty integer NOT NULL CHECK(before_qty >= 0),
 after_qty integer NOT NULL CHECK(after_qty >= 0),
 reason text NOT NULL CHECK(length(btrim(reason)) >= 12),
 actor_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(before_qty <> after_qty)
);
CREATE INDEX IF NOT EXISTS idx_by_sara_stock_movements_variant ON public.stock_movements(variant_id,created_at DESC);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stock_movements FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.stock_movements_id_seq FROM PUBLIC;
COMMIT;
