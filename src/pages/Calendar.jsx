import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, FilePlus2, Lock, Pencil, StickyNote, Trash2, X } from 'lucide-react'
import { MOODS, moodOf, thumb, today, useApp } from '../store.jsx'
import CalendarGarden from '../CalendarGarden.jsx'

export default function Calendar() {
  const nav = useNavigate()
  const { entries, moods, setMoods, notes, setNotes } = useApp()
  const [cur, setCur] = useState(new Date())
  const [sel, setSel] = useState(null)
  const [dir, setDir] = useState(1)
  const [adding, setAdding] = useState(false)
  const [txt, setTxt] = useState('')

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && setSel(null)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(cur)), end: endOfWeek(endOfMonth(cur)) })
  const k = (d) => format(d, 'yyyy-MM-dd')
  const pick = (key) => { setSel(key); setAdding(false); setTxt('') }
  const month = (n) => { setDir(n); setCur(addMonths(cur, n)) }
  const dayEntries = sel ? entries.filter((e) => e.date === sel && !e.draft) : []
  const dayNotes = sel ? notes.filter((n) => n.date === sel) : []
  const add = () => { if (!txt.trim()) return; const t = Date.now(); setNotes([...notes, { id: crypto.randomUUID(), date: sel, text: txt.trim(), created: t, updated: t }]); setTxt(''); setAdding(false) }
  const edit = (n) => { const t = prompt('Edit note', n.text); if (t?.trim()) setNotes(notes.map((x) => x.id === n.id ? { ...x, text: t.trim(), updated: Date.now() } : x)) }

  return (
    <>
      <CalendarGarden />
      <h1>Your Journal Calendar</h1>
      <p className="sub">Look back, relive and see how your days come together.</p>
      <p className="cal-hint">You can add quick notes and journal entries by selecting any date.</p>

      <div className={'cal' + (sel ? ' has-card' : '')}>
        <section className="card">
          <div className="row between">
            <button className="ic" aria-label="Previous month" title="Previous month" onClick={() => month(-1)}><ChevronLeft /></button>
            <h3>{format(cur, 'MMMM yyyy')}</h3>
            <span className="row"><button className="btn small ghost" onClick={() => { setCur(new Date()); pick(today()) }}>Today</button><button className="ic" aria-label="Next month" title="Next month" onClick={() => month(1)}><ChevronRight /></button></span>
          </div>
          <div key={format(cur, 'yyyy-MM')} data-dir={dir} className="gridcal mslide">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <b key={d}>{d}</b>)}
            {days.map((d) => {
              const key = k(d), m = moodOf(moods[key]), n = entries.filter((e) => e.date === key && !e.draft)
              return (
                <button key={key} className={'day ' + (key === sel ? 'sel ' : '') + (isSameMonth(d, cur) ? '' : 'out')} onClick={() => pick(key)} aria-label={format(d, 'PPPP')} aria-pressed={key === sel}>
                  {format(d, 'd')}
                  {n.length > 0 && <i className="dthumb" style={{ background: n[0].locked ? 'var(--forest)' : thumb(n[0].id) }} />}
                  <span className="dots">{m && <i style={{ background: m.c }} />}{n.length > 0 && <i style={{ background: 'var(--forest)' }} />}{notes.some((x) => x.date === key) && <i style={{ background: '#d9a441' }} />}</span>
                </button>
              )
            })}
          </div>
        </section>

        {sel && (<>
          <div className="cback" onClick={() => setSel(null)} />
          <aside className="card dcard" role="dialog" aria-label={'Details for ' + sel}>
            <div className="row between"><h3>{format(new Date(sel + 'T00:00'), 'EEE, MMM d, yyyy')}</h3><button className="ic" aria-label="Close" title="Close" onClick={() => setSel(null)}><X size={18} /></button></div>
            <select className="inp" value={moods[sel] || ''} onChange={(e) => setMoods({ ...moods, [sel]: e.target.value })} aria-label="Mood for this day"><option value="" disabled>How did you feel?</option>{MOODS.map((m) => <option key={m.k} value={m.k}>{m.e} {m.l}</option>)}</select>
            <div className="dact">
              <button className="btn small" onClick={() => setAdding(!adding)}><StickyNote size={16} /> Add Quick Note</button>
              <button className="btn small ghost" onClick={() => nav('/write?date=' + sel)}><FilePlus2 size={16} /> Add Journal Entry</button>
            </div>
            {adding && <div className="row"><input autoFocus className="inp" style={{ flex: 1 }} value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Write a quick note" aria-label="Quick note" /><button className="btn small" onClick={add}>Save</button></div>}
            {dayEntries.length > 0 && <h4>Journal entries</h4>}
            {dayEntries.map((e) => e.locked
              ? <div className="mini" key={e.id}><Lock size={13} /> Private entry</div>
              : <button className="mini" key={e.id} onClick={() => nav('/write?id=' + e.id)}><b>{e.title || 'Untitled'}</b><p>{(e.body || '').slice(0, 70)}</p></button>)}
            {dayNotes.length > 0 && <h4>Quick notes</h4>}
            {dayNotes.map((n) => <div className="mini row between" key={n.id}><span>{n.text}</span><span><button aria-label="Edit note" title="Edit" onClick={() => edit(n)}><Pencil size={14} /></button><button aria-label="Delete note" title="Delete" onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}><Trash2 size={14} /></button></span></div>)}
            {dayEntries.length === 0 && dayNotes.length === 0 && !adding && <p className="sub">Nothing here yet. Add a note or an entry above.</p>}
          </aside></>)}
      </div>
    </>
  )
}