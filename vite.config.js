import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// Dev only: forward /api/* to the Express server so the frontend can call fetch('/api/health').
export default defineConfig({plugins:[react()],server:{proxy:{'/api':'http://localhost:8787'}}})
