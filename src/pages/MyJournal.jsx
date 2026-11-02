import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Heart, Lock, Trash2, Pencil } from 'lucide-react'
import { MOODS, moodOf, useApp, thumb, colCover } from '../store.jsx'
import Side from '../Side.jsx'
import { decrypt, encrypt } from '../crypto.js'

export default function MyJournal() {
  const nav = useNavigate()
  const { entries, upsert, removeEntry, collections, setCollections } = useApp()
  const [tab, setTab] = useState('All Entries')
  const [q, setQ] = useState(new URLSearchParams(location.search).get('q') || '')
  const [mood, setMood] = useState('')
  const [sort, setSort] = useState('new')
  const [col, setCol] = useState('')
  const [open, setOpen] = useState(null)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [plain, setPlain] = useState(null)
  const [show, setShow] = useState(false)
  const list = useMemo(() => {
    let l = entries.filter((e) => (tab === 'Drafts' ? e.draft : !e.draft))
    if (tab === 'Favorites') l = l.filter((e) => e.fav)
    if (tab === 'Locked') l = l.filter((e) => e.locked)
    if (mood) l = l.filter((e) => e.mood === mood)
    if (col) l = l.filter((e) => e.collection === col)
    if (q) { const s = q.toLowerCase(); l = l.filter((e) => !e.locked && (e.title + e.body + (e.tags || []).join(' ') + e.collection).toLowerCase().includes(s)) } // locked never searched
    return l.sort((a, b) => sort === 'title' ? (a.title || '').localeCompare(b.title || '') : sort === 'old' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
  }, [entries, tab, q, mood, sort, col])
  async function unlock(e) {
    e.preventDefault(); setErr('')
    try { setPlain(JSON.parse(await decrypt(open.payload, pw))) } catch { setErr('Incorrect passphrase. Locked entries cannot be recovered without it.') }
  }
  const close = () => { setOpen(null); setPw(''); setErr(''); setPlain(null) }
  const addCol = () => { const n = prompt('Collection name'); if (n?.trim()) setCollections([...new Set([...collections, n.trim()])]) }
  const renameCol = (c) => { const n = prompt('Rename collection', c); if (n?.trim() && n !== c) { setCollections(collections.map((x) => x === c ? n.trim() : x)); entries.filter((e) => e.collection === c).forEach((e) => upsert({ ...e, collection: n.trim() })) } }
  const delCol = (c) => { if (confirm(`Delete "${c}"? Its entries move to Unfiled.`)) { setCollections(collections.filter((x) => x !== c)); entries.filter((e) => e.collection === c).forEach((e) => upsert({ ...e, collection: 'Unfiled' })); setCol('') } }
  return (
    <div className="jr"><div>
      <img className="deco" src="/images/deco-books.jpg" alt="" /><p className="eyebrow">My Journal</p>
      <h1>All Your Entries</h1>
      <p className="sub">Relive your thoughts, explore your collections and see how you've grown.</p>
      <div className="row wrap bar">
        {['All Entries', 'Collections', 'Favorites', 'Locked', 'Drafts'].map((t) => <button key={t} className={'tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t}</button>)}
        <input className="inp" placeholder="Search title, text, tags…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select className="inp" value={mood} onChange={(e) => setMood(e.target.value)} aria-label="Mood filter"><option value="">All moods</option>{MOODS.map((m) => <option key={m.k} value={m.k}>{m.l}</option>)}</select>
        <select className="inp" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="new">Newest first</option><option value="old">Oldest first</option><option value="title">Title</option></select>
      </div>
      {(tab === 'Collections' || tab === 'All Entries') && (
        <div className="row wrap">{collections.map((c) => <div key={c} className={'card col ' + (col === c ? 'sel' : '')}><div className="th" style={{ background: colCover(c) }} /><button className="link" onClick={() => setCol(col === c ? '' : c)}>{c} ({entries.filter((e) => e.collection === c).length})</button><button aria-label="Rename" onClick={() => renameCol(c)}><Pencil size={14} /></button><button aria-label="Delete" onClick={() => delCol(c)}><Trash2 size={14} /></button></div>)}
          <button className="card col dashed" onClick={addCol}>+ Create Collection</button></div>
      )}
      {list.length === 0 ? (
        <div className="empty card"><h3>{entries.length ? 'No matching entries found.' : 'Your story begins here.'}</h3>
          {entries.length ? <button className="btn" onClick={() => { setQ(''); setMood(''); setCol(''); setTab('All Entries') }}>Clear Filters</button> : <button className="btn" onClick={() => nav('/write')}>Write Your First Entry</button>}</div>
      ) : (
        <div className="grid">{list.map((e) => (
          <article key={e.id} className="card entry lift"><div className="th big" style={{ background: e.locked ? 'url(/images/locked.jpg) center/cover' : thumb(e.id) }} />
            <div className="row between"><small>{e.date}</small>
              <button aria-label="Favorite" className={e.fav ? 'heart on' : 'heart'} onClick={() => upsert({ ...e, fav: !e.fav })}><Heart size={18} fill={e.fav ? 'currentColor' : 'none'} /></button></div>
            {e.locked ? (<><h4><Lock size={14} /> A Private Moment</h4><p>This entry is locked.</p><button className="btn small" onClick={() => setOpen(e)}>Unlock</button></>) : (<><h4>{e.title || 'Untitled'}</h4><p>{e.body.slice(0, 110)}</p>
              <div className="row wrap">{(e.tags || []).map((t) => <span className="chip" key={t}>{t}</span>)}</div></>)}
            <div className="row between">{moodOf(e.mood) ? <span className="chip">{moodOf(e.mood).e} {moodOf(e.mood).l}</span> : <span />}
              <span className="row"><small>{e.collection}</small>
                {!e.locked && <button aria-label="Edit" onClick={() => nav('/write?id=' + e.id)}><Pencil size={15} /></button>}
                <button aria-label="Delete" onClick={() => confirm('Delete this entry permanently?') && removeEntry(e.id)}><Trash2 size={15} /></button></span></div>
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
              <button type="button" className="btn ghost wide" onClick={() => nav('/home')}>Go Back Home</button>
              <div className="forgot"><b>Forgot your passphrase?</b><small>Unfortunately, locked entries cannot be recovered.</small></div>
            </form></>)}
        </div>
      )}
    </div><Side /></div>
  )
}
