import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Home as HomeI, PenLine, BookOpen, CalendarDays, BarChart3, Settings as SetI, Sun, Moon, Leaf, Menu } from 'lucide-react'
import { useState } from 'react'
import { useApp, isDemo } from './store.jsx'
import { Bell, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Home from './pages/Home.jsx'
import Write from './pages/Write.jsx'
import MyJournal from './pages/MyJournal.jsx'
import Calendar from './pages/Calendar.jsx'
import Mood from './pages/Mood.jsx'
import Settings from './pages/Settings.jsx'

const NAV = [['/home','Home',HomeI],['/write','Write Journal',PenLine],['/journal','My Journal',BookOpen],['/calendar','Calendar',CalendarDays],['/mood','Mood Insights',BarChart3],['/settings','Settings',SetI]]

function Shell({ children }) {
  const { settings, setSettings } = useApp()
  const [open, setOpen] = useState(false)
  const dark = settings.theme === 'dark'
  const nav = useNavigate()
  return (
    <div className="shell">
      <button className="burger" aria-label="Open menu" onClick={() => setOpen(!open)}><Menu /></button>
      <aside className={'side ' + (open ? 'open' : '')} onClick={() => setOpen(false)}>
        <div className="logo"><Leaf /> <span>MyJournal</span></div>
        <nav>{NAV.map(([to, label, Icon]) => <NavLink key={to} to={to}><Icon size={20} />{label}</NavLink>)}</nav>
        <div className="grow" />
        <button className="toggle" onClick={(e) => { e.stopPropagation(); setSettings({ ...settings, theme: dark ? 'light' : 'dark' }) }} aria-label="Toggle theme">
          <Sun size={16} /><span className={'knob ' + (dark ? 'on' : '')} /><Moon size={16} />
        </button>
        <p className="tag"><Leaf size={18} /><br />Every page<br />holds a moment<br />of you.</p>
      </aside>
      <main className="main">
        {isDemo() && <div className="demo">Demo Mode · sample data, separate from your journal</div>}
        <div className="top"><label className="search"><Search size={18} /><input placeholder="Search your entries…" aria-label="Search entries" onKeyDown={(e) => e.key === 'Enter' && nav('/journal?q=' + encodeURIComponent(e.target.value))} /></label>
          <button aria-label="Notifications" className="bell"><Bell size={20} /></button><button className="avatar" aria-label="Profile" onClick={() => nav('/settings')}>🌿</button></div>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  const loc = useLocation()
  if (loc.pathname === '/') return <Shell><Welcome /></Shell>
  return (
    <Shell>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/write" element={<Write />} />
        <Route path="/journal" element={<MyJournal />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Shell>
  )
}
