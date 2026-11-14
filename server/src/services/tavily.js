// Tavily Search integration.
// Verified against the official reference: https://docs.tavily.com/documentation/api-reference/endpoint/search
//   POST {base}/search   Authorization: Bearer <TAVILY_API_KEY>   Content-Type: application/json
//   Response: { query, answer?, results:[{title,url,content,score,...}], response_time, usage?, request_id? }
import { config } from '../config.js'
import { AppError } from '../errors.js'

const DEPTHS = ['basic', 'advanced', 'fast', 'ultra-fast'] // advanced costs 2 credits, others 1
const TOPICS = ['general', 'news', 'finance']
const RANGES = ['day', 'week', 'month', 'year']
const bad = (msg) => new AppError(400, 'INVALID_REQUEST', msg)

// Accepts an array or a comma-separated string (the Research Lab form uses a string).
const domains = (v, max, name) => {
  const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : []
  const out = list.map((s) => String(s).trim()).filter(Boolean)
  if (out.length > max) throw bad(`${name} supports at most ${max} domains`)
  return out
}

// Validates our own input and converts camelCase options to Tavily's snake_case body.
export function buildSearchPayload(o = {}) {
  const query = typeof o.query === 'string' ? o.query.trim() : ''
  if (!query) throw bad('query is required')
  const searchDepth = o.searchDepth ?? 'basic'
  if (!DEPTHS.includes(searchDepth)) throw bad(`searchDepth must be one of: ${DEPTHS.join(', ')}`)
  const maxResults = o.maxResults == null || o.maxResults === '' ? 5 : Number(o.maxResults) // our default is 5
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 20) throw bad('maxResults must be an integer from 1 to 20')
  const topic = o.topic ?? 'general'
  if (!TOPICS.includes(topic)) throw bad(`topic must be one of: ${TOPICS.join(', ')}`)
  const timeRange = o.timeRange && o.timeRange !== 'any' ? o.timeRange : null
  if (timeRange && !RANGES.includes(timeRange)) throw bad(`timeRange must be one of: any, ${RANGES.join(', ')}`)

  const payload = { query, search_depth: searchDepth, max_results: maxResults, topic, include_answer: Boolean(o.includeAnswer), include_usage: true }
  if (timeRange) payload.time_range = timeRange
  const inc = domains(o.includeDomains, 300, 'includeDomains')
  const exc = domains(o.excludeDomains, 150, 'excludeDomains')
  if (inc.length) payload.include_domains = inc
  if (exc.length) payload.exclude_domains = exc
  return payload
}

// Tavily errors look like { detail: { error } } or { detail: [{msg,...}] } (422).
const upstreamMessage = (b) =>
  b?.detail?.error || (Array.isArray(b?.detail) ? b.detail.map((d) => d.msg).join('; ') : null) || 'no details provided'

// Maps documented Tavily statuses (400/401/422/429/432/433/434/5xx) to our own errors.
function mapUpstreamError(status, body, headers) {
  const msg = upstreamMessage(body)
  if (status === 401 || status === 403) return new AppError(502, 'TAVILY_AUTH_FAILED', 'Tavily rejected the API key. Check TAVILY_API_KEY in server/.env.')
  if (status === 400 || status === 422) return new AppError(400, 'TAVILY_BAD_REQUEST', `Tavily rejected the request: ${msg}`)
  if (status === 429) {
    const ra = Number(headers.get('retry-after'))
    return new AppError(429, 'TAVILY_RATE_LIMITED', `Tavily rate limit hit: ${msg}`, Number.isFinite(ra) ? { retryAfterSeconds: ra } : undefined)
  }
  if (status === 432 || status === 433) return new AppError(402, 'TAVILY_PLAN_LIMIT', `Tavily usage limit exceeded: ${msg}`)
  if (status === 434) return new AppError(503, 'TAVILY_CAPACITY', `Tavily is temporarily at capacity: ${msg}`)
  return new AppError(502, 'TAVILY_UPSTREAM_ERROR', `Tavily returned HTTP ${status}: ${msg}`)
}

export async function searchTavily(options) {
  const payload = buildSearchPayload(options) // validate first so bad input never reaches the network
  if (!config.tavilyApiKey) throw new AppError(503, 'TAVILY_NOT_CONFIGURED', 'TAVILY_API_KEY is not set in server/.env')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), config.tavilyTimeoutMs)
  const t0 = performance.now()
  let res, text
  try {
    res = await fetch(`${config.tavilyBaseUrl}/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.tavilyApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    text = await res.text()
  } catch (e) {
    if (e.name === 'AbortError') throw new AppError(504, 'TAVILY_TIMEOUT', `Tavily did not respond within ${config.tavilyTimeoutMs} ms`)
    throw new AppError(502, 'TAVILY_UNREACHABLE', `Could not reach Tavily: ${e.cause?.code || e.message}`)
  } finally {
    clearTimeout(timer)
  }
  const latencyMs = Math.round(performance.now() - t0) // measured by us, includes network time

  let body = null
  try { body = JSON.parse(text) } catch { /* handled below */ }
  if (!res.ok) throw mapUpstreamError(res.status, body, res.headers)
  if (!body || !Array.isArray(body.results)) throw new AppError(502, 'TAVILY_BAD_RESPONSE', 'Tavily returned an unexpected response shape')

  return {
    query: body.query ?? payload.query,
    answer: typeof body.answer === 'string' ? body.answer : null, // only present when include_answer was requested
    results: body.results.map((r) => ({
      title: r.title ?? null,
      url: r.url ?? null,
      content: r.content ?? '',
      score: typeof r.score === 'number' ? r.score : null,
      publishedDate: r.published_date ?? null,
    })),
    // Everything here is reported by Tavily or measured by us; missing values stay null (never guessed).
    meta: {
      searchDepth: payload.search_depth,
      maxResults: payload.max_results,
      topic: payload.topic,
      tavilyResponseTimeSec: typeof body.response_time === 'number' ? body.response_time : null,
      creditsUsed: body.usage?.credits ?? null,
      requestId: body.request_id ?? null,
      measuredLatencyMs: latencyMs,
    },
  }
}
