import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, FolderTree, Info, PenLine, ShieldCheck, UserRound, X } from 'lucide-react'
import { useApp } from '../store.jsx'
import SettingsGarden from '../SettingsGarden.jsx'

const TILES = [
  ['profile', 'Profile', UserRound, 'Name and avatar'],
  ['write', 'Writing', PenLine, 'Font size, word count, autosave'],
  ['privacy', 'Privacy & Lock', ShieldCheck, 'How your entries are protected'],
  ['data', 'Data', Database, 'Export, import, clear'],
  ['org', 'Collections & Tags', FolderTree, 'Manage and set a default'],
  ['help', 'Help & About', Info, 'How MyJournal works'],
]
const AVATARS = ['🌿', '🌸', '🍃', '⛰️', '📓', '🌙']

function save(name, text, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

export default function Settings() {
  const nav = useNavigate()
  const { settings, setSettings, entries, setEntries, upsert, moods, setMoods, notes, setNotes, collections, setCollections, demo, setDemo, resetDemo } = useApp()
  const [open, setOpen] = useState(null)
  const set = (p) => setSettings({ ...settings, ...p })
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const txt = entries.filter((e) => !e.locked).map((e) => `${e.date}\n${e.title}\n${e.body}\n`).join('\n---\n\n')
  const csv = 'date,mood\n' + Object.entries(moods).map(([d, m]) => d + ',' + m).join('\n')
  const tags = [...new Set(entries.filter((e) => !e.locked).flatMap((e) => e.tags || []))].sort()
  const imp = (ev) => {
    const r = new FileReader()
    r.onload = () => { try { const d = JSON.parse(r.result); if (d.version !== 1 || !Array.isArray(d.entries)) throw 0
      if (!confirm(`Import ${d.entries.length} entries and replace current data?`)) return
      setEntries(d.entries); setMoods(d.moods || {}); setNotes(d.notes || []); setCollections(d.collections || []) } catch { alert('This file is not a valid MyJournal backup.') } }
    if (ev.target.files[0]) r.readAsText(ev.target.files[0])
  }
  const clear = () => { if (confirm('Delete ALL journal data on this device? This cannot be undone.')) { setEntries([]); setMoods({}); setNotes([]); setCollections([]) } }
  const renameCol = (c) => { const n = prompt('Rename collection', c); if (n?.trim() && n !== c) { setCollections(collections.map((x) => x === c ? n.trim() : x)); entries.filter((e) => e.collection === c).forEach((e) => upsert({ ...e, collection: n.trim() })) } }
  const delCol = (c) => { if (confirm(`Delete "${c}"? Its entries move to Unfiled.`)) { setCollections(collections.filter((x) => x !== c)); entries.filter((e) => e.collection === c).forEach((e) => upsert({ ...e, collection: 'Unfiled' })) } }
  const delTag = (t) => { if (confirm(`Remove the tag "${t}" from all entries?`)) entries.filter((e) => !e.locked && (e.tags || []).includes(t)).forEach((e) => upsert({ ...e, tags: e.tags.filter((x) => x !== t) })) }

  const PANELS = {
    profile: <>
      <p>This is a local profile. Nothing is sent online.</p>
      <label>Display name<input className="inp" value={settings.name || ''} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" /></label>
      <div><small className="sub">Avatar</small><div className="av">{AVATARS.map((a) => <button key={a} aria-label={'Avatar ' + a} aria-pressed={(settings.avatar || '🌿') === a} className={(settings.avatar || '🌿') === a ? 'on' : ''} onClick={() => set({ avatar: a })}>{a}</button>)}</div></div>
    </>,
    write: <>
      <p>Choose how the editor looks and behaves.</p>
      <label className="row between">Font size <span className="row"><input type="range" min="14" max="24" value={settings.size || 17} onChange={(e) => set({ size: +e.target.value })} /> {settings.size || 17}px</span></label>
      <label className="row between">Show word count <input type="checkbox" checked={settings.words !== false} onChange={(e) => set({ words: e.target.checked })} /></label>
      <label className="row between">Autosave drafts <input type="checkbox" checked={settings.autosave !== false} onChange={(e) => set({ autosave: e.target.checked })} /></label>
    </>,
    privacy: <>
      <p>Locked entries are encrypted in your browser with AES-GCM, and the key comes from your passphrase (PBKDF2). Your passphrase is never stored.</p>
      <p>Lock an entry from the padlock icon on the Write Journal page. Locked entries are not searchable and do not show their content until unlocked.</p>
      <p><b>A forgotten passphrase cannot be recovered.</b></p>
    </>,
    data: <>
      <p>Your data lives in this browser. Back it up regularly. Locked entries stay encrypted in exports.</p>
      <div className="col2">
        <button className="btn ghost" onClick={() => save('myjournal-entries.txt', txt, 'text/plain')}>Export entries (TXT)</button>
        <button className="btn ghost" onClick={() => save('mood-records.csv', csv, 'text/csv')}>Export moods (CSV)</button>
        <button className="btn ghost" onClick={() => save('myjournal-backup.json', JSON.stringify({ version: 1, entries, moods, notes, collections }))}>Full backup (JSON)</button>
        <label className="btn ghost">Import backup<input type="file" accept="application/json" hidden onChange={imp} /></label>
        <button className="btn danger" onClick={clear}>Clear all data</button>
      </div>
    </>,
    org: <>
      <label>Default collection for new entries<select className="inp" value={settings.defaultCol || 'Unfiled'} onChange={(e) => set({ defaultCol: e.target.value })}><option>Unfiled</option>{collections.map((c) => <option key={c}>{c}</option>)}</select></label>
      <div><small className="sub">Collections</small>
        {collections.length === 0 && <p className="sub">No collections yet.</p>}
        {collections.map((c) => <div className="lrow" key={c}><span>{c}</span><span><button className="link" onClick={() => renameCol(c)}>Rename</button><button className="link" onClick={() => delCol(c)}>Delete</button></span></div>)}</div>
      <div><small className="sub">Tags</small>
        {tags.length === 0 && <p className="sub">No tags yet.</p>}
        <div className="row wrap">{tags.map((t) => <span className="chip" key={t}>{t} <button aria-label={'Remove tag ' + t} onClick={() => delTag(t)}>×</button></span>)}</div></div>
    </>,
    help: <>
      <p>MyJournal is a private journal and mood tracker. Everything is stored in your browser, with no account and no server.</p>
      <div className="col2">
        <button className="btn ghost" onClick={() => { set({ onboarded: false }); nav('/') }}>Restart onboarding</button>
        {demo ? <><button className="btn ghost" onClick={resetDemo}>Reset demo data</button><button className="btn" onClick={() => setDemo(false)}>Exit Demo</button></> : <button className="btn ghost" onClick={() => setDemo(true)}>Try Demo</button>}
      </div>
    </>,
  }
  const cur = TILES.find((t) => t[0] === open)
  const CurIcon = cur ? cur[2] : null

  
  return (
    <>
      <SettingsGarden />
      <h1>Customize Your Space</h1>
      <p className="sub">Make MyJournal truly yours. Pick an icon to change its settings.</p>
      <div className="stiles">
        {TILES.map(([k, label, Icon, hint], n) => (
          <button key={k} className={'stile' + (open === k ? ' on' : '')} style={{ '--n': n }} title={label} aria-haspopup="dialog" onClick={() => setOpen(k)}>
            <span className="sic"><Icon size={30} /></span><b>{label}</b><small>{hint}</small>
          </button>
        ))}
      </div>
      {cur && (
        <div className="spback" onClick={() => setOpen(null)}>
          <div className="spcard" role="dialog" aria-modal="true" aria-label={cur[1]} onClick={(e) => e.stopPropagation()}>
            <h3><span className="sic sm"><CurIcon size={20} /></span>{cur[1]}<button className="ic" aria-label="Close" title="Close" onClick={() => setOpen(null)}><X size={18} /></button></h3>
            {PANELS[open]}
          </div>
        </div>
      )}
    </>
  )
}