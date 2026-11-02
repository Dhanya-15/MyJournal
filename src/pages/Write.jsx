import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MOODS, today, useApp } from '../store.jsx'
import { encrypt } from '../crypto.js'
import { Lock, Check } from 'lucide-react'

export default function Write() {
  const nav = useNavigate()
  const [q] = useSearchParams()
  const { entries, upsert, collections, setCollections, settings } = useApp()
  const editId = q.get('id')
  const ex = entries.find((e) => e.id === editId && !e.locked)
  const draftKey = 'mj_draft'
  const init = ex || JSON.parse(localStorage.getItem(draftKey) || 'null') || { title: '', body: q.get('prompt') ? q.get('prompt') + '\n\n' : '', date: today(), mood: null, collection: 'Unfiled', tags: [] }
  const [f, setF] = useState(init)
  const [tag, setTag] = useState('')
  const [lock, setLock] = useState(false)
  const [pw, setPw] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (ex || settings.autosave === false) return
    const t = setTimeout(() => { try { localStorage.setItem(draftKey, JSON.stringify(f)); setStatus('Draft saved') } catch { setStatus('Could not save draft') } }, 700)
    return () => clearTimeout(t)
  }, [f])
  const set = (k, v) => setF({ ...f, [k]: v })
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
  return (
    <>
      <p className="eyebrow">Write Journal</p>
      <h1>Write Your Journal</h1>
      <p className="sub">Capture your thoughts, feelings and moments.</p>
      <div className="write">
        <section className="paper">
          <div className="row between wrap">
            <input type="date" className="inp" value={f.date} onChange={(e) => set('date', e.target.value)} aria-label="Entry date" />
            <div className="moods small">{MOODS.map((m) => <button key={m.k} title={m.l} aria-label={m.l} aria-pressed={f.mood === m.k} className={'mood ' + (f.mood === m.k ? 'sel' : '')} style={{ '--c': m.c }} onClick={() => set('mood', m.k)}><span>{m.e}</span></button>)}</div>
          </div>
          <input className="title" placeholder="Give your entry a title…" value={f.title} onChange={(e) => set('title', e.target.value)} aria-label="Title" />
          <textarea className="body" placeholder="Start writing…" value={f.body} onChange={(e) => set('body', e.target.value)} aria-label="Entry text" style={{ fontSize: settings.size || 17 }} />
          <div className="row between wrap">
            <button className="btn ghost" onClick={() => save(true)}>Save as Draft</button>
            <small>{status || 'Your thoughts matter — keep going.'}{settings.words !== false && ` · ${words} words`}</small>
            <button className="btn" onClick={() => save(false)}>Save Entry</button>
          </div>
          {err && <p className="err" role="alert">{err}</p>}
        </section>
        <aside className="panel">
          <div className="card"><h4>Entry Organization</h4>
            <label>Collection<select className="inp" value={f.collection} onChange={(e) => set('collection', e.target.value)}><option>Unfiled</option>{collections.map((c) => <option key={c}>{c}</option>)}</select></label>
            <button className="link" onClick={newCol}>+ Create New Collection</button>
            <label>Tags<input className="inp" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={addTag} placeholder="Add tag, press Enter" /></label>
            <div className="row wrap">{f.tags.map((t) => <span key={t} className="chip">{t} <button aria-label={'Remove ' + t} onClick={() => set('tags', f.tags.filter((x) => x !== t))}>×</button></span>)}</div></div>
          <div className="card"><h4><Lock size={16} /> Lock This Entry</h4>
            <label className="row"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Encrypt with your passphrase</label>
            {lock && <><input type="password" className="inp" placeholder="Passphrase" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Passphrase" /><small>A forgotten passphrase cannot be recovered.</small></>}</div>
          <div className="card"><h4>Writing Prompts</h4>{['What made you smile today?','What are you grateful for?','What did you learn today?','What is one small step towards your goal?'].map((t) => <button key={t} className="pi" onClick={() => set('body', f.body + (f.body ? '\n\n' : '') + t + '\n')}>🌿 {t}</button>)}</div>
        </aside>
      </div>
      <div className="desk" aria-hidden><img src="/images/books.jpg" alt="" /><img src="/images/mug.jpg" alt="" /><img src="/images/pen.jpg" alt="" /></div>
    </>
  )
}
