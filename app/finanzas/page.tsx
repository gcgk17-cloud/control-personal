'use client'
import {useEffect,useState} from 'react'
import AuthGate from '@/components/AuthGate'
import {supabase} from '@/lib/supabase'
const money=(n:number)=>Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'})
export default function Page(){
 const[cards,setCards]=useState<any[]>([]),[ctx,setCtx]=useState<any[]>([]),[inst,setInst]=useState<any[]>([])
 const[card,setCard]=useState(''),[kind,setKind]=useState('cargo'),[amount,setAmount]=useState(''),[desc,setDesc]=useState(''),[msg,setMsg]=useState('')
 async function load(){
  const[c,t,i]=await Promise.all([
   supabase.from('credit_cards').select('*').order('name'),
   supabase.from('card_transactions').select('*,credit_cards(name)').order('occurred_at',{ascending:false}).limit(150),
   supabase.from('installments').select('*,credit_cards(name)').order('start_date',{ascending:false})
  ])
  setCards(c.data||[]);setCtx(t.data||[]);setInst(i.data||[])
 }
 useEffect(()=>{load()},[])
 async function addMovement(){
  if(!card||+amount<=0)return setMsg('Selecciona tarjeta y monto.')
  const c=cards.find(x=>x.id===card); if(!c)return
  const a=+amount
  const delta=kind==='cargo'?a:-a
  const newBalance=Math.max(0,Number(c.current_balance||0)+delta)
  const favorable=Math.max(0,Number(c.favorable_balance||0)+(kind==='cargo'?-a:a)-Math.max(0,a-Number(c.current_balance||0)))
  const available=Math.max(0,Number(c.credit_limit||0)-newBalance)
  const{error}=await supabase.from('card_transactions').insert({card_id:card,type:kind,amount:a,description:desc})
  if(error)return setMsg(error.message)
  await supabase.from('credit_cards').update({current_balance:newBalance,available_credit:available,favorable_balance:favorable,last_updated:new Date().toISOString()}).eq('id',card)
  setAmount('');setDesc('');setMsg('✓ Movimiento guardado');load()
 }
 const totalDebt=cards.reduce((s,c)=>s+Number(c.current_balance||0),0)
 const totalAvail=cards.reduce((s,c)=>s+Number(c.available_credit ?? Math.max(0,Number(c.credit_limit)-Number(c.current_balance||0))),0)
 const totalFav=cards.reduce((s,c)=>s+Number(c.favorable_balance||0),0)
 const monthly=inst.reduce((s,i)=>s+(Number(i.paid_months)<Number(i.months)?Number(i.total_amount)/Number(i.months):0),0)
 return <AuthGate>
  <h1>💳 Finanzas</h1>
  <div className="grid">
   <div className="card"><span className="muted">Deuda tarjetas</span><div className="kpi">{money(totalDebt)}</div></div>
   <div className="card"><span className="muted">Crédito disponible</span><div className="kpi">{money(totalAvail)}</div></div>
   <div className="card"><span className="muted">Saldos a favor</span><div className="kpi">{money(totalFav)}</div></div>
   <div className="card"><span className="muted">MSI mensuales</span><div className="kpi">{money(monthly)}</div></div>
  </div>

  <div className="card section"><h3>Registrar movimiento de tarjeta</h3>
   <div className="form-row">
    <select className="input" value={card} onChange={e=>setCard(e.target.value)}><option value="">Selecciona tarjeta</option>{cards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <select className="input" value={kind} onChange={e=>setKind(e.target.value)}><option value="cargo">Compra / cargo</option><option value="pago">Pago</option><option value="abono">Abono</option></select>
    <input className="input" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Monto"/>
    <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descripción"/>
    <button className="btn" onClick={addMovement}>Guardar</button>
   </div>{msg&&<p className="status">{msg}</p>}
  </div>

  <div className="card section"><h3>Tarjetas</h3><div className="table-wrap"><table><thead><tr><th>Tarjeta</th><th>Límite</th><th>Deuda actual</th><th>Disponible</th><th>Saldo a favor</th><th>Último corte</th><th>Pago sin intereses</th></tr></thead><tbody>
   {cards.map(c=><tr key={c.id}><td><b>{c.name}</b></td><td>{money(c.credit_limit)}</td><td>{money(c.current_balance)}</td><td>{money(c.available_credit ?? Number(c.credit_limit)-Number(c.current_balance))}</td><td>{money(c.favorable_balance)}</td><td>{c.statement_date?new Date(c.statement_date+'T12:00:00').toLocaleDateString('es-MX'):'—'}</td><td>{money(c.no_interest_payment)}</td></tr>)}
  </tbody></table></div></div>

  <div className="card section"><h3>Movimientos recientes de tarjetas</h3><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Tarjeta</th><th>Tipo</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
   {ctx.length===0?<tr><td colSpan={5}>Sin movimientos posteriores cargados.</td></tr>:ctx.map(x=><tr key={x.id}><td>{new Date(x.occurred_at).toLocaleDateString('es-MX')}</td><td>{x.credit_cards?.name||'—'}</td><td>{x.type}</td><td>{x.description||'—'}</td><td>{money(x.amount)}</td></tr>)}
  </tbody></table></div></div>
 </AuthGate>
}