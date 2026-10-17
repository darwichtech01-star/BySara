'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {authClient} from '@/lib/auth/client';

export function AccountAuthForm(){
 const router=useRouter();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const [pending,setPending]=useState(false);const [error,setError]=useState('');
 const enabled=process.env.NEXT_PUBLIC_ENABLE_CUSTOMER_AUTH==='true';
 if(!enabled)return <div className="auth-notice" role="status">Sign-in is being prepared. This app does not collect account credentials until its independent Neon Auth service is tested and enabled.</div>;
 async function login(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');setPending(true);
  try{
   const result=await authClient.signIn.email({email,password});
   if(result.error){setError('Sign-in was unsuccessful. Check your credentials and try again.');return;}
   setPassword('');router.refresh();
  }catch{setError('Sign-in is temporarily unavailable.');}finally{setPending(false)}
 }
 return <form onSubmit={login} className="disabled-form"><label>Email address<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button disabled={pending} type="submit" className="button button-dark">{pending?'Signing in…':'Sign in securely'}</button><p className="tiny-muted">Sign-up and password recovery remain disabled until email verification and provider delivery are approved.</p></form>;
}
