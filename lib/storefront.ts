/** Public storefront contract. No preview items are ever surfaced as products. */
export type PublishedProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  priceUsd: number;
  currency: 'USD';
  sku: string;
  variantLabel: string;
};
export type PublicCatalogResponse = {items: PublishedProduct[];status:'ready'|'not-configured'|'unavailable';message?:string};
export type PublicConfig = { whatsapp: string|null; phone: string|null; email: string|null; instagram: string|null; address: string|null };
export const EMPTY_CONFIG: PublicConfig = { whatsapp:null,phone:null,email:null,instagram:null,address:null };
export function isPublishedProduct(value: unknown):value is PublishedProduct {
  if(!value||typeof value!=='object')return false;
  const p=value as Record<string,unknown>;
  return ['id','slug','name','brand','category','description','imageUrl','sku','variantLabel'].every(k=>typeof p[k]==='string' && (p[k] as string).trim().length>0)
    && typeof p.priceUsd==='number' && Number.isFinite(p.priceUsd) && p.priceUsd>0 && p.currency==='USD'
    && /^https:\/\//.test(p.imageUrl as string);
}
export function safeCatalog(payload:unknown):PublicCatalogResponse {
  if(!payload||typeof payload!=='object')return {items:[],status:'unavailable'};
  const raw=payload as Record<string,unknown>;
  const status=raw.status==='ready'||raw.status==='not-configured'||raw.status==='unavailable'?raw.status:'unavailable';
  return {items:status==='ready' && Array.isArray(raw.items)?raw.items.filter(isPublishedProduct):[],status,message:typeof raw.message==='string'?raw.message:undefined};
}
export function whatsappLink(phone:string,message:string):string|null {
  const digits=phone.replace(/[^0-9]/g,'');
  if(!/^[1-9][0-9]{7,14}$/.test(digits))return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function usd(amount:number){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount)}
export function cleanSlug(v:string){return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)}
