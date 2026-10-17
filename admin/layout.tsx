import {requireStaffCapability} from '@/lib/server/staff';
import Link from 'next/link';
export const dynamic='force-dynamic';
export default async function AdminBoundary({children}:{children:React.ReactNode}) {
 const allowed=await requireStaffCapability('catalog:read');
 if(!allowed)return <main className="shell page-body" style={{minHeight:'65vh'}}><span className="eyebrow">BY SARA · PRIVATE ADMIN</span><h1 className="display-title">Administrative access restricted</h1><p>Sign in with an authorized Neon Auth identity and a verified active staff profile. An account alone does not grant staff permissions.</p><Link href="/staff-login" className="button button-dark">Authorized staff sign-in</Link></main>;
 return <>{children}</>;
}
