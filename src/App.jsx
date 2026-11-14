import {useCallback,useEffect,useState} from 'react'
import {NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom'
import {LayoutGrid,FlaskConical,Swords,Trophy,BarChart3,Settings as Cog,Bell,PanelLeft,Plus,Menu,X} from 'lucide-react'
import {Dot} from './components/ui'
import {apiRequest} from './api'
const NAV=[['/','Overview',LayoutGrid],['/lab','Research Lab',FlaskConical],['/battle','Agent Battle',Swords],['/leaderboard','Leaderboard',Trophy],['/analytics','Analytics',BarChart3],['/settings','Settings',Cog]]
export default function App(){
const [collapsed,setC]=useState(false),[open,setO]=useState(false),[bell,setB]=useState(false)
const [experiment,setExperiment]=useState(null)
const [health,setHealth]=useState(null),[healthError,setHealthError]=useState('')
const checkBackend=useCallback(async()=>{try{const result=await apiRequest('/health');setHealth(result);setHealthError('');return result}catch(error){setHealth(null);setHealthError(error.message);return null}},[])
useEffect(()=>{checkBackend();window.addEventListener('focus',checkBackend);return()=>window.removeEventListener('focus',checkBackend)},[checkBackend])
const loc=useLocation(),nav=useNavigate(),title=(NAV.find(n=>n[0]===loc.pathname)||NAV[0])[1]
const side=(<aside className={`flex h-full flex-col border-r border-line bg-ink ${collapsed?'w-[72px]':'w-64'} transition-all`}>
<div className="flex h-16 items-center gap-3 border-b border-line px-5"><div className="grid h-8 w-8 shrink-0 place-items-center bg-gradient-to-br from-lime to-violet font-display font-bold text-ink">A</div>
{!collapsed&&<span className="font-display text-lg font-bold tracking-tight">AgentArena</span>}</div>
<nav className="flex-1 space-y-1 p-3">{NAV.map(([to,l,I])=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setO(false)} title={l}
className={({isActive})=>`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition ${isActive?'border-lime bg-lime/5 text-fg':'border-transparent text-mute hover:text-fg'}`}><I size={18}/>{!collapsed&&l}</NavLink>)}</nav>
<div className="space-y-3 border-t border-line p-4"><div className="flex items-center gap-2 text-xs text-mute" title={healthError}><Dot c={health?.status==='ok'?'#34D399':'#FBBF24'}/>{!collapsed&&<span className="font-mono">{health?.status==='ok'?'Backend connected':healthError?'Backend unavailable':'Checking backend'}</span>}</div>
<div className="flex items-center gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center bg-line font-mono text-xs">You</div>{!collapsed&&<div className="text-xs"><p>Local workspace</p><p className="text-mute">No account connected</p></div>}</div></div></aside>)
return(<div className="flex h-screen overflow-hidden">
<div className="hidden md:block">{side}</div>
{open&&<div className="fixed inset-0 z-40 flex md:hidden"><div className="h-full">{side}</div><div className="flex-1 bg-black/70" onClick={()=>setO(false)}/></div>}
<div className="flex min-w-0 flex-1 flex-col">
<header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 md:px-8">
<button className="md:hidden" onClick={()=>setO(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
<button className="hidden text-mute hover:text-fg md:block" onClick={()=>setC(!collapsed)} aria-label="Collapse sidebar"><PanelLeft size={18}/></button>
<h1 className="font-display text-lg">{title}</h1><div className="flex-1"/>
<div className="relative"><button onClick={()=>setB(!bell)} className="relative p-2 text-mute hover:text-fg" aria-label="Notifications"><Bell size={18}/></button>
{bell&&<div className="absolute right-0 top-11 w-72 border border-line bg-panel p-3 text-xs shadow-2xl"><p className="py-2 text-mute">No notifications yet.</p></div>}</div>
<button onClick={()=>nav('/lab')} className="flex items-center gap-2 bg-lime px-4 py-2 text-sm font-medium text-ink transition hover:brightness-110"><Plus size={16}/><span className="hidden sm:inline">New experiment</span></button></header>
<main className="gridbg flex-1 overflow-y-auto"><Outlet context={{experiment,setExperiment,health,healthError,checkBackend}}/></main></div></div>)}
