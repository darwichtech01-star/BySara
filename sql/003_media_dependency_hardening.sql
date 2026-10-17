-- BY SARA GREENFIELD v2 ONLY — apply after 001 and 002; applied to the new main branch in Phase 5.
-- BEFORE INSERT now protects published products from late images/variants added outside the Admin UI.
BEGIN;
CREATE TRIGGER trg_by_sara_variant_insert_guard
 BEFORE INSERT ON public.product_variants FOR EACH ROW
 EXECUTE FUNCTION public.by_sara_guard_published_dependencies();
CREATE TRIGGER trg_by_sara_image_insert_guard
 BEFORE INSERT ON public.product_images FOR EACH ROW
 EXECUTE FUNCTION public.by_sara_guard_published_dependencies();
COMMIT;
