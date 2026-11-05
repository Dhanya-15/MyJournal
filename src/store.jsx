import { createContext, useContext, useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'

export const MOODS = [['happy','😊','#f4c95d'],['calm','😌','#91ad92'],['sad','😢','#8fb3d9'],['anxious','😟','#b99be0'],['angry','😠','#e8806f'],['tired','😴','#d8c8a8']]
  .map(([k, e, c]) => ({ k, e, c, l: k[0].toUpperCase() + k.slice(1) }))
export const moodOf = (k) => MOODS.find((m) => m.k === k)
export const isDemo = () => localStorage.getItem('mj_mode') === 'demo'
export const today = () => format(new Date(), 'yyyy-MM-dd')
const P = () => (isDemo() ? 'mjd_' : 'mj_')

function sample() {
  const d = (n) => format(subDays(new Date(), n), 'yyyy-MM-dd')
  const e = (id, n, title, body, mood, collection, tags, fav) => ({ id, date: d(n), title, body, mood, collection, tags, fav, locked: false, draft: false, created: Date.now() - n * 864e5 })
  const entries = [
    e('s1', 1, 'A peaceful morning', 'Today started with a slow cup of coffee and a quiet mind. I felt more present and calm.', 'calm', 'Personal Life', ['morning', 'self-care'], true),
    e('s2', 3, 'Small wins', 'I completed a few important tasks today and it felt good to be productive.', 'happy', 'Goals', ['goals'], false),
    e('s3', 5, 'Overthinking again', 'Some days are heavier than others. I am trying to be kind to myself.', 'sad', 'Personal Life', ['reflection'], false),
    e('s4', 8, 'Grateful', 'I am grateful for the people who show up and the little moments that make my day brighter.', 'happy', 'Gratitude', ['family'], true),
  ]
  const ks = MOODS.map((m) => m.k), moods = {}
  for (let i = 0; i < 40; i++) if (i % 5 !== 4) moods[d(i)] = ks[(i * 7 + (i % 3)) % 6]
  return { entries, moods, notes: [{ id: 'n1', date: d(0), text: 'Read 10 pages of a book', created: Date.now(), updated: Date.now() }], collections: ['Personal Life', 'Goals', 'Gratitude'] }
}

// shared=true keeps the key the same in normal and demo mode (used for theme and settings)
function useLS(k, init, shared = false) {
  const pre = shared ? 'mj_' : P()
  const [v, set] = useState(() => {
    try { const s = localStorage.getItem(pre + k); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => {
    try { localStorage.setItem(pre + k, JSON.stringify(v)) } catch { alert('Storage is full. Export a backup and delete some entries.') }
  }, [k, v, pre])
  return [v, set]
}

const Ctx = createContext()
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [demo, setDemoState] = useState(isDemo())
  const [n, setN] = useState(0)
  const setDemo = (on) => {
    if (on) localStorage.setItem('mj_mode', 'demo'); else localStorage.removeItem('mj_mode')
    setDemoState(on)
  }
  const resetDemo = () => {
    Object.keys(localStorage).filter((k) => k.startsWith('mjd_')).forEach((k) => localStorage.removeItem(k))
    setN((v) => v + 1)
  }
  // changing key re-reads the right data set (demo or real) without any navigation
  return <Data key={(demo ? 'd' : 'r') + n} demo={demo} setDemo={setDemo} resetDemo={resetDemo}>{children}</Data>
}

function Data({ children, demo, setDemo, resetDemo }) {
  const s = demo ? sample() : { entries: [], moods: {}, notes: [], collections: [] }
  const [entries, setEntries] = useLS('entries', s.entries)
  const [moods, setMoods] = useLS('moods', s.moods)
  const [notes, setNotes] = useLS('notes', s.notes)
  const [collections, setCollections] = useLS('collections', s.collections)
  const [settings, setSettings] = useLS('settings', { theme: 'light', name: '', onboarded: false }, true)
  useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])
  const upsert = (en) => setEntries((l) => (l.some((x) => x.id === en.id) ? l.map((x) => (x.id === en.id ? en : x)) : [en, ...l]))
  const api = {
    entries, setEntries, upsert, moods, setMoods, notes, setNotes, collections, setCollections, settings, setSettings,
    removeEntry: (id) => setEntries((l) => l.filter((x) => x.id !== id)),
    demo, setDemo, resetDemo,
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

const EC = ['e1','e2','e3','e4','e5','w1','w2','w3','w4','f1','f2','f3','f4']
const h = (s) => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0)
export const thumb = (s = '') => `url(/images/${EC[h(s) % EC.length]}.jpg) center/cover`
export const colCover = (s = '') => `url(/images/col${(h(s) % 5) + 1}.jpg) center/cover`