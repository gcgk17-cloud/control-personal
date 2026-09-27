'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
export default function MobileNav(){
 const path=usePathname()
 const items=[['/','🏠','Inicio'],['/finanzas','💳','Finanzas'],['/alimentacion','＋','Registrar'],['/running','🏃','Running'],['/gimnasio','☰','Más']]
 return <nav className="mobile-nav" aria-label="Navegación móvil">{items.map(([href,icon,label],i)=><Link key={href} href={href} className={`${path===href?'active':''} ${i===2?'mobile-add':''}`}><span>{icon}</span><small>{label}</small></Link>)}</nav>
}
