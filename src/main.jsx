import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './index.css'
import App from './App'
import Overview from './pages/Overview'
import Lab from './pages/Lab'
import Battle from './pages/Battle'
import Leaderboard from './pages/Leaderboard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
createRoot(document.getElementById('root')).render(
<BrowserRouter><Routes><Route element={<App/>}>
<Route index element={<Overview/>}/><Route path="lab" element={<Lab/>}/><Route path="battle" element={<Battle/>}/>
<Route path="leaderboard" element={<Leaderboard/>}/><Route path="analytics" element={<Analytics/>}/><Route path="settings" element={<Settings/>}/>
</Route></Routes></BrowserRouter>)
