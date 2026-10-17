import Link from 'next/link';
import {getStaffContext} from '@/lib/server/staff';
import {can,type Capability} from '@/lib/authorization';
const routes:{name:string;url:string;capability:Capability}[]=[
 {name:'Overview',url:'/admin',capability:'catalog:read'},
 {name:'Products CMS',url:'/admin/products',capability:'catalog:read'},
 {name:'Brands & Categories',url:'/admin/taxonomy',capability:'catalog:read'},
 {name:'Inventory',url:'/admin/inventory',capability:'catalog:read'},
 {name:'Media Manager',url:'/admin/media',capability:'catalog:read'},
 {name:'Audit & Security',url:'/admin/security',capability:'audit:read'}
];
export async function AdminLayout({children}:{children:React.ReactNode}){
 const current=await getStaffContext();const role=current.status==='ok'?current.staff.role:null;
 return <div className="layout"><aside className="sidebar"><Link className="brand" style={{color:'white'}} href="/">BY SARA</Link><p style={{fontSize:12}}>ADMINISTRATION · {role?.toUpperCase()??'RESTRICTED'}</p>{routes.filter(r=>can(role,r.capability)).map(({name,url})=><Link key={url} href={url}>{name}</Link>)}<p className="muted" style={{fontSize:11,marginTop:20}}>Other Admin modules remain in development. No sample records are shown.</p><Link href="/">View Storefront</Link></aside><section className="workspace">{children}</section></div>
}
