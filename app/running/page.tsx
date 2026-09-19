'use client'
import {useEffect,useMemo,useState} from 'react'
import AuthGate from '@/components/AuthGate'
import {supabase} from '@/lib/supabase'

type Plan={date:string,km:number,type:string,notes:string}
const PLAN:Plan[]=[
{date:'2026-09-18',km:0,type:'Descanso',notes:'Recuperación antes de iniciar el bloque.'},
{date:'2026-09-19',km:12,type:'Tirada larga',notes:'Ritmo cómodo. Prioriza tiempo en movimiento.'},
{date:'2026-09-20',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-09-21',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-09-22',km:7,type:'Suave',notes:'Ritmo conversacional.'},
{date:'2026-09-23',km:8,type:'Cambios de ritmo',notes:'Incluye cambios controlados, sin llegar al máximo.'},
{date:'2026-09-24',km:6,type:'Suave',notes:'Rodaje fácil.'},
{date:'2026-09-25',km:0,type:'Descanso',notes:'Recuperación.'},
{date:'2026-09-26',km:14,type:'Tirada larga',notes:'Preferentemente terreno ondulado o trail.'},
{date:'2026-09-27',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-09-28',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-09-29',km:8,type:'Suave',notes:'Ritmo conversacional.'},
{date:'2026-09-30',km:8,type:'Cuestas',notes:'Busca desnivel; controla el esfuerzo.'},
{date:'2026-10-01',km:6,type:'Suave',notes:'Rodaje fácil.'},
{date:'2026-10-02',km:0,type:'Descanso',notes:'Recuperación.'},
{date:'2026-10-03',km:16,type:'Tirada larga',notes:'Trail si es posible.'},
{date:'2026-10-04',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-10-05',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-10-06',km:8,type:'Suave',notes:'Ritmo conversacional.'},
{date:'2026-10-07',km:10,type:'Progresivo',notes:'Empieza suave y termina controladamente más rápido.'},
{date:'2026-10-08',km:7,type:'Suave',notes:'Rodaje fácil.'},
{date:'2026-10-09',km:0,type:'Descanso',notes:'Recuperación.'},
{date:'2026-10-10',km:18,type:'Trail largo',notes:'Practica hidratación y alimentación.'},
{date:'2026-10-11',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-10-12',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-10-13',km:8,type:'Suave',notes:'Ritmo conversacional.'},
{date:'2026-10-14',km:10,type:'Cuestas',notes:'Trabajo de desnivel sin vaciarte.'},
{date:'2026-10-15',km:7,type:'Suave',notes:'Rodaje fácil.'},
{date:'2026-10-16',km:0,type:'Descanso',notes:'Recuperación.'},
{date:'2026-10-17',km:21,type:'Trail largo',notes:'Ensaya equipo, hidratación y alimentación de carrera.'},
{date:'2026-10-18',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-10-19',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-10-20',km:8,type:'Suave',notes:'Ritmo conversacional.'},
{date:'2026-10-21',km:10,type:'Ritmo controlado',notes:'Sostenido, sin convertirlo en carrera.'},
{date:'2026-10-22',km:7,type:'Suave',notes:'Rodaje fácil.'},
{date:'2026-10-23',km:0,type:'Descanso',notes:'Recuperación antes del pico.'},
{date:'2026-10-24',km:24,type:'Trail largo',notes:'Pico de carga. Practica estrategia completa de carrera.'},
{date:'2026-10-25',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-10-26',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-10-27',km:7,type:'Suave',notes:'Comienza la descarga.'},
{date:'2026-10-28',km:8,type:'Cuestas suaves',notes:'Sin forzar.'},
{date:'2026-10-29',km:6,type:'Suave',notes:'Rodaje fácil.'},
{date:'2026-10-30',km:0,type:'Descanso',notes:'Recuperación.'},
{date:'2026-10-31',km:16,type:'Trail controlado',notes:'Última tirada larga; termina con sensación de reserva.'},
{date:'2026-11-01',km:5,type:'Recuperación',notes:'Muy suave.'},
{date:'2026-11-02',km:0,type:'Descanso',notes:'Lunes de descanso.'},
{date:'2026-11-03',km:6,type:'Suave',notes:'Sin fatiga.'},
{date:'2026-11-04',km:5,type:'Suave + aceleraciones',notes:'Aceleraciones cortas, con recuperación completa.'},
{date:'2026-11-05',km:4,type:'Muy suave',notes:'Solo activar piernas.'},
{date:'2026-11-06',km:0,type:'Descanso',notes:'Descanso total, hidratación y preparación.'},
{date:'2026-11-07',km:30,type:'CARRERA',notes:'30K Pico de Orizaba. Ejecuta por esfuerzo y terreno.'},
]

function localDate(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function pace(min:number,km:number){if(!km||!min)return '—';let sec=Math.round((min/km)*60);const m=Math.floor(sec/60);sec%=60;return `${m}:${String(sec).padStart(2,'0')} min/km`}
function dayLabel(s:string){return new Date(`${s}T12:00:00`).toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})}

