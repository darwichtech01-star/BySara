'use client';
import {useCallback,useEffect,useState,type FormEvent} from 'react';
import {adminRequest} from './http';

type Media={id:string;alt_en:string;product_id:string;is_primary:boolean;rights_confirmed:boolean;storage_path:string;public_url:string};
type Product={id:string;name_en:string;status:string;slug:string};
export function MediaManager(){
 const [items,setItems]=useState<Media[]>([]),[products,setProducts]=useState<Product[]>([]),[configured,setConfigured]=useState(false);
 const [message,setMessage]=useState('Loading media…'),[busy,setBusy]=useState(false);
 const [selected,setSelected]=useState(''),[file,setFile]=useState<File|null>(null);
 const [alt,setAlt]=useState(''),[ref,setRef]=useState(''),[attested,setAttested]=useState(false),[primary,setPrimary]=useState(false);
 const reload=useCallback(async()=>{
  try{
   const [media,productList]=await Promise.all([
    adminRequest<{items:Media[];uploadsEnabled:boolean}>('/api/admin/media'),
    adminRequest<{items:Product[]}>('/api/admin/products')]);
   setItems(media.items);setConfigured(media.uploadsEnabled);
   setProducts(productList.items.filter(p=>p.status==='draft'));
   setMessage(media.items.length?'':'No product photos have been uploaded to this new store.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not load media');}
 },[]);
 useEffect(()=>{void reload()},[reload]);
 async function upload(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!file||!selected||!attested||!configured)return;
  if(!window.confirm('Confirm your authorization to use this exact product image and its rights evidence?'))return;
  setBusy(true);setMessage('Uploading and validating media…');
  try{
   const form=new FormData();form.append('file',file);form.append('product_id',selected);
   form.append('alt_en',alt);form.append('rights_attested','true');form.append('rights_reference',ref);form.append('primary',String(primary));
   const response=await fetch('/api/admin/media',{method:'POST',credentials:'same-origin',cache:'no-store',body:form});
   const payload=await response.json() as {error?:string};
   if(!response.ok)throw new Error(payload.error||`Upload failed (${response.status})`);
   setFile(null);setAlt('');setRef('');setAttested(false);setPrimary(false);
   await reload();setMessage('Upload recorded and linked to the Draft product. Review its public image and details before publishing.');
  }catch(e){setMessage(e instanceof Error?e.message:'Upload failed; no success recorded');}
  finally{setBusy(false);}
 }
 return <div className="admin-stack">
  <div className="admin-intro"><span className="eyebrow">ASSET GOVERNANCE</span><h1>Media Manager</h1><p>Controlled image upload for BY SARA. Original product identity, explicit usage rights and server-side authorization are required.</p></div>
  <div className="admin-notice" role="status"><strong>{configured?'Neon Storage credentials configured — upload testing pending.':'Neon Storage credentials not configured in this application.'}</strong> Only authorized Admin/Owner users can upload. Public read does not grant write access. Images are normalized to WebP and are never added to a published product.</div>
  {message&&<p role="status" className="muted">{message}</p>}
  <div className="admin-two-col">
   <section className="admin-card"><h2>Upload a genuine product image</h2>
    <form className="admin-form" onSubmit={e=>void upload(e)}>
     <label>Draft product<select value={selected} onChange={e=>setSelected(e.target.value)} required><option value="">Select a draft…</option>{products.map(p=><option value={p.id} key={p.id}>{p.name_en} ({p.slug})</option>)}</select></label>
     <label>Image file (JPEG, PNG or WebP, max 6 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)} required /></label>
     <label>English image description<input value={alt} onChange={e=>setAlt(e.target.value)} maxLength={180} required placeholder="Describe the exact product shown" /></label>
     <label>Permission/rights evidence reference<input value={ref} onChange={e=>setRef(e.target.value)} minLength={12} maxLength={250} required placeholder="Approved supplier asset / documented permission reference" /></label>
     <label className="admin-checkbox"><input type="checkbox" checked={attested} onChange={e=>setAttested(e.target.checked)} required/><span>I am authorized to use this exact image for this product; its rights reference can be audited.</span></label>
     <label className="admin-checkbox"><input type="checkbox" checked={primary} onChange={e=>setPrimary(e.target.checked)}/><span>Set as primary (only when no other primary image exists)</span></label>
     <button className="button button-dark" type="submit" disabled={busy||!configured||!file||!selected||!attested||ref.trim().length<12}>{busy?'Uploading…':'Upload image securely'}</button>
    </form>
   </section>
   <section className="admin-card"><h2>Linked media ({items.length})</h2>
    {items.length===0?<p className="muted">Your new catalog is empty. Add a verified Draft product before uploading product photos.</p>:null}
    <div className="admin-list">{items.map(m=><div className="admin-record" key={m.id}><div><strong>{m.alt_en}</strong><br/><span>{m.is_primary?'Primary':'Gallery'} · Usage rights: {m.rights_confirmed?'Attested':'Not reviewed'} · {m.storage_path}</span></div><a href={m.public_url} target="_blank" rel="noreferrer">View image</a></div>)}</div>
   </section>
  </div>
 </div>;
}
