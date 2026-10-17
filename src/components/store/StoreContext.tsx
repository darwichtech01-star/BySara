'use client';
import {createContext,useContext,useEffect,useState,useCallback,useMemo} from 'react';
import type {PublishedProduct} from '@/lib/storefront';

type Locale='en'|'ar';
type SavedState={saved:PublishedProduct[];bag:PublishedProduct[];locale:Locale;ready:boolean;toggleSave:(p:PublishedProduct)=>void;toggleBag:(p:PublishedProduct)=>void;removeBag:(id:string)=>void;setLocale:(v:Locale)=>void;clearBag:()=>void};
const ctx=createContext<SavedState|null>(null);
const SAVED='bysara.v2.wishlist'; const BAG='bysara.v2.inquiry';const LOCALE='bysara.v2.locale';
function load(key:string):PublishedProduct[]{try {const raw=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(raw)?raw.filter((p)=>p&&typeof p.id==='string'&&typeof p.slug==='string').slice(0,100):[]}catch{return []}}
export function StoreProvider({children}:{children:React.ReactNode}){
 const [saved,setSaved]=useState<PublishedProduct[]>([]); const [bag,setBag]=useState<PublishedProduct[]>([]);const [locale,setLocaleState]=useState<Locale>('en');const [ready,setReady]=useState(false);
 useEffect(()=>{setSaved(load(SAVED));setBag(load(BAG));setLocaleState(localStorage.getItem(LOCALE)==='ar'?'ar':'en');setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem(SAVED,JSON.stringify(saved))},[saved,ready]);
 useEffect(()=>{if(ready)localStorage.setItem(BAG,JSON.stringify(bag))},[bag,ready]);
 useEffect(()=>{if(ready){localStorage.setItem(LOCALE,locale);document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr'}},[locale,ready]);
 const toggleSave=useCallback((p:PublishedProduct)=>setSaved(old=>old.some(x=>x.id===p.id)?old.filter(x=>x.id!==p.id):[...old,p]),[]);
 const toggleBag=useCallback((p:PublishedProduct)=>setBag(old=>old.some(x=>x.id===p.id)?old.filter(x=>x.id!==p.id):[...old,p]),[]);
 const removeBag=useCallback((id:string)=>setBag(old=>old.filter(x=>x.id!==id)),[]);
 const clearBag=useCallback(()=>setBag([]),[]);
 const setLocale=useCallback((v:Locale)=>setLocaleState(v),[]);
 const value=useMemo(()=>({saved,bag,locale,ready,toggleSave,toggleBag,removeBag,setLocale,clearBag}),[saved,bag,locale,ready,toggleSave,toggleBag,removeBag,setLocale,clearBag]);
 return <ctx.Provider value={value}>{children}</ctx.Provider>;
}
export function useStore(){const value=useContext(ctx);if(!value)throw new Error('StoreProvider missing');return value}
