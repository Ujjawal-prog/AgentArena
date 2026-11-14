import {Link} from 'react-router-dom'
import {Rocket} from 'lucide-react'
import WorkflowCanvas from '../components/WorkflowCanvas'
import {useWorkflow} from '../useWorkflow'
import {useStore} from '../store'
import {evaluated} from '../results'
import {Tag,Panel,Empty} from '../components/ui'
export default function Overview(){
const wf=useWorkflow({demo:true}),{agents,experiments}=useStore(),ev=evaluated(experiments)
const STATS=[[experiments.length,'Experiments created'],[agents.length,'Agents configured'],[ev.length,'Experiments evaluated'],[ev.reduce((s,e)=>s+Object.keys(e.results).length,0),'Evaluated agent runs']]
return(<div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
<section className="grid gap-8"><div><Tag c="text-lime">AI agent benchmarking · prototype</Tag>
<h2 className="mt-4 font-display text-6xl font-bold leading-[.95] tracking-tight md:text-8xl">Think.<br/>Test.<br/>Compare.</h2>
<p className="mt-6 max-w-lg text-mute">Configure AI research agents, give them the same task, and compare task completion, accuracy, sources, completeness, time and cost. Real Tavily search is available; agent execution, AI answers, Bifrost and benchmark evaluation are not connected yet.</p>
<Link to="/lab" className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-lime to-cyan px-6 py-3 font-medium text-ink shadow-[0_0_40px_-8px_#22E4F7] transition hover:brightness-110"><Rocket size={18}/>Launch new experiment</Link></div>
<WorkflowCanvas nodes={wf.nodes} compact title="Planned pipeline · illustrative animation"/></section>
<section className="mt-14 grid grid-cols-2 border-y border-line md:grid-cols-4">{STATS.map(([v,l],i)=><div key={l} className={`px-2 py-6 md:px-6 ${i?'md:border-l md:border-line':''}`}><p className="font-display text-4xl md:text-5xl">{v}</p><p className="mt-1 text-sm text-mute">{l}</p></div>)}</section>
<section className="mt-10"><div className="mb-3 flex justify-between"><h3 className="font-display text-lg">Recent experiments</h3><Link to="/analytics" className="text-sm text-lime">View all</Link></div>
{experiments.length===0?<Empty title="No experiments yet" hint="Create your first experiment in the Research Lab."/>:
<div className="divide-y divide-line border-y border-line">{experiments.slice(0,5).map(e=><Link to="/battle" state={{id:e.id}} key={e.id} className="grid grid-cols-12 items-center gap-2 py-4 transition hover:bg-lime/5 md:px-3"><span className="col-span-12 md:col-span-6">{e.prompt}</span><span className="col-span-6 text-sm text-mute md:col-span-3">{e.category}</span><span className="col-span-6 text-right font-mono text-xs text-mute md:col-span-3">{e.results?'Evaluated':e.research?'Research complete':'Awaiting research'} · {e.agentIds.length} agent{e.agentIds.length===1?'':'s'}</span></Link>)}</div>}</section>
<Panel className="mt-10 p-5"><h3 className="font-display text-lg">Performance overview</h3><p className="mt-2 text-sm text-mute">No benchmark results yet. Run your first experiment to see agent performance.</p></Panel></div>)}
