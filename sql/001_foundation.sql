-- BY SARA Greenfield — new Neon project ONLY (lingering-sea-03313730 / bysara_v2)
-- No customer, owner, product, contact, price, media, or staff records are seeded.
-- Do NOT apply to the historical by-sara-beauty-store project.
BEGIN;
CREATE TABLE IF NOT EXISTS public.brands (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name_en text NOT NULL CHECK (length(trim(name_en))>0),
 name_ar text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name_en text NOT NULL CHECK (length(trim(name_en))>0),
 name_ar text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 brand_id uuid NOT NULL REFERENCES public.brands(id),
 category_id uuid NOT NULL REFERENCES public.categories(id),
 name_en text NOT NULL CHECK (length(trim(name_en))>0),
 name_ar text,
 description_en text,
 description_ar text,
 inci text,
 warnings text,
 requires_inci boolean NOT NULL DEFAULT true,
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
 is_verified boolean NOT NULL DEFAULT false,
 media_rights_confirmed boolean NOT NULL DEFAULT false,
 verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT verification_has_time CHECK (NOT is_verified OR verified_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS public.product_variants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
 sku text NOT NULL UNIQUE CHECK (length(trim(sku))>0),
 label_en text NOT NULL CHECK (length(trim(label_en))>0),
 label_ar text,
 price_usd numeric(12,2) CHECK (price_usd > 0),
 stock_qty integer CHECK (stock_qty >= 0),
 is_active boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT active_variant_complete CHECK (NOT is_active OR (price_usd IS NOT NULL AND stock_qty IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS public.product_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
 variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
 storage_path text NOT NULL UNIQUE CHECK (length(trim(storage_path))>0),
 public_url text NOT NULL CHECK (public_url ~ '^https://'),
 alt_en text NOT NULL CHECK (length(trim(alt_en))>0),
 alt_ar text,
 rights_confirmed boolean NOT NULL DEFAULT false,
 is_primary boolean NOT NULL DEFAULT false,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
-- A variant-specific image must belong to the same product as the image record.
ALTER TABLE public.product_variants ADD CONSTRAINT ux_variant_product_pair UNIQUE(id,product_id);
ALTER TABLE public.product_images ADD CONSTRAINT fk_image_variant_product
 FOREIGN KEY (variant_id,product_id) REFERENCES public.product_variants(id,product_id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS ux_product_primary_media ON public.product_images(product_id) WHERE is_primary;
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id,is_active);
CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id,sort_order);
CREATE TABLE IF NOT EXISTS public.store_public_config (
 id smallint PRIMARY KEY DEFAULT 1 CHECK (id=1),
 whatsapp_e164 text CHECK (whatsapp_e164 IS NULL OR whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$'),
 phone_e164 text CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
 email text,
 instagram_url text CHECK (instagram_url IS NULL OR instagram_url ~ '^https://'),
 address text,
 is_published boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.store_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title_en text NOT NULL,
 title_ar text,
 body_en text,
 body_ar text,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 approved_at timestamptz,
 published_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT published_policy_approved CHECK (status <> 'published' OR (approved_at IS NOT NULL AND published_at IS NOT NULL AND nullif(trim(coalesce(body_en,'')),'') IS NOT NULL))
);
-- Linked to Neon Auth's true identity records; never populate with guessed identifiers.
CREATE TABLE IF NOT EXISTS public.staff_profiles (
 user_id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
 role text NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
 is_active boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_single_active_owner ON public.staff_profiles ((role)) WHERE role='owner' AND is_active=true;
CREATE TABLE IF NOT EXISTS public.audit_logs (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 actor_id uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
 operation text NOT NULL,
 entity_type text NOT NULL,
 entity_id text NOT NULL,
 change_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE OR REPLACE FUNCTION public.by_sara_guard_publish() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.status='published' THEN
  IF NOT NEW.is_verified OR NOT NEW.media_rights_confirmed
    OR nullif(trim(coalesce(NEW.description_en,'')),'') IS NULL
    OR (NEW.requires_inci AND nullif(trim(coalesce(NEW.inci,'')),'') IS NULL)
    OR nullif(trim(coalesce(NEW.warnings,'')),'') IS NULL
    OR NOT EXISTS(SELECT 1 FROM public.product_variants v WHERE v.product_id=NEW.id AND v.is_active AND v.price_usd>0 AND v.stock_qty IS NOT NULL)
    OR NOT EXISTS(SELECT 1 FROM public.product_images i WHERE i.product_id=NEW.id AND i.is_primary AND i.rights_confirmed AND i.public_url ~ '^https://')
  THEN RAISE EXCEPTION 'PUBLISH_BLOCKED: complete identity, INCI if relevant, warnings, rights, active priced SKU and approved primary media';
  END IF;
 END IF;
 NEW.updated_at=now();
 RETURN NEW;
END $$;
CREATE TRIGGER trg_by_sara_guard_publish BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.by_sara_guard_publish();
CREATE OR REPLACE FUNCTION public.by_sara_guard_published_dependencies() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE product_uuid uuid;
BEGIN
 product_uuid := CASE WHEN TG_OP='DELETE' THEN OLD.product_id ELSE NEW.product_id END;
 IF EXISTS(SELECT 1 FROM public.products p WHERE p.id=product_uuid AND p.status='published') THEN
  IF TG_TABLE_NAME='product_variants' AND TG_OP='UPDATE'
     AND NEW.id=OLD.id AND NEW.product_id=OLD.product_id AND NEW.sku=OLD.sku
     AND NEW.label_en=OLD.label_en AND NEW.label_ar IS NOT DISTINCT FROM OLD.label_ar
     AND NEW.created_at=OLD.created_at AND NEW.is_active=OLD.is_active
     AND NEW.price_usd IS NOT DISTINCT FROM OLD.price_usd AND NEW.stock_qty IS NOT NULL THEN
    RETURN NEW; -- Stock-only adjustments remain possible for an authorized backend.
  END IF;
  RAISE EXCEPTION 'PUBLISH_BLOCKED: unpublish before changing published variant identity/media';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
CREATE TRIGGER trg_by_sara_variant_dependency BEFORE UPDATE OR DELETE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.by_sara_guard_published_dependencies();
CREATE TRIGGER trg_by_sara_image_dependency BEFORE UPDATE OR DELETE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.by_sara_guard_published_dependencies();
CREATE OR REPLACE FUNCTION public.by_sara_guard_owner() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' AND OLD.role='owner' AND OLD.is_active THEN RAISE EXCEPTION 'PROTECTED_OWNER'; END IF;
 IF TG_OP='UPDATE' AND OLD.role='owner' AND OLD.is_active AND (NEW.role<>'owner' OR NEW.is_active IS NOT TRUE OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN RAISE EXCEPTION 'PROTECTED_OWNER'; END IF;
 RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
CREATE TRIGGER trg_by_sara_guard_owner BEFORE UPDATE OR DELETE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.by_sara_guard_owner();
-- Deny any direct anonymous / JWT-side table access. The application uses trusted server-only SQL with separately checked session + RBAC.
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_public_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
COMMIT;
