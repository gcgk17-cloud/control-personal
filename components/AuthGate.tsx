'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
export default function AuthGate({children}:{children:React.ReactNode}){
 const [ready,setReady]=useState(false); const [ok,setOk]=useState(false)
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setOk(!!data.session);setReady(true)}); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setOk(!!s)); return()=>data.subscription.unsubscribe()},[])
 if(!ready)return <div className="card">Cargando…</div>
 if(!ok)return <div className="card"><h3>🔐 Inicia sesión</h3><p className="muted">Tus datos personales se guardan separados y protegidos por usuario.</p><Link className="btn inline" href="/login">Ir a acceso</Link></div>
 return <>{children}</>
}