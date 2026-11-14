import {useState} from 'react'
import {Plus,Trash2,Pencil} from 'lucide-react'
import {actions,useStore} from '../store'
import {FRAMEWORKS,PROVIDERS} from '../data'
import {Tag,Empty} from './ui'
const blank={name:'',fw:FRAMEWORKS[0],fwCustom:'',provider:PROVIDERS[0],model:'',instructions:'',enabled:true}
const SAMPLE={...blank,name:'Sample configuration (rename me)',model:'your-model-id',instructions:'Research the task using Tavily results. Cite every claim with its source URL.',sample:true}
const I='mt-1 w-full border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-lime'
export default function AgentConfig({selected,onToggle}){
const {agents}=useStore(),[form,setForm]=useState(null),[err,setErr]=useState('')
const f=k=>e=>setForm({...form,[k]:e.target.value})
const save=()=>{if(!form.name.trim())return setErr('Give the agent a name.');if(!form.model.trim())return setErr('Enter a model identifier.');if(form.fw==='Custom'&&!form.fwCustom.trim())return setErr('Name the custom framework.')
form.id?actions.updateAgent(form.id,form):actions.addAgent(form);setForm(null);setErr('')}
return(<div><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-xl">Agent configuration</h3><Tag>{selected.length} selected</Tag></div>
{agents.length===0&&!form&&<Empty title="No agents configured yet." hint="Add your first AI agent to begin benchmarking."/>}
<div className="space-y-2">{agents.map(a=>{const on=selected.includes(a.id)&&a.enabled;return(<div key={a.id} className={`border p-3 transition ${on?'border-lime bg-lime/5':'border-line'} ${a.enabled?'':'opacity-60'}`}>
<div className="flex items-center gap-3"><input type="checkbox" aria-label={`Include ${a.name}`} checked={on} disabled={!a.enabled} onChange={()=>onToggle(a.id)} className="h-4 w-4 accent-cyan-400"/>
<div className="min-w-0 flex-1"><p className="truncate font-display">{a.name}{a.sample&&<span className="ml-2 font-mono text-[10px] text-amber-300">SAMPLE</span>}</p><Tag>{a.fw==='Custom'?a.fwCustom:a.fw} · {a.provider} · {a.model}</Tag></div>
<button role="switch" aria-checked={a.enabled} aria-label="Enable agent" onClick={()=>actions.updateAgent(a.id,{enabled:!a.enabled})} className={`h-5 w-9 border p-0.5 ${a.enabled?'border-lime':'border-line'}`}><span className={`block h-3 w-3 transition ${a.enabled?'translate-x-4 bg-lime':'bg-mute'}`}/></button>
<button aria-label="Edit" onClick={()=>setForm(a)} className="text-mute hover:text-fg"><Pencil size={15}/></button>
<button aria-label="Delete" onClick={()=>{actions.removeAgent(a.id);if(selected.includes(a.id))onToggle(a.id)}} className="text-mute hover:text-red-300"><Trash2 size={15}/></button></div></div>)})}</div>
{form?<div className="mt-3 space-y-3 border border-lime/40 bg-panel p-4">
<label className="block text-sm text-mute">Agent name<input className={I} value={form.name} onChange={f('name')}/></label>
<div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-mute">Framework<select className={I} value={form.fw} onChange={f('fw')}>{FRAMEWORKS.map(x=><option key={x}>{x}</option>)}</select></label>
{form.fw==='Custom'&&<label className="text-sm text-mute">Custom framework<input className={I} value={form.fwCustom} onChange={f('fwCustom')}/></label>}
<label className="text-sm text-mute">Provider<select className={I} value={form.provider} onChange={f('provider')}>{PROVIDERS.map(x=><option key={x}>{x}</option>)}</select></label>
<label className="text-sm text-mute">Model<input className={I} value={form.model} onChange={f('model')} placeholder="model identifier"/></label></div>
<label className="block text-sm text-mute">Task instructions<textarea rows={3} className={I+' resize-none'} value={form.instructions} onChange={f('instructions')}/></label>
{err&&<p role="alert" className="text-sm text-red-300">{err}</p>}
<div className="flex gap-2"><button onClick={save} className="bg-lime px-4 py-2 text-sm font-medium text-ink">Save agent</button><button onClick={()=>{setForm(null);setErr('')}} className="border border-line px-4 py-2 text-sm">Cancel</button></div></div>
:<div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>setForm(blank)} className="flex items-center gap-2 border border-lime px-4 py-2 text-sm text-lime hover:bg-lime/10"><Plus size={16}/>Add an AI agent</button>
<button onClick={()=>setForm(SAMPLE)} className="border border-line px-4 py-2 text-sm text-mute hover:text-fg">Start from a sample configuration</button></div>}
<p className="mt-3 text-xs text-mute">Configurations are saved in this browser only. Routing through Bifrost is not connected yet.</p></div>)}
