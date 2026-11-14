import {useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {Search} from 'lucide-react'
import {Tag,Empty} from '../components/ui'
import {useStore} from '../store'
import {aggregate,evaluated} from '../results'
import {CATS,PAL} from '../data'
const SORTS=[['accuracy','Accuracy'],['completion','Task completion'],['sources','Source quality'],['completeness','Completeness'],['timeMs','Execution time'],['cost','Cost']]
const Pct=({v,c})=>v==null?<span className="text-mute">—</span>:<div className="flex items-center gap-2"><span className="w-9 font-mono text-sm">{Math.round(v)}%</span><div className="h-1 w-16 bg-line"><div className="h-full" style={{width:`${v}%`,background:c}}/></div></div>
export default function Leaderboard(){
const {agents,experiments}=useStore(),[cat,setCat]=useState('All'),[q,setQ]=useState(''),[by,setBy]=useState('accuracy')
const any=evaluated(experiments).length>0
const rows=useMemo(()=>aggregate(experiments,agents,cat).filter(r=>r.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>{const lo=by==='timeMs'||by==='cost',x=a[by]??(lo?Infinity:-1),y=b[by]??(lo?Infinity:-1);return lo?x-y:y-x}),[experiments,agents,cat,q,by])
return(<div className="mx-auto max-w-7xl px-4 py-8 md:px-8"><h2 className="font-display text-5xl md:text-7xl">The ranking</h2>
<div className="mt-6 flex flex-wrap items-center gap-2">{['All',...CATS].map(c=><button key={c} onClick={()=>setCat(c)} className={`border px-3 py-1.5 text-sm ${cat===c?'border-lime text-lime':'border-line text-mute hover:text-fg'}`}>{c}</button>)}
<select value={by} onChange={e=>setBy(e.target.value)} aria-label="Rank by" className="ml-auto border border-line bg-ink px-3 py-1.5 text-sm">{SORTS.map(([k,l])=><option key={k} value={k}>Rank by {l}</option>)}</select>
<div className="flex items-center gap-2 border border-line px-3 py-1.5"><Search size={14} className="text-mute"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search agents" className="w-32 bg-transparent text-sm outline-none"/></div></div>
{rows.length===0?<div className="mt-8"><Empty title={any?'No results in this category':'No benchmark results yet.'} hint={any?'Pick another category or clear the search.':'Run your first experiment to see agent performance.'}>{!any&&<Link to="/lab" className="bg-lime px-5 py-2.5 text-sm font-medium text-ink">Open Research Lab</Link>}</Empty></div>:
<div className="mt-8 overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr>{['#','Agent','Runs','Completion','Accuracy','Sources','Completeness','Avg time','Tokens','Cost'].map(h=><th key={h} className="py-2"><Tag>{h}</Tag></th>)}</tr></thead>
<tbody className="divide-y divide-line border-y border-line">{rows.map((r,i)=>{const c=PAL[i%PAL.length];return(<tr key={r.id} className={i===0?'bg-lime/5':''}><td className="py-4 font-display text-3xl" style={{color:i===0?c:'#1B2A47'}}>{i+1}</td><td className="font-display">{r.name}</td><td className="font-mono text-sm">{r.runs}</td>
<td><Pct v={r.completion} c={c}/></td><td><Pct v={r.accuracy} c={c}/></td><td><Pct v={r.sources} c={c}/></td><td><Pct v={r.completeness} c={c}/></td>
<td className="font-mono text-sm">{r.timeMs==null?'—':`${(r.timeMs/1000).toFixed(1)}s`}</td><td className="font-mono text-sm">{r.tokens==null?'—':Math.round(r.tokens).toLocaleString()}</td><td className="font-mono text-sm">{r.cost==null?'—':`$${r.cost.toFixed(4)}`}</td></tr>)})}</tbody></table></div>}
<p className="mt-4 text-xs text-mute">Rankings use only evaluated experiment results. Averages are across evaluated runs.</p></div>)}
