import {Fragment} from 'react'
import {motion} from 'framer-motion'
import {ChevronRight,ChevronDown,CheckCircle2,Loader2,AlertTriangle,CircleDashed,Search,Brain,PenLine,Scale} from 'lucide-react'
import {STAGES} from '../useWorkflow'
import {Tag} from './ui'
const ICON=[Search,Brain,PenLine,Scale],COL=['#22E4F7','#3B82F6','#8B5CF6','#22E4F7']
export const STATUS={idle:['Idle','#7F8FB0',CircleDashed],running:['Running','#22E4F7',Loader2],completed:['Completed','#34D399',CheckCircle2],failed:['Failed','#F87171',AlertTriangle]}
export const activity=(i,n)=>n.status==='idle'?'Waiting for upstream agent':n.status==='failed'?'Source fetch error · retry available':n.status==='completed'?'Output handed to next agent':STAGES[i].acts[Math.min(3,Math.floor(n.p/25))]
export default function WorkflowCanvas({nodes,onSelect,selected,compact,title='Agent workflow canvas'}){
return(<div className="circuit relative border border-line p-4 md:p-6">
<div className="mb-5 flex items-center justify-between"><Tag c="text-lime">{title}</Tag><Tag>preview · no real run</Tag></div>
<div className="flex flex-col items-stretch lg:flex-row lg:items-stretch">
{STAGES.map((s,i)=>{const n=nodes[i],[label,c,SI]=STATUS[n.status],I=ICON[i],col=COL[i],nx=nodes[i+1]
return(<Fragment key={s.id}>
<motion.button type="button" disabled={!onSelect} onClick={()=>onSelect(i)} whileHover={onSelect?{y:-4}:{}} className="min-w-0 flex-1 p-px text-left disabled:cursor-default"
style={{background:n.status==='idle'?'#1B2A47':n.status==='failed'?'#F87171':`linear-gradient(135deg,${col},#8B5CF6)`,boxShadow:n.status==='running'?`0 0 34px -8px ${col}`:selected===i?`0 0 0 2px ${col}66`:'none'}}>
<div className={`h-full bg-panel ${compact?'p-3':'p-4'}`}>
<div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center border" style={{borderColor:col+'66',color:col}}><I size={18}/></span><span className="min-w-0"><span className="block truncate font-display">{s.name}</span><span className="block truncate font-mono text-[11px] text-mute">{s.fw}</span></span></div>
<div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1.5 font-mono text-xs" style={{color:c}}><SI size={13} className={n.status==='running'?'animate-spin':''}/>{label}</span><span className="font-mono text-xs text-mute">preview</span></div>
<div className="mt-2 h-1 bg-line"><div className="h-full transition-all" style={{width:`${n.p}%`,background:`linear-gradient(90deg,${col},#8B5CF6)`,boxShadow:`0 0 10px ${col}`}}/></div>
{!compact&&<p className="mt-3 min-h-[2.5rem] text-sm text-mute">{activity(i,n)}</p>}</div></motion.button>
{nx&&<div className="flex flex-col items-center lg:w-14 lg:flex-row lg:self-center" style={{'--c':n.status==='failed'?'#F87171':col,color:n.status==='failed'?'#F87171':col}}>
<div className={`wire ${n.status==='running'||nx.status==='running'?'on':''} ${n.status==='completed'||n.status==='failed'?'done':''}`}/>
<ChevronDown size={16} className="-mt-1 lg:hidden"/><ChevronRight size={16} className="-ml-2 hidden lg:block"/></div>}
</Fragment>)})}</div></div>)}
