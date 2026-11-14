# AgentArena (frontend)
React + Vite + Tailwind + React Router + Recharts + Framer Motion. Agent configuration and experiments are stored in browser localStorage. The frontend connects to the Express backend for health and real Tavily search; AI execution, Bifrost and benchmark evaluation are not implemented.

    npm install
    npm run dev      # http://localhost:5173
    npm run build

Structure: `src/pages` (Overview, Lab, Battle, Leaderboard, Analytics, Settings), `src/components` (workflow, agent configuration and UI), `src/data.js` (static options and display metadata).
The frontend uses `/api/health` for the backend status and `POST /api/tavily/search` for Lab searches and the Settings connection test. Set `VITE_API_BASE_URL` when the frontend and backend are hosted separately; it defaults to the Vite `/api` development proxy.

Redesign: neon workflow canvas (`components/WorkflowCanvas.jsx`, illustrative preview in `useWorkflow.js`). The preview does not run agents. Bifrost is not connected; its Settings test button sends nothing.

## Truthful prototype notes
- No fictional agents or scores exist. Agent configs and experiments are created by the user and stored in localStorage (`src/store.js`).
- Results are `null` until a backend calls `actions.attachResults(experimentId, {agentId:{completion,accuracy,sources,completeness,timeMs,tokens,cost}})`. Leaderboard and Analytics read only those results.
- Tavily search makes real requests through the backend. Search output is shown and can be saved with an experiment. The workflow animation remains a preview and produces no execution data.
- AI research answers, Bifrost routing, multiple-agent execution and benchmark evaluation remain unimplemented.

## Backend (server/)
Separate package, same repo. Phase 1: Express + CORS + dotenv + `GET /api/health`.

    # terminal 1 (backend)
    cd server
    npm install
    if (!(Test-Path .env)) { Copy-Item .env.example .env }
    npm run dev

    # terminal 2 (frontend, from project root)
    npm run dev

### Tavily service (server/src/services/tavily.js)
Set `TAVILY_API_KEY` in `server/.env`. Use the Research Lab's **Search with Tavily** action or Settings' **Test Tavily search** action. Both call the real `POST /api/tavily/search` endpoint with the configured search options. A search may use Tavily API credits.

## Implementation plan
1. Connect the frontend to backend health and display connection status. (Implemented)
2. Connect real Tavily search and display returned sources. (Implemented)
3. Generate AI research answers from search results.
4. Route model requests through Bifrost.
5. Execute multiple configured agents and measure their runs.
6. Add real evaluation metrics and leaderboard results; never fill missing values with fabricated scores.
