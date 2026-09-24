'use client'
import {useEffect,useState} from 'react'
import AuthGate from '@/components/AuthGate'
import {supabase} from '@/lib/supabase'

const money=(n:number)=>Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'})
const dateMX=(d:any)=>d?new Date(String(d).slice(0,10)+'T12:00:00').toLocaleDateString('es-MX'):'—'
const isoLocal=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

function fridayOfWeek(now=new Date()){
  const d=new Date(now.getFullYear(),now.getMonth(),now.getDate())
  const day=d.getDay()
  const diff=day>=5 ? day-5 : day+2
  d.setDate(d.getDate()-diff)
  return d
}
function mondayOfWeek(now=new Date()){
  const d=new Date(now.getFullYear(),now.getMonth(),now.getDate())
  const day=d.getDay()
  d.setDate(d.getDate()-(day===0?6:day-1))
  return d
}

export default function Page(){
 const[cards,setCards]=useState<any[]>([])
 const[ctx,setCtx]=useState<any[]>([])
 const[inst,setInst]=useState<any[]>([])
 const[accounts,setAccounts]=useState<any[]>([])
 const[transactions,setTransactions]=useState<any[]>([])
 const[card,setCard]=useState(''),[kind,setKind]=useState('cargo'),[amount,setAmount]=useState(''),[desc,setDesc]=useState(''),[msg,setMsg]=useState('')
 const[account,setAccount]=useState(''),[accountKind,setAccountKind]=useState('ingreso'),[accountAmount,setAccountAmount]=useState(''),[accountDesc,setAccountDesc]=useState(''),[accountMsg,setAccountMsg]=useState('')

 async function ensureEdenredRecharge(accountRows:any[]){
  const eden=accountRows.find(a=>String(a.name).toLowerCase()==='edenred')
  if(!eden)return false
  const today=new Date()
  // Do not credit a future Friday. Before Friday, no automatic recharge for the current week.
  if(today.getDay()!==0 && today.getDay()<5)return false
  const friday=fridayOfWeek(today)
  const fridayISO=isoLocal(friday)
  if(eden.last_auto_recharge_date===fridayISO)return false

  const recharge=Number(eden.weekly_recharge||328.47)
  const newBalance=Number(eden.balance||0)+recharge
  const{error:txError}=await supabase.from('transactions').insert({
    account_id:eden.id,
    type:'ingreso',
    amount:recharge,
    description:`Recarga automática Edenred - viernes ${fridayISO}`
  })
  if(txError)return false
  const{error:updateError}=await supabase.from('accounts').update({
    balance:newBalance,
    last_auto_recharge_date:fridayISO
  }).eq('id',eden.id)
  return !updateError
 }

 async function load(skipAuto=false){
  const[c,t,i,a,tr]=await Promise.all([
   supabase.from('credit_cards').select('*').order('name'),
   supabase.from('card_transactions').select('*,credit_cards(name)').order('occurred_at',{ascending:false}).limit(150),
   supabase.from('installments').select('*,credit_cards(name)').order('start_date',{ascending:false}),
   supabase.from('accounts').select('*').order('name'),
   supabase.from('transactions').select('*,accounts(name)').order('created_at',{ascending:false}).limit(250)
  ])
  const accountRows=a.data||[]
  if(!skipAuto && await ensureEdenredRecharge(accountRows)){
    return load(true)
  }
  setCards(c.data||[]);setCtx(t.data||[]);setInst(i.data||[]);setAccounts(accountRows);setTransactions(tr.data||[])
 }

 useEffect(()=>{load()},[])

 async function addMovement(){
  if(!card||+amount<=0)return setMsg('Selecciona tarjeta y monto.')
  const c=cards.find(x=>x.id===card); if(!c)return
  const a=+amount, debt=Number(c.current_balance||0), fav=Number(c.favorable_balance||0)
  let newBalance=debt, newFav=fav
  if(kind==='cargo'){
    const useFav=Math.min(fav,a); newFav=fav-useFav; newBalance=debt+(a-useFav)
  }else{
    const reduce=Math.min(debt,a); newBalance=debt-reduce; newFav=fav+(a-reduce)
  }
  const available=Math.max(0,Number(c.credit_limit||0)-newBalance)
  const{error}=await supabase.from('card_transactions').insert({card_id:card,type:kind,amount:a,description:desc})
  if(error)return setMsg(error.message)
  await supabase.from('credit_cards').update({current_balance:newBalance,available_credit:available,favorable_balance:newFav,last_updated:new Date().toISOString()}).eq('id',card)
  setAmount('');setDesc('');setMsg('✓ Movimiento guardado');load()
 }

 async function addAccountMovement(){
  if(!account||+accountAmount<=0)return setAccountMsg('Selecciona cuenta y monto.')
  const a=accounts.find(x=>x.id===account); if(!a)return
  const n=+accountAmount
  const newBalance=accountKind==='ingreso'?Number(a.balance||0)+n:Math.max(0,Number(a.balance||0)-n)
  const{error}=await supabase.from('transactions').insert({account_id:account,type:accountKind,amount:n,description:accountDesc})
  if(error)return setAccountMsg(error.message)
  await supabase.from('accounts').update({balance:newBalance}).eq('id',account)
  setAccountAmount('');setAccountDesc('');setAccountMsg('✓ Movimiento guardado');load()
 }

 const totalDebt=cards.reduce((s,c)=>s+Number(c.current_balance||0),0)
 const totalAvail=cards.reduce((s,c)=>s+Number(c.available_credit ?? Math.max(0,Number(c.credit_limit)-Number(c.current_balance||0))),0)
 const totalFav=cards.reduce((s,c)=>s+Number(c.favorable_balance||0),0)
 const monthly=inst.reduce((s,i)=>s+(Number(i.paid_months)<Number(i.months)?Number(i.monthly_payment||Number(i.total_amount)/Number(i.months)):0),0)
 const bankCash=accounts.filter(a=>a.account_type!=='voucher').reduce((s,a)=>s+Number(a.balance||0),0)
 const edenred=accounts.find(a=>String(a.name).toLowerCase()==='edenred')
 const edenredBalance=Number(edenred?.balance||0)

 const monday=isoLocal(mondayOfWeek())
 const foodSpent=transactions
   .filter(t=>String(t.accounts?.name||'').toLowerCase()==='edenred' && t.type==='gasto' && String(t.created_at).slice(0,10)>=monday)
   .reduce((s,t)=>s+Number(t.amount||0),0)
 const foodBudget=Number(edenred?.weekly_food_budget||300)
 const foodRemaining=Math.max(0,foodBudget-foodSpent)
 const expectedWeeklyExcess=Number(edenred?.weekly_recharge||328.47)-foodBudget

 const estimatedPayment=(c:any)=>Number(c.no_interest_payment||0)
 const activeInst=inst.filter(i=>Number(i.paid_months)<Number(i.months))
 const msiPending=activeInst.reduce((s,i)=>s+Number(i.pending_balance ?? Number(i.total_amount)*(1-Number(i.paid_months)/Number(i.months))),0)
 const pendingMsiByCard=(cardId:string)=>activeInst.filter(i=>i.card_id===cardId).reduce((s,i)=>s+Number(i.pending_balance ?? Number(i.total_amount)*(1-Number(i.paid_months)/Number(i.months))),0)

 return <AuthGate>
  <h1>💳 Finanzas</h1>
  <div className="grid">
   <div className="card"><span className="muted">Dinero disponible</span><div className="kpi">{money(bankCash)}</div><small>BBVA ahorro + Nu</small></div>
   <div className="card"><span className="muted">Saldo Edenred</span><div className="kpi">{money(edenredBalance)}</div><small>Vales, separado del efectivo</small></div>
   <div className="card"><span className="muted">Deuda tarjetas</span><div className="kpi">{money(totalDebt)}</div></div>
   <div className="card"><span className="muted">Crédito disponible</span><div className="kpi">{money(totalAvail)}</div></div>
   <div className="card"><span className="muted">Saldos a favor tarjetas</span><div className="kpi">{money(totalFav)}</div></div>
   <div className="card"><span className="muted">MSI mensuales</span><div className="kpi">{money(monthly)}</div></div>
   <div className="card"><span className="muted">Saldo pendiente MSI</span><div className="kpi">{money(msiPending)}</div></div>
  </div>

  <div className="card section">
   <h3>🍽️ Edenred · control semanal</h3>
   <div className="grid">
    <div><span className="muted">Recarga cada viernes</span><div className="kpi">{money(edenred?.weekly_recharge||328.47)}</div></div>
    <div><span className="muted">Presupuesto comida</span><div className="kpi">{money(foodBudget)}</div></div>
    <div><span className="muted">Gastado esta semana</span><div className="kpi">{money(foodSpent)}</div></div>
    <div><span className="muted">Comida restante</span><div className="kpi">{money(foodRemaining)}</div></div>
    <div><span className="muted">Excedente mínimo semanal</span><div className="kpi">{money(expectedWeeklyExcess)}</div><small>Permanece acumulado en Edenred</small></div>
   </div>
   <p className="muted">La recarga de {money(edenred?.weekly_recharge||328.47)} se registra automáticamente una vez por semana al abrir la app después de la recarga del viernes. El saldo acumulado no se mezcla con BBVA ahorro ni Nu.</p>
  </div>

  <div className="card section">
   <h3>🏦 Cuentas y dinero disponible</h3>
   <div className="table-wrap"><table><thead><tr><th>Cuenta</th><th>Tipo</th><th>Saldo disponible</th></tr></thead><tbody>
    {accounts.length===0?<tr><td colSpan={3}>Sin cuentas registradas.</td></tr>:accounts.map(a=><tr key={a.id}><td><b>{a.name}</b></td><td>{a.account_type==='voucher'?'Vales':'Cuenta'}</td><td>{money(a.balance)}</td></tr>)}
   </tbody></table></div>
   <div className="form-row" style={{marginTop:16}}>
    <select className="input" value={account} onChange={e=>setAccount(e.target.value)}><option value="">Selecciona cuenta</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
    <select className="input" value={accountKind} onChange={e=>setAccountKind(e.target.value)}><option value="ingreso">Ingreso / depósito</option><option value="gasto">Gasto / retiro</option></select>
    <input className="input" type="number" value={accountAmount} onChange={e=>setAccountAmount(e.target.value)} placeholder="Monto"/>
    <input className="input" value={accountDesc} onChange={e=>setAccountDesc(e.target.value)} placeholder="Descripción"/>
    <button className="btn" onClick={addAccountMovement}>Guardar</button>
   </div>{accountMsg&&<p className="status">{accountMsg}</p>}
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

  <div className="card section"><h3>Tarjetas</h3><div className="table-wrap"><table><thead><tr><th>Tarjeta</th><th>Límite</th><th>Deuda actual</th><th>Pendiente a MSI</th><th>Disponible</th><th>Saldo a favor</th><th>Próximo pago estimado</th><th>Fecha límite</th></tr></thead><tbody>
   {cards.map(c=><tr key={c.id}><td><b>{c.name}</b></td><td>{money(c.credit_limit)}</td><td>{money(c.current_balance)}</td><td>{pendingMsiByCard(c.id)>0?money(pendingMsiByCard(c.id)):'—'}</td><td>{money(c.available_credit ?? Number(c.credit_limit)-Number(c.current_balance))}</td><td>{money(c.favorable_balance)}</td><td>{money(estimatedPayment(c))}</td><td>{dateMX(c.due_date)}</td></tr>)}
  </tbody></table></div></div>

  <div className="card section"><h3>📆 Compras a meses sin intereses</h3><div className="table-wrap"><table><thead><tr><th>Tarjeta</th><th>Compra</th><th>Pago mensual</th><th>Avance</th><th>Saldo pendiente</th></tr></thead><tbody>
   {activeInst.length===0?<tr><td colSpan={5}>Sin MSI activos.</td></tr>:activeInst.map(i=><tr key={i.id}><td><b>{i.credit_cards?.name||'—'}</b></td><td>{i.description}</td><td>{money(i.monthly_payment||Number(i.total_amount)/Number(i.months))}</td><td>{i.paid_months} de {i.months}</td><td>{money(i.pending_balance ?? Number(i.total_amount)*(1-Number(i.paid_months)/Number(i.months)))}</td></tr>)}
  </tbody></table></div></div>

  <div className="card section"><h3>Movimientos recientes de tarjetas</h3><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Tarjeta</th><th>Tipo</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
   {ctx.length===0?<tr><td colSpan={5}>Sin movimientos posteriores cargados.</td></tr>:ctx.map(x=><tr key={x.id}><td>{new Date(x.occurred_at).toLocaleDateString('es-MX')}</td><td>{x.credit_cards?.name||'—'}</td><td>{x.type}</td><td>{x.description||'—'}</td><td>{money(x.amount)}</td></tr>)}
  </tbody></table></div></div>
 </AuthGate>
}