import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Heart, ListFilter, Lock, Pencil, Trash2, X } from 'lucide-react'
import { MOODS, moodOf, useApp, thumb, colCover } from '../store.jsx'
import { decrypt } from '../crypto.js'

const tilt = (e) => {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + 'deg')
  e.currentTarget.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(2) + 'deg')
}
const untilt = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg') }

export default function MyJournal() {
  const nav = useNavigate()
  const { entries, upsert, removeEntry, collections, setCollections } = useApp()
  const [tab, setTab] = useState('All Entries')
  const [mood, setMood] = useState('')
  const [col, setCol] = useState('')
  const [tag, setTag] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('new')
  const [fop, setFop] = useState(false)
  const [open, setOpen] = useState(null)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [plain, setPlain] = useState(null)
  const [show, setShow] = useState(false)

  const allTags = useMemo(() => [...new Set(entries.filter((e) => !e.locked).flatMap((e) => e.tags || []))].sort(), [entries])
  const nf = [col, mood, tag, from, to].filter(Boolean).length
  const clearAll = () => { setCol(''); setMood(''); setTag(''); setFrom(''); setTo('') }

  const list = useMemo(() => {
    let l = entries.filter((e) => (tab === 'Drafts' ? e.draft : !e.draft))
    if (tab === 'Favorites') l = l.filter((e) => e.fav)
    if (tab === 'Locked') l = l.filter((e) => e.locked)
    if (mood) l = l.filter((e) => e.mood === mood)
    if (col) l = l.filter((e) => e.collection === col)
    if (tag) l = l.filter((e) => !e.locked && (e.tags || []).includes(tag))
    if (from) l = l.filter((e) => e.date >= from)
    if (to) l = l.filter((e) => e.date <= to)
    return [...l].sort((a, b) => sort === 'title' ? (a.title || '').localeCompare(b.title || '') : sort === 'old' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
  }, [entries, tab, mood, col, tag, from, to, sort])

  async function unlock(e) {
    e.preventDefault(); setErr('')
    try { setPlain(JSON.parse(await decrypt(open.payload, pw))) } catch { setErr('Incorrect passphrase. Locked entries cannot be recovered without it.') }
  }
  const close = () => { setOpen(null); setPw(''); setErr(''); setPlain(null) }
  const addCol = () => { const n = prompt('Collection name'); if (n?.trim()) setCollections([...new Set([...collections, n.trim()])]) }
  const renameCol = (c) => { const n = prompt('Rename collection', c); if (n?.trim() && n !== c) { setCollections(collections.map((x) => x === c ? n.trim() : x)); entries.filter((e) => e.collection === c).forEach((e) => upsert({ ...e, collection: n.trim() })) } }
  const delCol = (c) => { if (confirm(`Delete "${c}"? Its entries move to Unfiled.`)) { setCollections(collections.filter((x) => x !== c)); entries.filter((e) => e.collection === c).forEach((e) => upsert({ ...e, collection: 'Unfiled' })); setCol('') } }

  return (
    <div className="jr1">
      <h1>All Your Entries</h1>
      <p className="sub">Relive your thoughts, explore your collections and see how you've grown.</p>

      <div className="row between wrap bar" onKeyDown={(e) => e.key === 'Escape' && setFop(false)}>
        <div className="row wrap">{['All Entries', 'Collections', 'Favorites', 'Locked', 'Drafts'].map((t) => <button key={t} className={'tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t}</button>)}</div>
        <div className="pw r">
          <button className={'ic tool-f' + (nf ? ' on' : '')} aria-label="Filters" title="Filters" aria-expanded={fop} onClick={() => setFop(!fop)}>
            <ListFilter size={19} />{nf > 0 && <span className="badge">{nf}</span>}
          </button>
          {fop && (<>
            <div className="popback" onClick={() => setFop(false)} />
            <div className="popcard fcard" role="dialog" aria-label="Filters">
              <h4>Filter entries <button aria-label="Close filters" onClick={() => setFop(false)}><X size={16} /></button></h4>
              <label>Category<select className="inp" value={col} onChange={(e) => setCol(e.target.value)}><option value="">All categories</option><option>Unfiled</option>{collections.map((c) => <option key={c}>{c}</option>)}</select></label>
              <div><small className="sub">Mood</small>
                <div className="mchips">{MOODS.map((m) => <button key={m.k} title={m.l} aria-label={m.l} aria-pressed={mood === m.k} className={mood === m.k ? 'on' : ''} style={{ '--c': m.c }} onClick={() => setMood(mood === m.k ? '' : m.k)}>{m.e}</button>)}</div></div>
              <label>Tag<select className="inp" value={tag} onChange={(e) => setTag(e.target.value)}><option value="">All tags</option>{allTags.map((t) => <option key={t}>{t}</option>)}</select></label>
              <div className="row"><label>From<input type="date" className="inp" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label>To<input type="date" className="inp" value={to} onChange={(e) => setTo(e.target.value)} /></label></div>
              <label>Sort<select className="inp" value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">Newest first</option><option value="old">Oldest first</option><option value="title">Title</option></select></label>
              <div className="row between"><button className="link" onClick={clearAll}>Clear all</button><button className="btn small" onClick={() => setFop(false)}>Done</button></div>
            </div></>)}
        </div>
      </div>

      {(tab === 'Collections' || tab === 'All Entries') && (
        <div className="row wrap">{collections.map((c) => (
          <div key={c} className={'card col ' + (col === c ? 'sel' : '')}>
            <div className="th" style={{ background: colCover(c) }} />
            <button className="link" onClick={() => setCol(col === c ? '' : c)}>{c} ({entries.filter((e) => e.collection === c).length})</button>
            <span className="row"><button aria-label="Rename" title="Rename" onClick={() => renameCol(c)}><Pencil size={14} /></button><button aria-label="Delete" title="Delete" onClick={() => delCol(c)}><Trash2 size={14} /></button></span>
          </div>))}
          <button className="card col dashed" onClick={addCol}>+ Create Collection</button></div>
      )}

      {list.length === 0 ? (
        <div className="empty card"><h3>{entries.length ? 'No matching entries found.' : 'Your story begins here.'}</h3>
          {entries.length ? <button className="btn" onClick={() => { clearAll(); setTab('All Entries') }}>Clear Filters</button> : <button className="btn" onClick={() => nav('/write')}>Write Your First Entry</button>}</div>
      ) : (
        <div className="grid">{list.map((e, n) => (
          <article key={e.id} className="card entry lift" style={{ '--n': Math.min(n, 10) }} onPointerMove={tilt} onPointerLeave={untilt}>
            <div className="th big" style={{ background: e.locked ? 'url(/images/locked.jpg) center/cover' : thumb(e.id) }} />
            <div className="row between"><small>{e.date}</small>
              <button aria-label="Favorite" title="Favorite" className={e.fav ? 'heart on' : 'heart'} onClick={() => upsert({ ...e, fav: !e.fav })}><Heart size={18} fill={e.fav ? 'currentColor' : 'none'} /></button></div>
            {e.locked ? (<><h4><Lock size={14} /> A Private Moment</h4><p>This entry is locked.</p><button className="btn small" onClick={() => setOpen(e)}>Unlock</button></>) : (<><h4>{e.title || 'Untitled'}</h4><p>{(e.body || '').slice(0, 110)}</p>
              <div className="row wrap">{(e.tags || []).map((t) => <span className="chip" key={t}>{t}</span>)}</div></>)}
            <div className="row between">{moodOf(e.mood) ? <span className="chip">{moodOf(e.mood).e} {moodOf(e.mood).l}</span> : <span />}
              <span className="row"><small>{e.collection}</small>
                {!e.locked && <button aria-label="Edit" title="Edit" onClick={() => nav('/write?id=' + e.id)}><Pencil size={15} /></button>}
                <button aria-label="Delete" title="Delete" onClick={() => confirm('Delete this entry permanently?') && removeEntry(e.id)}><Trash2 size={15} /></button></span></div>
          </article>))}</div>
      )}

      <section className="keep card"><div><h3>Keep going…</h3><p className="sub">Each entry is a step towards a brighter, calmer you.</p></div><button className="btn" onClick={() => nav('/write')}>+ Write New Entry</button></section>

      {open && (
        <div className={plain ? 'modal' : 'lockscreen'} role="dialog" aria-modal="true" onKeyDown={(e) => e.key === 'Escape' && close()}>
          {plain ? (
            <div className="card dlg"><h2>{plain.title || 'Untitled'}</h2><p style={{ whiteSpace: 'pre-wrap' }}>{plain.body}</p><div className="row"><button className="btn" onClick={close}>Re-lock & close</button></div></div>
          ) : (<>
            <img className="lockart" src="/images/lock-art.jpg" alt="" />
            <form className="glass" onSubmit={unlock}>
              <img className="bubble" src="/images/lock-bubble.jpg" alt="" />
              <h1>This Entry is Locked</h1><p>A private moment, just for you 💚</p><p className="sub">Enter your passphrase to unlock and read this entry.</p>
              <label className="pwf"><Lock size={18} /><input autoFocus type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter your passphrase" aria-label="Passphrase" /><button type="button" aria-label="Show or hide passphrase" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></label>
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn wide">Unlock Entry</button><div className="or">OR</div>
              <button type="button" className="btn ghost wide" onClick={close}>Back to My Journal</button>
              <div className="forgot"><b>Forgot your passphrase?</b><small>Unfortunately, locked entries cannot be recovered.</small></div>
            </form></>)}
        </div>
      )}
    </div>
  )
}