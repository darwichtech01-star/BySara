import {StaffSignIn} from '@/components/admin/StaffSignIn';
export const dynamic='force-dynamic';
export const metadata={title:'Authorized staff sign-in | BY SARA',robots:{index:false,follow:false}};
export default function StaffLoginPage(){
 return <main className="shell page-body" style={{minHeight:'70vh',maxWidth:'720px',margin:'0 auto'}}>
  <span className="eyebrow">BY SARA · SECURE OPERATIONS</span>
  <h1 className="display-title">Staff sign-in</h1>
  <p>Access is restricted to verified Neon Auth users who also have a separately approved active BY SARA staff role.</p>
  <StaffSignIn/>
 </main>;
}
