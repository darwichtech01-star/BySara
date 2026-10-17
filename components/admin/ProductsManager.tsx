'use client';
import {useCallback,useEffect,useState,type FormEvent} from 'react';
import {adminRequest} from './http';
type Taxon={id:string;slug:string;name_en:string};
type Product={id:string;slug:string;name_en:string;status:string;brand_name:string;category_name:string;is_verified:boolean;media_rights_confirmed:boolean;variant_count:number;image_count:number;name_ar:string|null;description_en:string|null;inci:string|null;warnings:string|null;requires_inci:boolean;brand_id:string;category_id:string};
type Variant={id:string;sku:string;label_en:string;price_usd:string|null;stock_qty:number|null;is_active:boolean};
type Detail={item:Product;variants:Variant[];images:{id:string;alt_en:string;rights_confirmed:boolean;is_primary:boolean}[]};
const blankProduct={slug:'',name_en:'',name_ar:'',brand_id:'',category_id:'',description_en:'',inci:'',warnings:'',requires_inci:true};
const blankVariant={sku:'',label_en:'',price_usd:'',stock_qty:'',stock_reason:'',is_active:false};
export function ProductsManager(){
 const [products,setProducts]=useState<Product[]>([]),[brands,setBrands]=useState<Taxon[]>([]),[categories,setCategories]=useState<Taxon[]>([]),[selected,setSelected]=useState<string|null>(null),[detail,setDetail]=useState<Detail|null>(null),[form,setForm]=useState(blankProduct),[variant,setVariant]=useState(blankVariant);
 const [message,setMessage]=useState('Loading verified admin data…'),[busy,setBusy]=useState(false),[review,setReview]=useState(''),[editing,setEditing]=useState({name_en:'',description_en:'',inci:'',warnings:''});
 const load=useCallback(async()=>{
  try{const [catalog,terms]=await Promise.all([adminRequest<{items:Product[]}>('/api/admin/products'),adminRequest<{brands:Taxon[];categories:Taxon[]}>('/api/admin/taxonomy')]);setProducts(catalog.items);setBrands(terms.brands);setCategories(terms.categories);setMessage(catalog.items.length?'':'No products have been created. Add approved taxonomy first.');}
  catch(e){setMessage((e as Error).message)}
 },[]);
 const loadDetail=useCallback(async(id:string)=>{try{const data=await adminRequest<Detail>(`/api/admin/products/${encodeURIComponent(id)}`);setDetail(data);setEditing({name_en:data.item.name_en,description_en:data.item.description_en||'',inci:data.item.inci||'',warnings:data.item.warnings||''});setMessage('');}catch(e){setMessage((e as Error).message)}},[]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{if(selected)void loadDetail(selected);else setDetail(null)},[selected,loadDetail]);
 const execute=async(fn:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await fn();setMessage('Saved to the authorized backend; review audit history.')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}};
 const submitProduct=(e:FormEvent)=>{e.preventDefault();void execute(async()=>{
  const r=await adminRequest<{item:{id:string}}>('/api/admin/products','POST',{...form,name_ar:form.name_ar||null,description_en:form.description_en||null,inci:form.inci||null,warnings:form.warnings||null});
  setForm(blankProduct);await load();setSelected(r.item.id);
 })};
 const submitVariant=(e:FormEvent)=>{e.preventDefault();if(!selected)return;void execute(async()=>{
  await adminRequest('/api/admin/variants','POST',{product_id:selected,sku:variant.sku,label_en:variant.label_en,price_usd:variant.price_usd===''?null:Number(variant.price_usd),stock_qty:variant.stock_qty===''?null:Number(variant.stock_qty),stock_reason:variant.stock_reason,is_active:variant.is_active});
  setVariant(blankVariant);await loadDetail(selected);await load();
 })};
 const saveDraft=(e:FormEvent)=>{e.preventDefault();if(!selected)return;void execute(async()=>{await adminRequest(`/api/admin/products/${selected}`,'PATCH',{...editing});await load();await loadDetail(selected)})};
 const toggleVerified=()=>{if(!selected||!detail)return;void execute(async()=>{
  await adminRequest(`/api/admin/products/${selected}`,'PATCH',{is_verified:!detail.item.is_verified,verification_note:review});await load();await loadDetail(selected);
 })};
 const confirmRights=()=>{if(!selected||!detail)return;void execute(async()=>{
  await adminRequest(`/api/admin/products/${selected}`,'PATCH',{media_rights_confirmed:!detail.item.media_rights_confirmed,verification_note:review});await load();await loadDetail(selected);
 })};
 const publish=()=>{if(!selected||!detail)return;void execute(async()=>{
  await adminRequest(`/api/admin/products/${selected}`,'PATCH',{status:detail.item.status==='published'?'draft':'published',verification_note:review});await load();await loadDetail(selected);
 })};
 return <div className="admin-stack">
  <div className="admin-intro"><span className="eyebrow">CATALOG OPERATIONS</span><h1>Products CMS</h1><p>Only approved catalog records. New entries start as Draft. Publishing is blocked until the database verifies every requirement.</p></div>
  <div className="admin-notice" role="status" aria-live="polite">{message||'All displayed records come from the authenticated admin API.'}</div>
  <section className="admin-card"><h2>Catalog records <small>{products.length} loaded</small></h2>
   {products.length?<div className="admin-list">{products.map(p=><button type="button" className={selected===p.id?'admin-record active':'admin-record'} onClick={()=>setSelected(p.id)} key={p.id}><strong>{p.name_en}</strong><span>{p.brand_name} · {p.category_name} · {p.variant_count} SKU · {p.image_count} images</span><em>{p.status}</em></button>)}</div>:<p className="muted">No catalog items to manage.</p>}
  </section>
  <div className="admin-two-col"><section className="admin-card"><h2>Create Draft Product</h2><p className="muted">Create verified taxonomy in Brands & Categories first. Nothing is auto-published.</p>
  <form onSubmit={submitProduct} className="admin-form">
   <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={90} value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></label>
   <label>Product name (English)<input required maxLength={180} value={form.name_en} onChange={e=>setForm({...form,name_en:e.target.value})}/></label>
   <label>Product name (Arabic)<input dir="auto" value={form.name_ar} onChange={e=>setForm({...form,name_ar:e.target.value})}/></label>
   <label>Brand<select required value={form.brand_id} onChange={e=>setForm({...form,brand_id:e.target.value})}><option value="">Select an approved brand</option>{brands.map(x=><option value={x.id} key={x.id}>{x.name_en}</option>)}</select></label>
   <label>Category<select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Select an approved category</option>{categories.map(x=><option value={x.id} key={x.id}>{x.name_en}</option>)}</select></label>
   <label>Description (English)<textarea value={form.description_en} onChange={e=>setForm({...form,description_en:e.target.value})}/></label>
   <label>INCI ingredients<textarea value={form.inci} onChange={e=>setForm({...form,inci:e.target.value})}/></label>
   <label>Warnings<textarea value={form.warnings} onChange={e=>setForm({...form,warnings:e.target.value})}/></label>
   <label className="admin-checkbox"><input type="checkbox" checked={form.requires_inci} onChange={e=>setForm({...form,requires_inci:e.target.checked})}/> INCI required for publication (disable only for legitimately non-cosmetic products)</label>
   <button className="button button-dark" disabled={busy||!brands.length||!categories.length}>Create Draft</button>
  </form></section>
  <section className="admin-card"><h2>Selected product</h2>{!detail?<p className="muted">Select a product to edit its Draft, review variants and check publication requirements.</p>:<>
   <p><strong>{detail.item.name_en}</strong> <span className="soft-status">{detail.item.status}</span></p>
   <form className="admin-form" onSubmit={saveDraft}>
    <label>Product name<input value={editing.name_en} required onChange={e=>setEditing({...editing,name_en:e.target.value})}/></label>
    <label>Description<textarea value={editing.description_en} onChange={e=>setEditing({...editing,description_en:e.target.value})}/></label>
    <label>INCI<textarea value={editing.inci} onChange={e=>setEditing({...editing,inci:e.target.value})}/></label>
    <label>Warnings<textarea value={editing.warnings} onChange={e=>setEditing({...editing,warnings:e.target.value})}/></label>
    <button className="button button-dark" disabled={busy}>Save Text Changes</button>
   </form>
   <hr/><h3>Variants ({detail.variants.length})</h3><div className="admin-list">{detail.variants.map(v=><div className="admin-record" key={v.id}><strong>{v.sku}</strong><span>{v.label_en} · USD {v.price_usd??'Unverified'} · Stock {v.stock_qty??'Unverified'}</span></div>)}</div>
   <form className="admin-form" onSubmit={submitVariant}>
    <label>New exact SKU<input required maxLength={100} value={variant.sku} onChange={e=>setVariant({...variant,sku:e.target.value})}/></label>
    <label>Variant label<input required value={variant.label_en} onChange={e=>setVariant({...variant,label_en:e.target.value})}/></label>
    <label>Verified USD price<input inputMode="decimal" type="number" min="0.01" step="0.01" value={variant.price_usd} onChange={e=>setVariant({...variant,price_usd:e.target.value})}/></label>
    <label>Counted stock<input inputMode="numeric" type="number" min="0" step="1" value={variant.stock_qty} onChange={e=>setVariant({...variant,stock_qty:e.target.value})}/></label>
    <label>Initial stock source / count evidence<input value={variant.stock_reason} onChange={e=>setVariant({...variant,stock_reason:e.target.value})} placeholder="Required if initial quantity is above zero"/></label>
    <label className="admin-checkbox"><input type="checkbox" checked={variant.is_active} onChange={e=>setVariant({...variant,is_active:e.target.checked})}/> Active (requires price and stock)</label>
    <button className="button button-dark" disabled={busy||detail.item.status!=='draft'}>Add Variant to Draft</button>
   </form>
   <hr/><h3>Publication review</h3><p className="muted">Only authorized Owner/Admin may confirm verification and publication. Media must be properly uploaded and linked first.</p>
   <label className="admin-form">Evidence and approval note<textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="Reference the actual manufacturer specifications, media permission or verified review"/></label>
   <div className="admin-actions"><button type="button" className="button" disabled={busy||review.trim().length<15} onClick={toggleVerified}>{detail.item.is_verified?'Revoke product verification':'Confirm product verification'}</button><button type="button" className="button" disabled={busy||review.trim().length<15} onClick={confirmRights}>{detail.item.media_rights_confirmed?'Revoke media rights':'Confirm media rights'}</button><button type="button" className="button button-dark" disabled={busy||(detail.item.status!=='published'&&review.trim().length<15)} onClick={publish}>{detail.item.status==='published'?'Unpublish':'Publish (if eligible)'}</button></div>
  </>}</section></div></div>
}
