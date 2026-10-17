import 'server-only';
import {getPool} from '@/lib/db';
import {safeCatalog, EMPTY_CONFIG, type PublicCatalogResponse, type PublicConfig} from '@/lib/storefront';

/** This is a DB-owned, server-only read model: it never trusts caller-supplied status/price/media. */
export async function publishedCatalog():Promise<PublicCatalogResponse> {
  if(!process.env.DATABASE_URL) return {items:[],status:'not-configured',message:'The curated collection is being prepared.'};
  const sql = `
    SELECT p.id::text AS id, p.slug, p.name_en AS name, b.name_en AS brand,
           c.name_en AS category, coalesce(p.description_en,'') AS description,
           i.public_url AS "imageUrl", v.price_usd::float8 AS "priceUsd", 
           v.sku, v.label_en AS "variantLabel"
    FROM public.products p
    JOIN public.brands b ON b.id=p.brand_id
    JOIN public.categories c ON c.id=p.category_id
    JOIN LATERAL (
       SELECT sku, label_en, price_usd FROM public.product_variants v
       WHERE v.product_id=p.id AND v.is_active IS TRUE AND v.price_usd>0 AND v.stock_qty IS NOT NULL
       ORDER BY v.price_usd ASC, v.sku ASC LIMIT 1
    ) v ON true
    JOIN LATERAL (
       SELECT public_url FROM public.product_images i
       WHERE i.product_id=p.id AND i.is_primary IS TRUE AND i.rights_confirmed IS TRUE
             AND i.public_url LIKE 'https://%'
       LIMIT 1
    ) i ON true
    WHERE p.status='published' AND p.is_verified IS TRUE
      AND p.media_rights_confirmed IS TRUE
      AND (p.requires_inci IS FALSE OR nullif(btrim(p.inci),'') IS NOT NULL)
      AND nullif(btrim(p.warnings),'') IS NOT NULL
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT 100;
  `;
  const rows=await getPool().query(sql);
  return safeCatalog({items:rows.rows.map((r)=>({...r,currency:'USD'})),status:'ready'});
}

export async function publishedStoreConfig():Promise<PublicConfig> {
  if(!process.env.DATABASE_URL) return EMPTY_CONFIG;
  const result=await getPool().query<{
    whatsapp_e164:string|null;phone_e164:string|null;email:string|null;instagram_url:string|null;address:string|null;
  }>('SELECT whatsapp_e164,phone_e164,email,instagram_url,address FROM public.store_public_config WHERE id=1 AND is_published IS TRUE LIMIT 1');
  const row=result.rows[0];
  return row?{whatsapp:row.whatsapp_e164,phone:row.phone_e164,email:row.email,instagram:row.instagram_url,address:row.address}:EMPTY_CONFIG;
}

/** Published, owner-approved legal content only; never construct a default policy. */
export async function publishedPolicy(slug:string):Promise<{title:string;body:string;publishedAt:string}|null>{
 if(!process.env.DATABASE_URL||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return null;
 const {rows}=await getPool().query<{title_en:string;body_en:string;published_at:Date}>(
   `SELECT title_en,body_en,published_at FROM public.store_policies
      WHERE slug=$1 AND status='published' AND approved_at IS NOT NULL
      AND published_at IS NOT NULL AND nullif(btrim(body_en),'') IS NOT NULL
      LIMIT 1`,[slug]);
 const p=rows[0];return p?{title:p.title_en,body:p.body_en,publishedAt:p.published_at.toISOString()}:null;
}
