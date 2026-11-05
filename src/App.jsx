import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Home as HomeI, PenLine, BookOpen, CalendarDays, BarChart3, Settings as SetI, Sun, Moon, Leaf, Menu, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from './store.jsx'
import Welcome from './pages/Welcome.jsx'
import Home from './pages/Home.jsx'
import Write from './pages/Write.jsx'
import MyJournal from './pages/MyJournal.jsx'
import Calendar from './pages/Calendar.jsx'
import Mood from './pages/Mood.jsx'
import Settings from './pages/Settings.jsx'

const NAV = [['/home','Home',HomeI],['/write','Write Journal',PenLine],['/journal','My Journal',BookOpen],['/calendar','Calendar',CalendarDays],['/mood','Mood Insights',BarChart3],['/settings','Settings',SetI]]

function SearchBox({ entries, nav }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inp = useRef(null)
  useEffect(() => { if (open) inp.current?.focus() }, [open])
  const close = () => { setOpen(false); setQ('') }
  const res = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    // locked entries are never searched: their text is encrypted and stays private
    return entries.filter((e) => !e.locked && ((e.title || '') + ' ' + (e.body || '') + ' ' + (e.tags || []).join(' ')).toLowerCase().includes(s)).slice(0, 6)
  }, [q, entries])
  return (
    <div className={'sbox' + (open ? ' open' : '')}>
      {open && <div className="sback" onClick={close} />}
      <div className="sfield">
        <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && close()} placeholder="Search titles, tags, text…" aria-label="Search journal entries" tabIndex={open ? 0 : -1} />
        <button className="ic" aria-label="Search entries" title="Search" aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}><Search size={19} /></button>
      </div>
      {open && q.trim() && (
        <div className="sres" role="listbox">
          {res.length === 0 ? <p className="sub">No matching entries found.</p> : res.map((e) => (
            <button key={e.id} role="option" onClick={() => { close(); nav('/write?id=' + e.id) }}>
              <b>{e.title || 'Untitled'}</b><small>{e.date}</small><span>{(e.body || '').slice(0, 70)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Shell({ children }) {
  const { settings, setSettings, setDemo, demo, entries } = useApp()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const dark = settings.theme === 'dark'
  return (
    <div className="shell">
      <aside className={'side ' + (open ? 'open' : '')} onClick={() => setOpen(false)}>
        <div className="logo"><Leaf /> <span>MyJournal</span></div>
        <nav>{NAV.map(([to, label, Icon]) => <NavLink key={to} to={to}><Icon size={20} />{label}</NavLink>)}</nav>
        <div className="grow" />
        <button className="toggle demo-sw" role="switch" aria-checked={demo} aria-label="Demo mode" onClick={(e) => { e.stopPropagation(); setDemo(!demo) }}>
          <span>Demo Mode</span><span className={'knob ' + (demo ? 'on' : '')} />
        </button>
        <p className="tag"><Leaf size={18} /><br />Every page<br />holds a moment<br />of you.</p>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main className="main">
        <header className="top">
          <button className="burger" aria-label="Open menu" onClick={() => setOpen(!open)}><Menu /></button>
          <SearchBox entries={entries} nav={nav} />
          <button className="ic avatar" aria-label="Profile and settings" title="Profile & settings" onClick={() => nav('/settings')}>{settings.avatar || '🌿'}</button>
          <button className="ic" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title={dark ? 'Light theme' : 'Dark theme'} onClick={() => setSettings({ ...settings, theme: dark ? 'light' : 'dark' })}>
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>
        {demo && <div className="demo">Demo Mode · sample data, separate from your journal <button onClick={() => setDemo(false)}>Exit Demo</button></div>}
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
      <div key={loc.pathname} className="page">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/write" element={<Write key={loc.search} />} />
          <Route path="/journal" element={<MyJournal />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </Shell>
  )
}