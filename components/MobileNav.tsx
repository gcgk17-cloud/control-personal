'use client'
import {useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

export default function MobileNav(){
 const path=usePathname(),[open,setOpen]=useState(false)
 return <>
  {open&&<div className="quick-add-backdrop" onClick={()=>setOpen(false)}><div className="quick-add-sheet" onClick={e=>e.stopPropagation()}><div className="section-head"><h3>＋ Registrar</h3><button className="icon-btn" onClick={()=>setOpen(false)}>✕</button></div><div className="quick-add-grid"><Link href="/finanzas" onClick={()=>setOpen(false)}>💸<b>Gasto</b></Link><Link href="/alimentacion" onClick={()=>setOpen(false)}>🍎<b>Comida</b></Link><Link href="/peso" onClick={()=>setOpen(false)}>⚖️<b>Peso</b></Link><Link href="/running" onClick={()=>setOpen(false)}>🏃<b>Running</b></Link><Link href="/gimnasio" onClick={()=>setOpen(false)}>🏋️<b>Gimnasio</b></Link><Link href="/agenda" onClick={()=>setOpen(false)}>📅<b>Agenda</b></Link></div></div></div>}
  <nav className="mobile-nav" aria-label="Navegación móvil">
   <Link href="/" className={path==='/'?'active':''}><span>🏠</span><small>Inicio</small></Link>
   <Link href="/finanzas" className={path==='/finanzas'?'active':''}><span>💳</span><small>Finanzas</small></Link>
   <button className="mobile-add" onClick={()=>setOpen(true)}><span>＋</span><small>Registrar</small></button>
   <Link href="/running" className={path==='/running'?'active':''}><span>🏃</span><small>Running</small></Link>
   <Link href="/agenda" className={path==='/agenda'?'active':''}><span>📅</span><small>Agenda</small></Link>
  </nav>
 </>
}
