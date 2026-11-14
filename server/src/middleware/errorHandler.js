import { config } from '../config.js'

// Unknown /api route -> JSON 404 instead of Express' HTML page.
export const notFound = (req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` } })

// Last-resort error handler. Throw an AppError to control status/code/details.
// Internal (5xx) details are hidden in production, except deliberate upstream 502/503/504 messages.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500
  if (status === 500) console.error(err)
  if (err.details?.retryAfterSeconds != null) res.set('Retry-After', String(err.details.retryAfterSeconds))
  res.status(status).json({
    error: {
      code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
      message: status === 500 && config.env === 'production' ? 'Internal server error' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  })
}
