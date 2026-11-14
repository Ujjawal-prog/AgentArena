const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function apiRequest(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    throw new Error(`Could not connect to the AgentArena backend: ${error.message}`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('The AgentArena backend returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Backend request failed (${response.status}).`)
  }

  return payload
}
