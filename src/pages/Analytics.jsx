import {useState} from 'react'
import {BarChart,Bar,ScatterChart,Scatter,XAxis,YAxis,ZAxis,Tooltip,Legend,ResponsiveContainer,CartesianGrid} from 'recharts'
import {Download,Search} from 'lucide-react'
import {Tag,Panel,Empty,ttip} from '../components/ui'
import {useStore} from '../store'
import {aggregate} from '../results'
import {PAL} from '../data'
const ax={stroke:'#7F8FB0',fontSize:11}
const Box=({t,children})=><Panel className="p-5"><h3 className="mb-4 font-display text-lg">{t}</h3><div className="h-60"><ResponsiveContainer>{children}</ResponsiveContainer></div></Panel>
export default function Analytics(){
const {agents,experiments}=useStore(),[q,setQ]=useState(''),[ok,setOk]=useState(false)
const rows=aggregate(experiments,agents),hist=experiments.filter(e=>(e.prompt+e.category).toLowerCase().includes(q.toLowerCase()))
const q4=rows.map(r=>({name:r.name,Completion:r.completion,Accuracy:r.accuracy,Sources:r.sources,Completeness:r.completeness}))
const exp=()=>{const b=new Blob([JSON.stringify({generated:new Date().toISOString(),agents,experiments},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='agentarena-report.json';a.click();setOk(true);setTimeout(()=>setOk(false),2000)}
return(<div className="mx-auto max-w-7xl px-4 py-8 md:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><h2 className="font-display text-4xl md:text-5xl">What the data says</h2>
<button onClick={exp} disabled={!experiments.length} className="flex items-center gap-2 border border-lime px-5 py-2.5 text-sm text-lime hover:bg-lime/10 disabled:opacity-40"><Download size={16}/>{ok?'Report exported':'Export report'}</button></div>
{rows.length===0?<div className="mt-8"><Empty title="No benchmark results yet." hint="Run your first experiment to see agent performance."/></div>:
<div className="mt-8 grid gap-4 md:grid-cols-2">
<Box t="Quality metrics (%)"><BarChart data={q4}><CartesianGrid stroke="#1B2A47" vertical={false}/><XAxis dataKey="name" {...ax}/><YAxis domain={[0,100]} {...ax} width={30}/><Tooltip {...ttip}/><Legend/>{['Completion','Accuracy','Sources','Completeness'].map((k,i)=><Bar key={k} dataKey={k} fill={PAL[i]}/>)}</BarChart></Box>
<Box t="Cost vs accuracy"><ScatterChart><CartesianGrid stroke="#1B2A47"/><XAxis type="number" dataKey="cost" name="Cost $" {...ax}/><YAxis type="number" dataKey="accuracy" name="Accuracy %" domain={[0,100]} {...ax} width={30}/><ZAxis range={[120,120]}/><Tooltip {...ttip}/>{rows.filter(r=>r.cost!=null&&r.accuracy!=null).map((r,i)=><Scatter key={r.id} name={r.name} data={[r]} fill={PAL[i%PAL.length]}/>)}</ScatterChart></Box>
<Box t="Average execution time (s)"><BarChart data={rows.map(r=>({name:r.name,s:r.timeMs==null?null:r.timeMs/1000}))}><CartesianGrid stroke="#1B2A47" vertical={false}/><XAxis dataKey="name" {...ax}/><YAxis {...ax} width={30}/><Tooltip {...ttip}/><Bar dataKey="s" fill="#22E4F7"/></BarChart></Box></div>}
<div className="mt-10 flex items-center justify-between"><h3 className="font-display text-xl">Experiment history</h3><div className="flex items-center gap-2 border border-line px-3 py-1.5"><Search size={14} className="text-mute"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search history" className="w-40 bg-transparent text-sm outline-none"/></div></div>
{hist.length?<div className="mt-3 overflow-x-auto"><div className="min-w-[640px] divide-y divide-line border-y border-line">{hist.map(e=><div key={e.id} className="grid grid-cols-12 gap-2 py-3 text-sm"><span className="col-span-6 truncate">{e.prompt}</span><span className="col-span-2 text-mute">{e.category}</span><span className="col-span-2 font-mono text-xs text-mute">{e.results?'Evaluated':e.research?'Research complete':'Awaiting research'}</span><span className="col-span-2 text-right"><Tag>{new Date(e.createdAt).toLocaleDateString()}</Tag></span></div>)}</div></div>:<div className="mt-3"><Empty title="No experiments yet" hint="Experiments you create in the Research Lab appear here."/></div>}</div>)}
