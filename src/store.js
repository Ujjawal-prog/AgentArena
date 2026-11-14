import {useSyncExternalStore} from 'react'
// Real user-created data only (agent configs + experiments), persisted in localStorage.
// Results stay null until a backend attaches them with actions.attachResults().
const KEY='agentarena.v1'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{agents:[],experiments:[]}}catch{return{agents:[],experiments:[]}}}
let state=load();const subs=new Set()
const set=p=>{state={...state,...p};try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}subs.forEach(f=>f())}
const uid=()=>globalThis.crypto?.randomUUID?.()||String(Date.now()+Math.random())
export const useStore=()=>useSyncExternalStore(f=>{subs.add(f);return()=>subs.delete(f)},()=>state)
export const actions={
addAgent:a=>set({agents:[...state.agents,{...a,id:uid()}]}),
updateAgent:(id,p)=>set({agents:state.agents.map(a=>a.id===id?{...a,...p}:a)}),
removeAgent:id=>set({agents:state.agents.filter(a=>a.id!==id)}),
addExperiment:e=>{const x={...e,id:uid(),createdAt:new Date().toISOString(),results:null};set({experiments:[x,...state.experiments]});return x.id},
// results: {[agentId]:{completion,accuracy,sources,completeness,timeMs,tokens,cost}} from a real evaluated run
attachResults:(id,results)=>set({experiments:state.experiments.map(e=>e.id===id?{...e,results}:e)})}
