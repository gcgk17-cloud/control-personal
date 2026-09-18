import './globals.css'; import Sidebar from '@/components/Sidebar'
export const metadata={title:'Control Personal',description:'Finanzas, nutrición y entrenamiento'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><div className="shell"><Sidebar/><main className="main">{children}</main></div></body></html>}
