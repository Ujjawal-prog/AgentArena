import { Router } from 'express'
import { config } from '../config.js'

const router = Router()

// GET /api/health
// "configured" only means a value is present in server/.env. It does NOT mean the
// key was verified against Tavily or Bifrost (no external calls are made here).
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agentarena-server',
    environment: config.env,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    integrations: {
      tavily: { configured: Boolean(config.tavilyApiKey), verified: false },
      bifrost: { configured: Boolean(config.bifrostBaseUrl && config.bifrostApiKey), verified: false },
    },
  })
})

export default router
