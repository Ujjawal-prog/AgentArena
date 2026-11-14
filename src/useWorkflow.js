import {useCallback,useEffect,useRef,useState} from 'react'
// Simulated 4-stage pipeline. Replace the interval with real run events from a backend later.
export const STAGES=[
{id:'research',name:'Research Agent',fw:'Tavily search · standalone only',role:'Searches the web and collects candidate sources.',acts:['Planning queries','Searching sources','Reviewing source relevance','Organizing results'],speed:1.2},
{id:'analysis',name:'Analysis Agent',fw:'Analysis stage',role:'Analyses findings and validates claims across sources.',acts:['Extracting claims','Cross-checking figures','Flagging conflicts','Validating sources'],speed:1},
{id:'writing',name:'Writing Agent',fw:'Writing stage',role:'Drafts the research report with citations.',acts:['Outlining report','Drafting sections','Inserting citations','Polishing summary'],speed:1.1},
{id:'evaluation',name:'Evaluation Agent',fw:'Evaluation stage',role:'Scores the report on the configured criteria.',acts:['Checking accuracy','Verifying citations','Measuring completeness','Preparing evaluation'],speed:1.4}]
const blank=()=>({status:'idle',p:0})
const init=()=>STAGES.map(blank)
export function useWorkflow({demo=false,failAt=null}={}){
const [nodes,setN]=useState(init),[running,setR]=useState(false),[booting,setB]=useState(false),fail=useRef(failAt)
fail.current=demo?null:failAt
const start=useCallback((from=0)=>{setN(n=>n.map((x,i)=>i>=from?blank():x));setB(true);setTimeout(()=>{setB(false);setR(true)},demo?0:700)},[demo])
useEffect(()=>{if(!running)return;const id=setInterval(()=>setN(n=>{const i=n.findIndex(x=>x.status!=='completed');if(i<0)return n
const x=n[i],p=Math.min(100,x.p+(Math.random()*2.2+.8)*STAGES[i].speed)
const st=fail.current===i&&p>55?'failed':p>=100?'completed':'running'
return n.map((y,k)=>k===i?{status:st,p}:y)}),150);return()=>clearInterval(id)},[running])
useEffect(()=>{if(running&&(nodes.every(n=>n.status==='completed')||nodes.some(n=>n.status==='failed')))setR(false)},[nodes,running])
useEffect(()=>{if(demo)start(0)},[])
useEffect(()=>{if(demo&&!running&&!booting&&nodes.every(n=>n.status==='completed')){const id=setTimeout(()=>start(0),2500);return()=>clearTimeout(id)}},[demo,running,booting,nodes,start])
return{nodes,running,booting,start}}
