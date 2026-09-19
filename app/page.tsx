'use client'
import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import AuthGate from '@/components/AuthGate'
import {supabase} from '@/lib/supabase'

const TARGET=2200
const money=(n:number)=>n.toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0})
const PLAN:any[]=[
['2026-09-18',0,'Descanso'],['2026-09-19',12,'Tirada larga'],['2026-09-20',5,'Recuperación'],['2026-09-21',0,'Descanso'],['2026-09-22',7,'Suave'],['2026-09-23',8,'Cambios de ritmo'],['2026-09-24',6,'Suave'],['2026-09-25',0,'Descanso'],['2026-09-26',14,'Tirada larga'],['2026-09-27',5,'Recuperación'],['2026-09-28',0,'Descanso'],['2026-09-29',8,'Suave'],['2026-09-30',8,'Cuestas'],
['2026-10-01',6,'Suave'],['2026-10-02',0,'Descanso'],['2026-10-03',16,'Tirada larga'],['2026-10-04',5,'Recuperación'],['2026-10-05',0,'Descanso'],['2026-10-06',8,'Suave'],['2026-10-07',10,'Progresivo'],['2026-10-08',7,'Suave'],['2026-10-09',0,'Descanso'],['2026-10-10',18,'Trail largo'],['2026-10-11',5,'Recuperación'],['2026-10-12',0,'Descanso'],['2026-10-13',8,'Suave'],['2026-10-14',10,'Cuestas'],['2026-10-15',7,'Suave'],['2026-10-16',0,'Descanso'],['2026-10-17',21,'Trail largo'],['2026-10-18',5,'Recuperación'],['2026-10-19',0,'Descanso'],['2026-10-20',8,'Suave'],['2026-10-21',10,'Ritmo controlado'],['2026-10-22',7,'Suave'],['2026-10-23',0,'Descanso'],['2026-10-24',24,'Trail largo'],['2026-10-25',5,'Recuperación'],['2026-10-26',0,'Descanso'],['2026-10-27',7,'Suave'],['2026-10-28',8,'Cuestas suaves'],['2026-10-29',6,'Suave'],['2026-10-30',0,'Descanso'],['2026-10-31',16,'Trail controlado'],
['2026-11-01',5,'Recuperación'],['2026-11-02',0,'Descanso'],['2026-11-03',6,'Suave'],['2026-11-04',5,'Suave + aceleraciones'],['2026-11-05',4,'Muy suave'],['2026-11-06',0,'Descanso'],['2026-11-07',30,'CARRERA']
]
function localDate(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function monthStart(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).toISOString()}

