import { Router } from 'express'
import { searchTavily } from '../services/tavily.js'

const router = Router()

// POST /api/tavily/search
// Body: { query, searchDepth?, maxResults?, topic?, timeRange?, includeDomains?, excludeDomains?, includeAnswer? }
router.post('/search', async (req, res, next) => {
  try {
    res.json(await searchTavily(req.body || {}))
  } catch (e) {
    next(e)
  }
})

export default router
