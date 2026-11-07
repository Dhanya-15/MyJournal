import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FolderOpen, Lock, X } from 'lucide-react'
import { MOODS, today, useApp } from '../store.jsx'
import { encrypt } from '../crypto.js'

const PROMPTS = ['What made you smile today?', 'What are you grateful for?', 'What did you learn today?', "What's on your mind right now?", 'What is one small step towards your goal?', 'What challenged you today?', 'What are you proud of?', 'What would you tell your future self?']
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Write() {
  const nav = useNavigate()
  const [q] = useSearchParams()
  const { entries, upsert, collections, setCollections, settings } = useApp()
  const ex = entries.find((e) => e.id === q.get('id') && !e.locked)
  const draftKey = 'mj_draft'
  const base = ex || JSON.parse(localStorage.getItem(draftKey) || 'null') || { title: '', body: q.get('prompt') ? q.get('prompt') + '\n\n' : '', date: today(), mood: null, collection: settings.defaultCol || 'Unfiled', tags: [] }
  const [f, setF] = useState(!ex && q.get('date') ? { ...base, date: q.get('date') } : base)
  const [tag, setTag] = useState('')
  const [lock, setLock] = useState(false)
  const [pw, setPw] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')
  const [pop, setPop] = useState(null)
  const [pi, setPi] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const first = useRef(true)
  const ta = useRef(null)
  const sx = useRef(null)

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const step = (d) => { setDir(d); setPi((v) => (v + d + PROMPTS.length) % PROMPTS.length) }
  useEffect(() => {
    if (paused || reduced()) return
    const t = setInterval(() => step(1), 5000)
    return () => clearInterval(t)
  }, [paused, pi])
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (ex || settings.autosave === false) return
    const t = setTimeout(() => { try { localStorage.setItem(draftKey, JSON.stringify(f)); setStatus('Draft saved') } catch { setStatus('Could not save draft') } }, 700)
    return () => clearTimeout(t)
  }, [f])

  const usePrompt = () => { setF((x) => ({ ...x, body: x.body + (x.body ? '\n\n' : '') + PROMPTS[pi] + '\n' })); ta.current?.focus() }
  const words = f.body.trim() ? f.body.trim().split(/\s+/).length : 0

  async function save(draft) {
    setErr('')
    if (!f.title.trim() && !f.body.trim()) return setErr('Add a title or some text first.')
    let en = { ...f, id: ex ? ex.id : crypto.randomUUID(), created: ex ? ex.created : Date.now(), fav: ex?.fav || false, draft, locked: false }
    try {
      if (lock) {
        if (pw.length < 6) return setErr('Use a passphrase of at least 6 characters.')
        const payload = await encrypt(JSON.stringify({ title: f.title, body: f.body, tags: f.tags }), pw)
        en = { id: en.id, created: en.created, date: en.date, mood: en.mood, collection: en.collection, fav: en.fav, draft: false, locked: true, payload }
      }
      upsert(en)
      if (!ex) localStorage.removeItem(draftKey)
      nav('/journal')
    } catch { setErr('Save failed. Storage may be full.') }
  }
  const addTag = (e) => { if (e.key === 'Enter' && tag.trim()) { e.preventDefault(); if (!f.tags.includes(tag.trim())) set('tags', [...f.tags, tag.trim()]); setTag('') } }
  const newCol = () => { const n = prompt('Collection name'); if (n?.trim()) { setCollections([...new Set([...collections, n.trim()])]); set('collection', n.trim()) } }
  const toggle = (k) => setPop(pop === k ? null : k)

  return (
    <div className="wj-bg">
    <div className="wj" onKeyDown={(e) => e.key === 'Escape' && setPop(null)}>
      <h1>Write Your Journal</h1>
      <p className="sub">Capture your thoughts, feelings and moments.</p>

      <div className="pcar" data-dir={dir} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onPointerDown={(e) => { sx.current = e.clientX }}
        onPointerUp={(e) => { if (sx.current == null) return; const dx = e.clientX - sx.current; sx.current = null; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1) }}>
        <button className="ar" aria-label="Previous prompt" title="Previous" onClick={() => step(-1)}><ChevronLeft size={18} /></button>
        <button key={pi} className="pr2" title="Use this prompt" onClick={usePrompt}>{PROMPTS[pi]}</button>
        <button className="ar" aria-label="Next prompt" title="Next" onClick={() => step(1)}><ChevronRight size={18} /></button>
      </div>

      <section className="paper">
        <div className="row between wrap">
          <div className="row">
            <input type="date" className="inp" value={f.date} onChange={(e) => set('date', e.target.value)} aria-label="Entry date" />
            <div className="pw">
              <button className={'tool' + (pop === 'org' ? ' on' : '')} aria-label="Entry organization" title="Collection & tags" aria-expanded={pop === 'org'} onClick={() => toggle('org')}>
                <FolderOpen size={20} />{(f.collection !== 'Unfiled' || f.tags.length > 0) && <i className="dot" />}
              </button>
              {pop === 'org' && (<>
                <div className="popback" onClick={() => setPop(null)} />
                <div className="popcard" role="dialog" aria-label="Entry organization">
                  <h4>Organize this entry <button aria-label="Close" onClick={() => setPop(null)}><X size={16} /></button></h4>
                  <p>Put it in a collection and add tags so you can find it later.</p>
                  <label>Collection<select className="inp" value={f.collection} onChange={(e) => set('collection', e.target.value)}><option>Unfiled</option>{collections.map((c) => <option key={c}>{c}</option>)}</select></label>
                  <button className="link" onClick={newCol}>+ Create new collection</button>
                  <label>Tags<input className="inp" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={addTag} placeholder="Type a tag, press Enter" /></label>
                  <div className="row wrap">{f.tags.map((t) => <span key={t} className="chip">{t} <button aria-label={'Remove ' + t} onClick={() => set('tags', f.tags.filter((x) => x !== t))}>×</button></span>)}</div>
                </div></>)}
            </div>
            <div className="pw">
              <button className={'tool' + (pop === 'lock' || lock ? ' on' : '')} aria-label="Lock this entry" title="Lock this entry" aria-expanded={pop === 'lock'} onClick={() => toggle('lock')}><Lock size={20} /></button>
              {pop === 'lock' && (<>
                <div className="popback" onClick={() => setPop(null)} />
                <div className="popcard" role="dialog" aria-label="Lock this entry">
                  <h4>Lock this entry <button aria-label="Close" onClick={() => setPop(null)}><X size={16} /></button></h4>
                  <p>Encrypts the entry in your browser with your passphrase. A forgotten passphrase cannot be recovered.</p>
                  <label className="row"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Encrypt when I save</label>
                  {lock && <input type="password" className="inp" placeholder="Passphrase (6+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Passphrase" />}
                </div></>)}
            </div>
          </div>
          <div className="moods small">{MOODS.map((m) => <button key={m.k} title={m.l} aria-label={m.l} aria-pressed={f.mood === m.k} className={'mood ' + (f.mood === m.k ? 'sel' : '')} style={{ '--c': m.c }} onClick={() => set('mood', m.k)}><span>{m.e}</span></button>)}</div>
        </div>
        <input className="title" placeholder="Give your entry a title…" value={f.title} onChange={(e) => set('title', e.target.value)} aria-label="Title" />
        <textarea ref={ta} className="body" placeholder="Start writing…" value={f.body} onChange={(e) => set('body', e.target.value)} aria-label="Entry text" style={{ fontSize: settings.size || 17 }} />
        <div className="row between wrap">
          <button className="btn ghost" onClick={() => save(true)}>Save as Draft</button>
          <small>{status || 'Your thoughts matter — keep going.'}{settings.words !== false && ` · ${words} words`}</small>
          <button className="btn" onClick={() => save(false)}>Save Entry</button>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
      </section>
      </div>
    </div>
  )
}