export default function Page(){
 const[accounts,setAccounts]=useState<any[]>([]),[tx,setTx]=useState<any[]>([]),[cards,setCards]=useState<any[]>([]),[inst,setInst]=useState<any[]>([])
 const[meals,setMeals]=useState<any[]>([]),[weights,setWeights]=useState<any[]>([]),[runs,setRuns]=useState<any[]>([]),[gym,setGym]=useState<any[]>([])
 async function load(){
  const d=new Date();d.setHours(0,0,0,0)
  const[a,t,c,i,m,w,r,g]=await Promise.all([
   supabase.from('accounts').select('*'),
   supabase.from('transactions').select('*').order('occurred_at',{ascending:false}).limit(500),
   supabase.from('credit_cards').select('*'),
   supabase.from('installments').select('*'),
   supabase.from('meals').select('*').gte('eaten_at',d.toISOString()),
   supabase.from('weight_logs').select('*').order('measured_at',{ascending:false}).limit(2),
   supabase.from('running_logs').select('*').gte('run_at',d.toISOString()),
   supabase.from('gym_logs').select('*').gte('trained_at',d.toISOString())
  ])
  setAccounts(a.data||[]);setTx(t.data||[]);setCards(c.data||[]);setInst(i.data||[]);setMeals(m.data||[]);setWeights(w.data||[]);setRuns(r.data||[]);setGym(g.data||[])
 }
 useEffect(()=>{load()},[])
 const today=localDate(), plan=PLAN.find(x=>x[0]===today)
 const cash=accounts.reduce((s,a)=>s+Number(a.balance||0),0)+tx.reduce((s,x)=>s+(x.type==='ingreso'?Number(x.amount):-Number(x.amount)),0)
 const monthTx=tx.filter(x=>new Date(x.occurred_at)>=new Date(monthStart()))
 const income=monthTx.filter(x=>x.type==='ingreso').reduce((s,x)=>s+Number(x.amount),0)
 const expenses=monthTx.filter(x=>x.type==='gasto').reduce((s,x)=>s+Number(x.amount),0)
 const balance=income-expenses
 const debt=inst.reduce((s,i)=>s+Math.max(0,Number(i.total_amount)*(1-Number(i.paid_months)/Number(i.months))),0)
 const monthly=inst.reduce((s,i)=>s+(Number(i.paid_months)<Number(i.months)?Number(i.total_amount)/Number(i.months):0),0)
 const totalLimit=cards.reduce((s,c)=>s+Number(c.credit_limit||0),0)
 const credit=Math.max(0,totalLimit-debt)
 const nextPay=cards.filter(c=>c.payment_day).sort((a,b)=>Number(a.payment_day)-Number(b.payment_day))[0]
 const kcal=meals.reduce((s,x)=>s+Number(x.calories||0),0)
 const runKm=runs.reduce((s,x)=>s+Number(x.distance_km||0),0)
 const weight=weights[0]?Number(weights[0].weight_kg):null
 const weightDiff=weights.length>1 && weight!==null?weight-Number(weights[1].weight_kg):null
 return <AuthGate>
  <div className="dash-head"><div><h1>🏠 Inicio</h1><p className="muted">Tu situación de hoy, con prioridad en dinero.</p></div><Link className="btn" href="/finanzas">Registrar movimiento</Link></div>

  <h3 className="section-title">💰 Dinero</h3>
  <div className="grid finance-grid">
   <Link href="/finanzas" className="card kpi-card primary-kpi"><span className="muted">Dinero disponible</span><div className="kpi">{money(cash)}</div><small>Cuentas + movimientos registrados</small></Link>
   <div className="card kpi-card"><span className="muted">Ingresos del mes</span><div className="kpi">{money(income)}</div><small>Mes actual</small></div>
   <div className="card kpi-card"><span className="muted">Gastos del mes</span><div className="kpi">{money(expenses)}</div><small>Mes actual</small></div>
   <div className="card kpi-card"><span className="muted">Balance del mes</span><div className="kpi">{money(balance)}</div><small>{balance>=0?'Ingresos mayores a gastos':'Gastos mayores a ingresos'}</small></div>
  </div>

  <h3 className="section-title">💳 Tarjetas y compromisos</h3>
  <div className="grid">
   <div className="card"><span className="muted">Deuda MSI pendiente</span><div className="kpi">{money(debt)}</div></div>
   <div className="card"><span className="muted">Compromiso MSI mensual</span><div className="kpi">{money(monthly)}</div></div>
   <div className="card"><span className="muted">Crédito estimado disponible</span><div className="kpi">{money(credit)}</div><small>Límites menos MSI pendientes</small></div>
   <div className="card"><span className="muted">Próximo día de pago</span><div className="kpi">{nextPay?`Día ${nextPay.payment_day}`:'—'}</div><small>{nextPay?.name||'Sin tarjeta registrada'}</small></div>
  </div>

  <h3 className="section-title">📍 Hoy</h3>
  <div className="grid">
   <Link href="/alimentacion" className="card"><span className="muted">🍎 Alimentación</span><div className="kpi">{Math.round(kcal)} / {TARGET}</div><small>{Math.max(0,Math.round(TARGET-kcal))} kcal restantes</small></Link>
   <Link href="/peso" className="card"><span className="muted">⚖️ Peso actual</span><div className="kpi">{weight?`${weight.toFixed(1)} kg`:'—'}</div><small>{weightDiff===null?'Sin comparación':`${weightDiff>0?'+':''}${weightDiff.toFixed(1)} kg vs. registro anterior`}</small></Link>
   <Link href="/running" className="card"><span className="muted">🏃 Running</span><div className="kpi">{plan?`${runKm.toFixed(1)} / ${plan[1]} km`:`${runKm.toFixed(1)} km`}</div><small>{plan?plan[2]:'Sin plan para hoy'}</small></Link>
   <Link href="/gimnasio" className="card"><span className="muted">🏋️ Gimnasio</span><div className="kpi">{gym.length}</div><small>{gym.length?'registros hoy':'Pendiente / sin registro'}</small></Link>
  </div>

  <div className="two">
   <div className="card section"><h3>⚡ Accesos rápidos</h3><div className="quick"><Link className="btn" href="/finanzas">💳 Finanzas</Link><Link className="btn secondary" href="/alimentacion">🍎 Comida</Link><Link className="btn secondary" href="/running">🏃 Running</Link><Link className="btn secondary" href="/peso">⚖️ Peso</Link></div></div>
   <div className="card section"><h3>Resumen financiero</h3><p><b>{cards.length}</b> tarjetas registradas</p><p><b>{inst.filter(i=>Number(i.paid_months)<Number(i.months)).length}</b> compras MSI activas</p><p className="muted">Los importes se actualizan con tus registros en Finanzas.</p></div>
  </div>
 </AuthGate>
}