import {StoreLayout} from '@/components/StoreLayout';
import {PageIntro} from '@/components/store/Catalog';
import {Breadcrumbs} from '@/components/store/Editorial';
import {publishedPolicy} from '@/lib/server/catalog';
import Link from 'next/link';
export const dynamic='force-dynamic';
const titles:Record<string,string>={privacy:'Privacy Policy',terms:'Terms & Conditions',delivery:'Delivery Information',returns:'Returns & Exchanges',payment:'Payment Information'};
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 let policy=null;
 try{policy=await publishedPolicy(slug);}catch{policy=null;}
 const title=policy?.title||titles[slug]||'Store Information';
 return <StoreLayout><main className="shell page-body"><Breadcrumbs items={[{label:'Help',href:'/help'},{label:title}]}/>
  <PageIntro eyebrow="CUSTOMER CARE · POLICIES" title={title} description={policy?'Published customer information from BY SARA.':'Official terms must be reviewed and approved before publication.'}/>
  {policy?<article className="policy-unpublished"><span className="eyebrow">PUBLISHED CUSTOMER POLICY</span><p className="tiny-muted">Published: {new Date(policy.publishedAt).toLocaleDateString('en-GB',{timeZone:'Asia/Beirut'})}</p><div style={{whiteSpace:'pre-wrap',lineHeight:1.85}}>{policy.body}</div></article>:
  <div className="policy-unpublished"><span className="eyebrow">DOCUMENT STATUS · NOT AVAILABLE</span><h2>This policy is not yet published.</h2><p>BY SARA has not made an approved {title.toLowerCase()} available in this new project. Unverified legal terms will not be generated.</p><Link href="/help" className="button button-dark">Return to Help Center</Link></div>}
 </main></StoreLayout>
}
