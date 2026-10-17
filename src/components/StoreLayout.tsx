'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {StoreProvider,useStore} from './store/StoreContext';
import {Icon} from './store/Icon';
const links=[['Shop All','/shop'],['Face Care','/categories/face-care'],['Brands','/brands'],['Categories','/categories'],['Sets & Gifting','/gifting'],['About','/about'],['Help','/help']];
const ar:Record<string,string>={'Shop All':'تسوّقي الكل','Face Care':'العناية بالبشرة','Brands':'العلامات التجارية','Categories':'الفئات','Sets & Gifting':'المجموعات والهدايا','About':'عن BY SARA','Help':'المساعدة'};
function Chrome({children}:{children:React.ReactNode}){
 const {saved,bag,locale,setLocale}=useStore();const [menu,setMenu]=useState(false);const pathname=usePathname();
 return <>
  <div className="announcement"><div className="announce-inner"><span>BY SARA · BEAUTY, REFINED.</span><span className="announcement-center">CURATED BEAUTY · LEBANON</span><span>DISCOVER AT YOUR PACE</span></div></div>
  <header className="site-header">
    <div className="header-main shell">
      <button aria-label="Open menu" aria-expanded={menu} className="icon-button menu-trigger" onClick={()=>setMenu(!menu)}><Icon name={menu?'close':'menu'}/></button>
      <Link href="/" className="logo-lockup" onClick={()=>setMenu(false)}><span className="logo-seal">S</span><span className="logo-text">BY SARA<small>BEAUTY, REFINED.</small></span></Link>
      <form role="search" action="/search" className="header-search"><Icon name="search" size={17}/><input name="q" aria-label="Search products" placeholder={locale==='ar'?'ابحثي عن العناية والجمال...':'Search beauty, skincare, brands...'}/><button type="submit" aria-label="Submit search"><Icon name="arrow" size={17}/></button></form>
      <div className="header-actions"><Link className="icon-button" href="/search" aria-label="Search"><Icon name="search"/></Link><Link className="icon-button" href="/wishlist" aria-label="Wishlist"><Icon name="heart"/>{saved.length>0&&<span className="action-count">{saved.length}</span>}</Link><Link className="icon-button" href="/inquiry-bag" aria-label="Inquiry bag"><Icon name="bag"/>{bag.length>0&&<span className="action-count">{bag.length}</span>}</Link><Link className="icon-button" href="/account" aria-label="My account"><Icon name="user"/></Link><button className="language-toggle" aria-label="Switch language" onClick={()=>setLocale(locale==='en'?'ar':'en')}><Icon name="globe" size={14}/>{locale==='en'?'AR':'EN'}</button></div>
    </div>
    <nav className={'main-nav '+(menu?'is-open':'')} aria-label="Main navigation"><div className="shell nav-inner">{links.map(([label,path])=><Link onClick={()=>setMenu(false)} key={path} href={path} className={pathname===path?'current':''}>{locale==='ar'?ar[label]:label}</Link>)}<Link href="/contact" onClick={()=>setMenu(false)}> {locale==='ar'?'تواصلي معنا':'Contact / Concierge'}</Link></div></nav>
  </header>
  {children}
  <section className="newsletter-band"><div className="shell newsletter-inner"><div><span className="eyebrow">THE BY SARA LETTER</span><h2>Good things take time.<br/><em>Stay in the know.</em></h2></div><div className="newsletter-side"><p>A more considered beauty experience is on its way. Explore our editorial and reach us once verified contact channels are configured.</p><Link className="button button-cream" href="/about">Our story <Icon name="arrow" size={16}/></Link></div></div></section>
  <footer className="site-footer"><div className="shell footer-columns"><div><Link className="footer-logo" href="/">BY SARA</Link><p className="footer-tag">BEAUTY, REFINED.</p><p className="foot-body">An intentional space for beauty discovery, inspired by the warmth and artistry of the Levant.</p></div><div><h3>EXPLORE</h3><Link href="/shop">Shop All</Link><Link href="/brands">Brands</Link><Link href="/categories">Categories</Link><Link href="/gifting">Sets & Gifting</Link></div><div><h3>CUSTOMER CARE</h3><Link href="/contact">Contact</Link><Link href="/help">Help Center</Link><Link href="/inquiry-bag">Inquiry Bag</Link><Link href="/account">Your Account</Link></div><div><h3>THE FINE PRINT</h3><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/delivery">Delivery Information</Link><Link href="/policies/returns">Returns</Link></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} BY SARA — Beauty, Refined.</span><span>Made for thoughtful beauty discovery · Lebanon</span></div></footer>
  <nav className="mobile-tabs" aria-label="Mobile quick navigation"><Link href="/"><Icon name="sparkle"/><span>Home</span></Link><Link href="/shop"><Icon name="search"/><span>Shop</span></Link><Link href="/wishlist"><Icon name="heart"/><span>Saved</span></Link><Link href="/inquiry-bag"><Icon name="bag"/><span>Inquiry</span></Link></nav>
 </>;
}
export function StoreLayout({children}:{children:React.ReactNode}){return <StoreProvider><Chrome>{children}</Chrome></StoreProvider>}
