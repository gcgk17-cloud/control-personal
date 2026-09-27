import './globals.css'
import type {Metadata,Viewport} from 'next'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import PWARegister from '@/components/PWARegister'

export const metadata:Metadata={
 title:'Control Personal',
 description:'Finanzas, nutrición y entrenamiento',
 manifest:'/manifest.webmanifest',
 appleWebApp:{capable:true,statusBarStyle:'default',title:'Control Personal'},
 icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:'/icon-192.png'}
}
export const viewport:Viewport={themeColor:'#101827',width:'device-width',initialScale:1,viewportFit:'cover'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><PWARegister/><div className="shell"><Sidebar/><main className="main">{children}</main></div><MobileNav/></body></html>}
