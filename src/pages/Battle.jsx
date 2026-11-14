import {useState} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {AnimatePresence,motion} from 'framer-motion'
import {Play,X,AlertTriangle,Eye} from 'lucide-react'
import WorkflowCanvas,{STATUS,activity} from '../components/WorkflowCanvas'
import {STAGES,useWorkflow} from '../useWorkflow'
import {Tag,Panel,Empty} from '../components/ui'
import {useStore} from '../store'
import {METRICS} from '../data'
export default function Battle(){
const {experiments}=useStore(),loc=useLocation(),exp=experiments.find(e=>e.id===loc.state?.id)||experiments[0]
const {nodes,running,booting,start}=useWorkflow(),[sel,setSel]=useState(null),[err,setErr]=useState(false)
if(!exp)return(<div className="mx-auto max-w-3xl px-4 py-12"><Empty title="No experiment selected" hint="Create an experiment in the Research Lab to see its workflow and evaluation here."><Link to="/lab" className="bg-lime px-5 py-2.5 text-sm font-medium text-ink">Open Research Lab</Link></Empty></div>)
const n=sel!==null?nodes[sel]:null,S=sel!==null?STAGES[sel]:null,rows=METRICS.filter(m=>exp.metrics.includes(m.id))
return(<div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
<div className="flex flex-wrap items-end justify-between gap-4"><div className="max-w-2xl"><Tag c="text-lime">{exp.category} · {exp.results?'Evaluated':exp.research?'Research complete · agents not run':'Awaiting research'}</Tag><p className="mt-1 font-display text-xl md:text-2xl">{exp.prompt}</p></div>
<div className="flex flex-wrap gap-2"><button onClick={()=>setErr(true)} className="flex items-center gap-2 bg-gradient-to-r from-lime to-cyan px-5 py-2.5 text-sm font-medium text-ink"><Play size={16}/>Run benchmark</button>
<button onClick={()=>{setSel(null);start(0)}} disabled={running||booting} className="flex items-center gap-2 border border-line px-5 py-2.5 text-sm hover:border-lime disabled:opacity-40"><Eye size={16}/>{running?'Previewing…':'Preview workflow animation'}</button>
<Link to="/lab" className="border border-line px-5 py-2.5 text-sm hover:border-lime">New experiment</Link></div></div>
{err&&<div role="alert" className="mt-4 flex items-start gap-2 border border-red-400/40 bg-red-400/5 p-4 text-sm text-red-300"><AlertTriangle size={16} className="mt-0.5 shrink-0"/>Only backend health and Tavily search are connected. Agent execution and evaluation are not implemented, so this experiment remains “Awaiting experiment”.</div>}
<div className="mt-6"><WorkflowCanvas nodes={nodes} onSelect={setSel} selected={sel}/></div>
<p className="mt-2 text-xs text-mute">The animation is a preview of the planned pipeline. It runs nothing and produces no results.</p>
<Panel className="mt-6 p-5"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-display text-xl">Evaluation</h3><Tag>{exp.results?'Measured results':'No results yet'}</Tag></div>
{exp.agentIds.length===0?<p className="mt-4 text-sm text-mute">Tavily research is complete. No agents were run and no evaluation scores were generated.</p>:
<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead><tr className="text-left"><th className="py-2"><Tag>Metric</Tag></th>{exp.agentIds.map(id=><th key={id} className="font-display">{exp.agentNames[id]}</th>)}</tr></thead>
<tbody>{rows.map(m=><tr key={m.id} className="border-t border-line"><td className="py-3 text-mute">{m.label}</td>{exp.agentIds.map(id=>{const r=exp.results?.[id],v=r?m.show(r):null;return<td key={id} className={`font-mono ${v?'':'text-mute'}`}>{v??(exp.results?'Not evaluated yet':exp.research?'Not run':'Awaiting research')}</td>})}</tr>)}</tbody></table></div>}</Panel>
<Panel className="mt-4 p-5"><Tag>Experiment configuration</Tag><p className="mt-2 font-mono text-xs text-mute">Tavily: depth {exp.tavily.depth} · max {exp.tavily.maxResults} results · range {exp.tavily.timeRange}{exp.tavily.includeAnswer?' · answer summary':''}{exp.tavily.includeDomains&&` · include ${exp.tavily.includeDomains}`}{exp.tavily.excludeDomains&&` · exclude ${exp.tavily.excludeDomains}`}</p></Panel>
{exp.research&&<Panel className="mt-4 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><Tag c="text-cyan">Real Tavily search</Tag><Tag>{exp.research.results.length} results{exp.research.meta.creditsUsed==null?'':` · ${exp.research.meta.creditsUsed} credits`}</Tag></div>
{exp.research.answer&&<p className="mt-3 whitespace-pre-wrap text-sm">{exp.research.answer}</p>}
<div className="mt-3 space-y-3">{exp.research.results.map((r,i)=><article key={`${r.url||r.title||'result'}-${i}`} className="border-t border-line pt-3"><p className="font-display">{r.url?<a href={r.url} target="_blank" rel="noreferrer" className="hover:text-cyan">{r.title||r.url}</a>:r.title||'Untitled result'}</p>{r.url&&<p className="mt-1 break-all font-mono text-xs text-cyan">{r.url}</p>}<p className="mt-2 text-sm text-mute">{r.content}</p><p className="mt-2 font-mono text-xs text-mute">Tavily relevance score: {r.score??'not provided'}</p></article>)}</div></Panel>}
<AnimatePresence>{n&&<motion.aside initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:28,stiffness:260}} className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-lime/30 bg-panel p-6 sm:w-96">
<div className="flex items-start justify-between"><div><h3 className="font-display text-2xl">{S.name}</h3><Tag>{S.fw}</Tag></div><button onClick={()=>setSel(null)} aria-label="Close" className="text-mute hover:text-fg"><X/></button></div>
<p className="mt-4 text-sm text-mute">{S.role}</p>
<dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-sm"><div><dt className="text-xs text-mute">status</dt><dd>{STATUS[n.status][0]}{n.status!=='idle'&&' (preview)'}</dd></div><div><dt className="text-xs text-mute">tokens / cost</dt><dd className="text-mute">Not measured</dd></div></dl>
<p className="mt-6 text-sm">Stage activity: <span className="text-lime">{activity(sel,n)}</span></p>
{sel===0&&<p className="mt-6 border border-amber-300/30 p-3 text-xs text-amber-200">Tavily search is available separately in the Research Lab. This workflow preview does not call Tavily or run agents.</p>}</motion.aside>}</AnimatePresence></div>)}
