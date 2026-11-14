import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import healthRouter from './routes/health.js'
import tavilyRouter from './routes/tavily.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Only the configured frontend origins may call the API from a browser.
app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (curl, server-to-server) that send no Origin header.
      if (!origin || config.clientOrigins.includes(origin)) return cb(null, true)
      cb(Object.assign(new Error(`Origin ${origin} is not allowed`), { status: 403, code: 'CORS_DENIED' }))
    },
  })
)
app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRouter)
app.use('/api/tavily', tavilyRouter) // thin wrapper for testing the Tavily service directly
// /api/research (agent) is added in a later stage.

app.use('/api', notFound)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`AgentArena server listening on http://localhost:${config.port} (${config.env})`)
})
