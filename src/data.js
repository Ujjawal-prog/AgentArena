// Static configuration only. No agents, scores or results live here.
export const CATS=['Market Research','Technology Research','Financial Research','General Knowledge','Current Affairs']
const pct=k=>r=>r[k]==null?null:`${Math.round(r[k])}%`
export const METRICS=[
{id:'completion',label:'Task completion',show:pct('completion')},
{id:'accuracy',label:'Answer accuracy',show:pct('accuracy')},
{id:'sources',label:'Source quality & citations',show:pct('sources')},
{id:'completeness',label:'Research completeness',show:pct('completeness')},
{id:'timeMs',label:'Execution time',show:r=>r.timeMs==null?null:`${(r.timeMs/1000).toFixed(1)}s`},
{id:'usage',label:'Token usage & est. cost',show:r=>r.tokens==null?null:`${r.tokens.toLocaleString()} tokens · $${(r.cost??0).toFixed(4)}`}]
export const FRAMEWORKS=['LangGraph','CrewAI','AutoGen','LlamaIndex','OpenAI Agents SDK','Custom']
export const PROVIDERS=['Via Bifrost gateway','OpenAI','Anthropic','Google','Other']
export const EXAMPLES=["Research India's top 5 electric vehicle companies and prepare a comparison report.",
"Compare the leading open-source vector databases for production RAG workloads.",
"Summarise recent changes to India's data protection rules and who is affected."]
export const TAVILY_DEFAULTS={depth:'advanced',maxResults:8,includeAnswer:true,timeRange:'any',includeDomains:'',excludeDomains:''}
export const PAL=['#22E4F7','#8B5CF6','#3B82F6','#E879A6','#9FB4E8']
