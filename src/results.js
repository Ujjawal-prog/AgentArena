export const evaluated=exps=>exps.filter(e=>e.results&&Object.keys(e.results).length)
const avg=(a,k)=>{const v=a.map(x=>x[k]).filter(x=>x!=null);return v.length?v.reduce((s,x)=>s+x,0)/v.length:null}
export function aggregate(exps,agents,cat='All'){const by={}
evaluated(exps).filter(e=>cat==='All'||e.category===cat).forEach(e=>Object.entries(e.results).forEach(([id,r])=>{(by[id]=by[id]||[]).push(r)}))
return Object.entries(by).map(([id,rs])=>({id,name:agents.find(a=>a.id===id)?.name||'Removed agent',runs:rs.length,...Object.fromEntries(['completion','accuracy','sources','completeness','timeMs','tokens','cost'].map(k=>[k,avg(rs,k)]))}))}
