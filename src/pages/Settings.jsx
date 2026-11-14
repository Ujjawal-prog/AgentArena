import {useState} from 'react'
import {useOutletContext} from 'react-router-dom'
import {Tag,Panel} from '../components/ui'
import {apiRequest} from '../api'
const Row=({l,h,on,set})=><div className="flex items-center justify-between border-b border-line py-4 last:border-0"><div><p>{l}</p><p className="text-sm text-mute">{h}</p></div>
<button role="switch" aria-checked={on} onClick={()=>set(!on)} className={`h-6 w-11 border p-0.5 transition ${on?'border-lime bg-lime/20':'border-line'}`}><span className={`block h-4 w-4 transition ${on?'translate-x-5 bg-lime':'bg-mute'}`}/></button></div>
export default function Settings(){
const {health,healthError,checkBackend}=useOutletContext()
const [a,setA]=useState(true),[b,setB]=useState(false),[c,setC]=useState(true),[saved,setS]=useState(false)
return(<div className="mx-auto max-w-2xl px-4 py-8 md:px-8"><h2 className="font-display text-4xl">Settings</h2>
<Panel className="mt-6 px-5"><Row l="Notify when a run finishes" h="Shows in the bell menu." on={a} set={setA}/><Row l="Auto-start battles" h="Begin as soon as you run an experiment." on={c} set={setC}/><Row l="Compact tables" h="Reduce row height in rankings." on={b} set={setB}/></Panel>
<Integration name="Bifrost gateway" field="Base URL" ph="https://your-bifrost-host/v1"/><TavilyIntegration health={health} healthError={healthError} checkBackend={checkBackend}/>
<button onClick={()=>{setS(true);setTimeout(()=>setS(false),1800)}} className="mt-6 bg-lime px-6 py-2.5 text-sm font-medium text-ink">{saved?'Saved':'Save changes'}</button></div>)}

function TavilyIntegration({health,healthError,checkBackend}){
const [query,setQuery]=useState(''),[status,setStatus]=useState('idle'),[result,setResult]=useState(null),[error,setError]=useState('')
const test=async()=>{if(!query.trim())return setError('Enter a search query first.');setStatus('loading');setError('');setResult(null)
try{setResult(await apiRequest('/tavily/search',{method:'POST',body:{query:query.trim(),searchDepth:'basic',maxResults:1}}));setStatus('success');await checkBackend()}
catch(e){setError(e.message);setStatus('error')}}
const configured=health?.integrations?.tavily?.configured
const connectionStatus=health?.status==='ok'?(configured?'key configured on server':'key not configured'):healthError?'backend unavailable':'checking backend'
return(<Panel className="mt-6 p-5"><div className="flex justify-between"><Tag>Tavily search</Tag><Tag>{connectionStatus}</Tag></div>
<p className="mt-3 text-sm text-mute">The API key is read from <code>server/.env</code> and is never sent to or stored in this browser.</p>
<label className="mt-3 block text-sm text-mute">Search query<input value={query} onChange={e=>{setQuery(e.target.value);setStatus('idle');setResult(null);setError('')}} placeholder="Enter a query to test real Tavily search" className="mt-1 w-full border border-line bg-ink px-3 py-2 text-fg outline-none focus:border-lime"/></label>
<div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={test} disabled={status==='loading'||!query.trim()} className="border border-lime px-4 py-2 text-sm text-lime disabled:opacity-50">{status==='loading'?'Searching…':'Test Tavily search'}</button>
{error&&<span role="alert" className="text-sm text-red-300">{error}</span>}
{result&&<span role="status" className="text-sm text-lime">Tavily returned {result.results.length} real result{result.results.length===1?'':'s'} in {result.meta.measuredLatencyMs} ms.</span>}</div>
<p className="mt-3 text-xs text-mute">Testing performs a real search and may use Tavily API credits.</p></Panel>)}

function Integration({name,field,ph,secret}){
const [v,setV]=useState(''),[st,setSt]=useState('idle')
const test=()=>{if(!v.trim())return setSt('empty');setSt('loading');setTimeout(()=>setSt('unwired'),900)}
return(<Panel className="mt-6 p-5"><div className="flex justify-between"><Tag>{name}</Tag><Tag>Not connected</Tag></div>
<label className="mt-3 block text-sm text-mute">{field}<input type={secret?'password':'text'} value={v} onChange={e=>{setV(e.target.value);setSt('idle')}} placeholder={ph} className="mt-1 w-full border border-line bg-ink px-3 py-2 text-fg outline-none focus:border-lime"/></label>
<div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={test} disabled={st==='loading'} className="border border-lime px-4 py-2 text-sm text-lime disabled:opacity-50">{st==='loading'?'Testing…':'Test connection'}</button>
{st==='empty'&&<span role="alert" className="text-sm text-red-300">Enter a {field.toLowerCase()} first.</span>}
{st==='unwired'&&<span role="alert" className="text-sm text-amber-300">Nothing was sent. Backend calls are not implemented in this build.</span>}</div></Panel>)}
