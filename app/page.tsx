'use client'
import {useEffect,useState} from 'react'
import AuthGate from '@/components/AuthGate'
import {supabase} from '@/lib/supabase'
import Link from 'next/link'

const PLAN:any[]=[
['2026-09-18',0,'Descanso'],['2026-09-19',12,'Tirada larga'],['2026-09-20',5,'Recuperación'],['2026-09-21',0,'Descanso'],['2026-09-22',7,'Suave'],['2026-09-23',8,'Cambios de ritmo'],['2026-09-24',6,'Suave'],['2026-09-25',0,'Descanso'],['2026-09-26',14,'Tirada larga'],['2026-09-27',5,'Recuperación'],['2026-09-28',0,'Descanso'],['2026-09-29',8,'Suave'],['2026-09-30',8,'Cuestas'],
['2026-10-01',6,'Suave'],['2026-10-02',0,'Descanso'],['2026-10-03',16,'Tirada larga'],['2026-10-04',5,'Recuperación'],['2026-10-05',0,'Descanso'],['2026-10-06',8,'Suave'],['2026-10-07',10,'Progresivo'],['2026-10-08',7,'Suave'],['2026-10-09',0,'Descanso'],['2026-10-10',18,'Trail largo'],['2026-10-11',5,'Recuperación'],['2026-10-12',0,'Descanso'],['2026-10-13',8,'Suave'],['2026-10-14',10,'Cuestas'],['2026-10-15',7,'Suave'],['2026-10-16',0,'Descanso'],['2026-10-17',21,'Trail largo'],['2026-10-18',5,'Recuperación'],['2026-10-19',0,'Descanso'],['2026-10-20',8,'Suave'],['2026-10-21',10,'Ritmo controlado'],['2026-10-22',7,'Suave'],['2026-10-23',0,'Descanso'],['2026-10-24',24,'Trail largo'],['2026-10-25',5,'Recuperación'],['2026-10-26',0,'Descanso'],['2026-10-27',7,'Suave'],['2026-10-28',8,'Cuestas suaves'],['2026-10-29',6,'Suave'],['2026-10-30',0,'Descanso'],['2026-10-31',16,'Trail controlado'],
['2026-11-01',5,'Recuperación'],['2026-11-02',0,'Descanso'],['2026-11-03',6,'Suave'],['2026-11-04',5,'Suave + aceleraciones'],['2026-11-05',4,'Muy suave'],['2026-11-06',0,'Descanso'],['2026-11-07',30,'CARRERA']
]
function localDate(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}

export default function Home(){
 const[s,setS]=useState<any>({})
 useEffect(()=>{(async()=>{
  const start=new Date();start.setHours(0,0,0,0)
  const today=localDate()
  const[w,m,r,t,g,i]=await Promise.all([
   supabase.from('weight_logs').select('weight_kg').order('measured_at',{ascending:false}).limit(1),
   supabase.from('meals').select('calories').gte('eaten_at',start.toISOString()),
   supabase.from('running_logs').select('distance_km,calories').gte('run_at',start.toISOString()),
   supabase.from('transactions').select('type,amount'),
   supabase.from('gym_logs').select('id').gte('trained_at',start.toISOString()),
   supabase.from('installments').select('total_amount,months,paid_months')
  ])
  const tx=t.data||[],runs=r.data||[],plan=PLAN.find(x=>x[0]===today)
  setS({weight:w.data?.[0]?.weight_kg,cal:(m.data||[]).reduce((a,x)=>a+Number(x.calories),0),km:runs.reduce((a,x)=>a+Number(x.distance_km),0),burn:runs.reduce((a,x)=>a+Number(x.calories||0),0),money:tx.reduce((a,x)=>a+(x.type==='ingreso'?Number(x.amount):-Number(x.amount)),0),gym:g.data?.length||0,msi:(i.data||[]).reduce((a,x)=>a+(Number(x.paid_months)<Number(x.months)?Number(x.total_amount)/Number(x.months):0),0),plan})
 })()},[])
 const remaining=2200-(s.cal||0)
 const target=s.plan?.[1]??null, runType=s.plan?.[2]??'Sin plan'
 return <AuthGate>
  <h1>Hola 👋</h1><p className="muted">Tu resumen personal de hoy.</p>
  <div className="card section">
   <h3>🏃 Entrenamiento de hoy</h3>
   {target===null?<p className="muted">No hay entrenamiento programado para hoy.</p>:target===0?<><div className="kpi">Descanso</div><p className="muted">{runType}</p></>:<><div className="kpi">{target} km</div><p><b>{runType}</b></p><p className="muted">Llevas {(s.km||0).toFixed(1)} km hoy · {s.km>=target?'✓ objetivo cumplido':`faltan ${(target-(s.km||0)).toFixed(1)} km`}</p><Link className="btn" href="/running">Registrar carrera</Link></>}
  </div>
  <div className="grid">
   <div className="card">💰 Balance movimientos<div className="kpi">${(s.money||0).toLocaleString('es-MX',{minimumFractionDigits:2})}</div></div>
   <div className="card">🔥 Calorías<div className="kpi">{Math.round(s.cal||0)} / 2200</div><span className="muted">Consumidas hoy</span></div>
   <div className="card">⚖️ Peso<div className="kpi">{s.weight??'—'} kg</div><span className="muted">Meta 80–82 kg</span></div>
  </div>
  <div className="quick"><Link className="btn" href="/finanzas">＋ Gasto / ingreso</Link><Link className="btn" href="/alimentacion">＋ Comida</Link><Link className="btn" href="/peso">＋ Peso</Link><Link className="btn" href="/running">＋ Running</Link></div>
  <div className="grid">
   <div className="card"><h3>🏃 Realizado hoy</h3><div className="kpi">{(s.km||0).toFixed(1)} km</div><p className="muted">Gym: {s.gym||0} registros</p></div>
   <div className="card"><h3>🍎 Balance del día</h3><div className="kpi small">{Math.abs(Math.round(remaining))} kcal</div><p className="muted">{remaining>=0?'disponibles para hoy':'por encima de la meta inicial'}</p></div>
   <div className="card"><h3>💳 Compromisos</h3><div className="kpi small">${(s.msi||0).toLocaleString('es-MX',{maximumFractionDigits:0})}/mes</div><p className="muted">Mensualidades MSI activas estimadas.</p></div>
  </div>
 </AuthGate>
}