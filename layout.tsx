import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:{default:'BY SARA — Beauty, Refined.',template:'%s | BY SARA'},description:'A thoughtful new beauty boutique. Product information and availability are published only after verification.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