export default function Page(){
 const[rows,setRows]=useState<any[]>([]),[km,setKm]=useState(''),[min,setMin]=useState(''),[elev,setElev]=useState(''),[kcal,setKcal]=useState(''),[effort,setEffort]=useState('Moderado'),[msg,setMsg]=useState('')
 const today=localDate(), todayPlan=PLAN.find(x=>x.date===today)
 async function load(){const{data}=await supabase.from('running_logs').select('*').order('run_at',{ascending:false}).limit(100);setRows(data||[])}
 useEffect(()=>{load()},[])
 async function save(){if(+km<=0||+min<=0)return setMsg('Captura distancia y duración.');const{error}=await supabase.from('running_logs').insert({distance_km:+km,duration_min:+min,elevation_m:elev?+elev:null,calories:kcal?+kcal:null,notes:`Esfuerzo: ${effort}`});setMsg(error?error.message:'✓ Entrenamiento guardado');if(!error){setKm('');setMin('');setElev('');setKcal('');load()}}
 const todayReal=useMemo(()=>rows.filter(x=>localDate(new Date(x.run_at))===today).reduce((a,x)=>a+Number(x.distance_km),0),[rows,today])
 const weekStart=useMemo(()=>{const d=new Date();const day=d.getDay();d.setDate(d.getDate()-((day+6)%7));return localDate(d)},[])
 const weekEnd=useMemo(()=>{const d=new Date(`${weekStart}T12:00:00`);d.setDate(d.getDate()+6);return localDate(d)},[weekStart])
 const plannedWeek=PLAN.filter(x=>x.date>=weekStart&&x.date<=weekEnd).reduce((a,x)=>a+x.km,0)
 const realWeek=rows.filter(x=>{const d=localDate(new Date(x.run_at));return d>=weekStart&&d<=weekEnd}).reduce((a,x)=>a+Number(x.distance_km),0)
 const upcoming=PLAN.filter(x=>x.date>=today).slice(0,10)
 const total=rows.reduce((a,x)=>a+Number(x.distance_km),0)
 const diff=todayPlan?todayReal-todayPlan.km:0
 return <AuthGate>
  <h1>🏃 Running</h1>
  <div className="card section">
   <h3>Entrenamiento de hoy</h3>
   {todayPlan?<><div className="kpi">{todayPlan.km===0?'Descanso':`${todayPlan.km} km`}</div><p><b>{todayPlan.type}</b></p><p className="muted">{todayPlan.notes}</p>
   {todayPlan.km>0&&<p className="status">Realizado hoy: <b>{todayReal.toFixed(1)} km</b> · {todayReal>=todayPlan.km?'✓ Objetivo cumplido':`faltan ${Math.max(0,todayPlan.km-todayReal).toFixed(1)} km`}</p>}</>:<p className="muted">No hay entrenamiento programado para esta fecha.</p>}
  </div>
  <div className="grid">
   <div className="card"><span className="muted">Esta semana</span><div className="kpi">{realWeek.toFixed(1)} / {plannedWeek} km</div></div>
   <div className="card"><span className="muted">Km registrados</span><div className="kpi">{total.toFixed(1)}</div></div>
   <div className="card"><span className="muted">Último ritmo</span><div className="kpi small">{rows[0]?pace(Number(rows[0].duration_min),Number(rows[0].distance_km)):'—'}</div></div>
   <div className="card"><span className="muted">Meta</span><div className="kpi">30 km</div><span className="muted">7 nov · Pico de Orizaba</span></div>
  </div>
  <div className="card section"><h3>Registrar lo que corriste</h3><div className="form-row">
   <input className="input" type="number" step="0.01" value={km} onChange={e=>setKm(e.target.value)} placeholder="Distancia km"/>
   <input className="input" type="number" step="0.1" value={min} onChange={e=>setMin(e.target.value)} placeholder="Duración min"/>
   <input className="input" type="number" value={elev} onChange={e=>setElev(e.target.value)} placeholder="Desnivel m"/>
   <input className="input" type="number" value={kcal} onChange={e=>setKcal(e.target.value)} placeholder="Calorías"/>
   <select className="input" value={effort} onChange={e=>setEffort(e.target.value)}><option>Suave</option><option>Moderado</option><option>Fuerte</option><option>Máximo</option></select>
   <button className="btn" onClick={save}>Guardar</button>
  </div>{km&&min&&<p className="muted">Ritmo calculado: <b>{pace(+min,+km)}</b></p>}{msg&&<p className="status">{msg}</p>}</div>
  <div className="card section"><h3>Próximos entrenamientos</h3><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Objetivo</th><th>Tipo</th><th>Indicaciones</th></tr></thead><tbody>{upcoming.map(x=><tr key={x.date}><td>{dayLabel(x.date)}</td><td><b>{x.km===0?'Descanso':`${x.km} km`}</b></td><td>{x.type}</td><td>{x.notes}</td></tr>)}</tbody></table></div></div>
  <div className="card section"><h3>Historial realizado</h3><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Distancia</th><th>Tiempo</th><th>Ritmo</th><th>Desnivel</th><th>Calorías</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{new Date(x.run_at).toLocaleDateString('es-MX')}</td><td>{x.distance_km} km</td><td>{x.duration_min} min</td><td>{pace(Number(x.duration_min),Number(x.distance_km))}</td><td>{x.elevation_m??'—'} m</td><td>{x.calories??'—'}</td></tr>)}</tbody></table></div></div>
 </AuthGate>
}