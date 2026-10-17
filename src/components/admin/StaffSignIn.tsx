'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {authClient} from '@/lib/auth/client';

/** Staff-only sign-in has its own explicit release flag; customer sign-in stays independent. */
export function StaffSignIn(){
 const router=useRouter();
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [pending,setPending]=useState(false);
 const [message,setMessage]=useState('');
 if(process.env.NEXT_PUBLIC_ENABLE_STAFF_LOGIN!=='true'){
  return <div className="auth-notice" role="status">Staff sign-in is disabled pending Neon Auth and Owner onboarding verification. No credentials are collected here.</div>;
 }
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage('');setPending(true);
  try{
   const result=await authClient.signIn.email({email,password});
   if(result.error){setMessage('Sign-in could not be completed. Verify your credentials and contact the authorized Owner.');return;}
   setPassword('');router.replace('/admin');router.refresh();
  }catch{setMessage('Secure authentication is temporarily unavailable.');}
  finally{setPending(false);}
 }
 return <form className="disabled-form" onSubmit={submit}>
  <label>Staff email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
  {message&&<p role="alert">{message}</p>}
  <button className="button button-dark" type="submit" disabled={pending}>{pending?'Verifying…':'Sign in'}</button>
  <p className="tiny-muted">No public staff registration, invitation, password reset or automatic role assignment is offered on this page. <Link href="/">Return to storefront</Link>.</p>
 </form>;
}
