import { useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Trash2, Pencil, Lock } from 'lucide-react'
import { thumb, moodOf, today, useApp } from '../store.jsx'
import { useNavigate } from 'react-router-dom'

export default function Calendar() {
  const nav = useNavigate()
  const { entries, moods, setMoods, notes, setNotes } = useApp()
  const [cur, setCur] = useState(new Date())
  const [sel, setSel] = useState(today())
  const [txt, setTxt] = useState('')
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(cur)), end: endOfWeek(endOfMonth(cur)) })
  const k = (d) => format(d, 'yyyy-MM-dd')
  const dayEntries = entries.filter((e) => e.date === sel && !e.draft)
  const dayNotes = notes.filter((n) => n.date === sel)
  const add = () => { if (!txt.trim()) return; const t = Date.now(); setNotes([...notes, { id: crypto.randomUUID(), date: sel, text: txt.trim(), created: t, updated: t }]); setTxt('') }
  const edit = (n) => { const t = prompt('Edit note', n.text); if (t?.trim()) setNotes(notes.map((x) => x.id === n.id ? { ...x, text: t.trim(), updated: Date.now() } : x)) }
  return (
    <>
      <p className="eyebrow">Calendar</p>
      <h1>Your Journal Calendar</h1>
      <p className="sub">Look back, relive and see how your days come together.</p>
      <div className="cal">
        <section className="card">
          <div className="row between"><button aria-label="Previous month" onClick={() => setCur(addMonths(cur, -1))}><ChevronLeft /></button>
            <h3>{format(cur, 'MMMM yyyy')}</h3>
            <span className="row"><button className="btn small ghost" onClick={() => { setCur(new Date()); setSel(today()) }}>Today</button><button aria-label="Next month" onClick={() => setCur(addMonths(cur, 1))}><ChevronRight /></button></span></div>
          <div className="gridcal">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <b key={d}>{d}</b>)}
            {days.map((d) => { const key = k(d), m = moodOf(moods[key]); const n = entries.filter((e) => e.date === key && !e.draft)
              return <button key={key} className={'day ' + (key === sel ? 'sel ' : '') + (isSameMonth(d, cur) ? '' : 'out')} onClick={() => setSel(key)} aria-label={format(d, 'PPPP')}>
                {format(d, 'd')}{n.length > 0 && <i className="dthumb" style={{ background: thumb(n[0].id) }} />}<span className="dots">{m && <i style={{ background: m.c }} />}{n.length > 0 && <i style={{ background: 'var(--forest)' }} />}{notes.some((x) => x.date === key) && <i style={{ background: '#d9a441' }} />}</span></button> })}</div>
        </section>
        <aside className="card">
          <h3>{format(new Date(sel + 'T00:00'), 'EEE, MMM d, yyyy')}</h3>
          <select className="inp" value={moods[sel] || ''} onChange={(e) => setMoods({ ...moods, [sel]: e.target.value })} aria-label="Mood for this day"><option value="" disabled>Pick a mood</option>{['happy','calm','sad','anxious','angry','tired'].map((m) => <option key={m} value={m}>{moodOf(m).e} {moodOf(m).l}</option>)}</select>
          <button className="btn small" onClick={() => nav('/write')}>Add Journal Entry</button>
          {dayEntries.length === 0 && <p className="sub">No entries for this day.</p>}
          {dayEntries.map((e) => <div className="mini" key={e.id}>{e.locked ? <><Lock size={13} /> Private entry</> : <><b>{e.title || 'Untitled'}</b><p>{e.body.slice(0, 70)}</p></>}</div>)}
          <h4>Quick Notes</h4>
          {dayNotes.length === 0 && <p className="sub">A little space for today's thoughts.</p>}
          {dayNotes.map((n) => <div className="mini row between" key={n.id}><span>{n.text}</span><span><button aria-label="Edit note" onClick={() => edit(n)}><Pencil size={14} /></button><button aria-label="Delete note" onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}><Trash2 size={14} /></button></span></div>)}
          <div className="row"><input className="inp" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a quick note" aria-label="Quick note" /><button className="btn small" onClick={add}>Add Note</button></div>
        </aside>
      </div>
      <div className="desk" aria-hidden><img src="/images/cal-deco.jpg" alt="" /><img src="/images/pen.jpg" alt="" /><img src="/images/cal-mug.jpg" alt="" /></div>
    </>
  )
}
