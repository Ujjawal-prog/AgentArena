import {useState} from 'react'
import {useNavigate,useOutletContext} from 'react-router-dom'
import {Play,Check} from 'lucide-react'
import AgentConfig from '../components/AgentConfig'
import {Tag} from '../components/ui'
import {actions,useStore} from '../store'
import {CATS,METRICS,EXAMPLES,TAVILY_DEFAULTS} from '../data'
import {apiRequest} from '../api'
const Chip=({on,children,...p})=><button {...p} className={`border px-3 py-2 text-sm transition ${on?'border-lime bg-lime/10 text-lime':'border-line text-mute hover:text-fg'}`}>{children}</button>
const I='mt-1 w-full border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-lime'
export default function Lab(){
const nav=useNavigate(),{agents}=useStore(),{health,healthError,checkBackend}=useOutletContext()
const [prompt,setP]=useState(''),[cat,setCat]=useState(CATS[0]),[sel,setSel]=useState([]),[met,setMet]=useState(METRICS.map(m=>m.id)),[tv,setTv]=useState(TAVILY_DEFAULTS),[err,setErr]=useState('')
const [searchResult,setSearchResult]=useState(null),[searching,setSearching]=useState(false)
const tog=(arr,set,v)=>{set(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]);setErr('')}
const chosen=agents.filter(a=>a.enabled&&sel.includes(a.id))
const setPrompt=value=>{setP(value);setSearchResult(null);setErr('')}
const requestResearch=()=>apiRequest('/tavily/search',{method:'POST',body:{query:prompt.trim(),searchDepth:tv.depth,maxResults:tv.maxResults,timeRange:tv.timeRange,includeDomains:tv.includeDomains,excludeDomains:tv.excludeDomains,includeAnswer:tv.includeAnswer}})
const run=async()=>{if(prompt.trim().length<10)return setErr('Describe the research task in at least 10 characters.')
setSearching(true);setErr('')
try{const research=searchResult||await requestResearch();setSearchResult(research);await checkBackend()
const id=actions.addExperiment({prompt:prompt.trim(),category:cat,tavily:tv,research,agentIds:chosen.map(a=>a.id),agentNames:Object.fromEntries(chosen.map(a=>[a.id,a.name])),metrics:met,status:'awaiting_agent_execution'});nav('/battle',{state:{id}})}
catch(error){setErr(error.message)}
finally{setSearching(false)}}
const search=async()=>{if(!prompt.trim())return setErr('Enter a search query first.');setSearching(true);setErr('');setSearchResult(null)
try{const result=await requestResearch();setSearchResult(result);await checkBackend()}
catch(error){setErr(error.message)}
finally{setSearching(false)}}
const T=k=>e=>{setTv({...tv,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});setSearchResult(null);setErr('')}
return(<div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 md:px-8 lg:grid-cols-12">
<div className="lg:col-span-7"><h2 className="font-display text-4xl md:text-5xl">What should the agents research?</h2>
<textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} placeholder="Describe the research task in plain language…" className="mt-6 w-full resize-none border border-line bg-panel p-5 text-lg outline-none focus:border-lime"/>
<div className="mt-3 flex flex-wrap gap-2">{EXAMPLES.map(e=><button key={e} onClick={()=>setPrompt(e)} className="max-w-xs truncate border border-line px-3 py-1.5 text-xs text-mute hover:border-cyan hover:text-cyan" title={e}>{e}</button>)}</div>
<div className="mt-8"><Tag>Research category</Tag><div className="mt-3 flex flex-wrap gap-2">{CATS.map(c=><Chip key={c} on={cat===c} onClick={()=>setCat(c)}>{c}</Chip>)}</div></div>
<div className="mt-8"><Tag>Evaluation metrics</Tag><div className="mt-3 flex flex-wrap gap-2">{METRICS.map(m=><Chip key={m.id} on={met.includes(m.id)} onClick={()=>tog(met,setMet,m.id)}>{met.includes(m.id)&&<Check size={12} className="mr-1 inline"/>}{m.label}</Chip>)}</div></div>
<div className="mt-8 border border-line bg-panel/60 p-5"><div className="flex justify-between"><Tag c="text-lime">Tavily research settings</Tag><Tag>{health?.status==='ok'?(health.integrations.tavily.configured?'server key configured':'server key not configured'):healthError?'backend unavailable':'checking backend'}</Tag></div>
<div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-sm text-mute">Search depth<select className={I} value={tv.depth} onChange={T('depth')}><option>basic</option><option>advanced</option></select></label>
<label className="text-sm text-mute">Max results<input type="number" min={1} max={20} className={I} value={tv.maxResults} onChange={T('maxResults')}/></label>
<label className="text-sm text-mute">Time range<select className={I} value={tv.timeRange} onChange={T('timeRange')}>{['any','day','week','month','year'].map(x=><option key={x}>{x}</option>)}</select></label>
<label className="text-sm text-mute sm:col-span-3">Include domains (comma separated)<input className={I} value={tv.includeDomains} onChange={T('includeDomains')}/></label>
<label className="text-sm text-mute sm:col-span-3">Exclude domains<input className={I} value={tv.excludeDomains} onChange={T('excludeDomains')}/></label></div>
<label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-cyan-400" checked={tv.includeAnswer} onChange={T('includeAnswer')}/>Include Tavily answer summary</label>
<p className="mt-3 text-xs text-mute">The API key stays in the backend. Searching makes a real Tavily request and may use API credits.</p>
<button onClick={search} disabled={searching} className="mt-4 border border-lime px-4 py-2 text-sm text-lime transition hover:bg-lime/10 disabled:opacity-50">{searching?'Searching Tavily…':'Search with Tavily'}</button></div>
{searchResult&&<div className="mt-4 border border-cyan/30 bg-panel/70 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><Tag c="text-cyan">Real Tavily search results</Tag><Tag>{searchResult.results.length} results{searchResult.meta.creditsUsed==null?'':` · ${searchResult.meta.creditsUsed} credits`}</Tag></div>
{searchResult.answer&&<p className="mt-4 whitespace-pre-wrap text-sm">{searchResult.answer}</p>}
<div className="mt-3 space-y-3">{searchResult.results.map((r,i)=><article key={`${r.url||r.title||'result'}-${i}`} className="border-t border-line pt-3"><h3 className="font-display">{r.url?<a href={r.url} target="_blank" rel="noreferrer" className="hover:text-cyan">{r.title||r.url}</a>:r.title||'Untitled result'}</h3>{r.url&&<p className="mt-1 break-all font-mono text-xs text-cyan">{r.url}</p>}<p className="mt-2 text-sm text-mute">{r.content}</p><p className="mt-2 font-mono text-xs text-mute">Tavily relevance score: {r.score??'not provided'}</p></article>)}</div></div>}</div>
<div className="lg:col-span-5"><AgentConfig selected={sel} onToggle={id=>tog(sel,setSel,id)}/>
{err&&<p role="alert" className="mt-4 border border-red-400/40 bg-red-400/5 p-3 text-sm text-red-300">{err}</p>}
<button onClick={run} disabled={searching} className="mt-6 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-lime to-cyan py-4 font-medium text-ink shadow-[0_0_40px_-10px_#22E4F7] transition hover:brightness-110 disabled:opacity-50"><Play size={18}/>{searching?'Searching with Tavily…':'Run experiment'}</button>
<p className="mt-3 text-xs text-mute">Run performs real Tavily research and saves its response. Agent execution is not required or performed; no benchmark scores are generated.</p></div></div>)}
