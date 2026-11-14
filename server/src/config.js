// Central environment configuration. Reads server/.env regardless of the directory
// the process is started from, so `npm run dev` works from root or from server/.
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(here, '../.env') })

const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean)

export const config = {
  port: Number(process.env.PORT) || 8787,
  env: process.env.NODE_ENV || 'development',
  clientOrigins: list(process.env.CLIENT_ORIGIN || 'http://localhost:5173'),
  // Secrets stay inside the server process. They are never returned by any endpoint.
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  tavilyBaseUrl: (process.env.TAVILY_BASE_URL || 'https://api.tavily.com').replace(/\/$/, ''),
  // Advanced searches can be slow; abort the upstream call after this many ms.
  tavilyTimeoutMs: Number(process.env.TAVILY_TIMEOUT_MS) || 30000,
  bifrostBaseUrl: process.env.BIFROST_BASE_URL || '',
  bifrostApiKey: process.env.BIFROST_API_KEY || '',
}
