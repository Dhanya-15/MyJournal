import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { MOODS, moodOf, today, useApp } from '../store.jsx'
import HomeForest from '../HomeForest.jsx'
const PROMPTS = ['What made you smile today?', 'What are you grateful for?', 'What challenged you today?', 'What are you proud of?', 'What would you tell your future self?']

export default function Home() {
  const nav = useNavigate()
  const { entries, moods, setMoods, settings } = useApp()
  const [p, setP] = useState(0)
  const h = new Date().getHours()
  const hi = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'
  const recent = [...entries].filter((e) => !e.draft).sort((a, b) => b.created - a.created).slice(0, 4)
  const week = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))
  return (
    <>
      <HomeForest />
      <p className="eyebrow">Home</p>
      <h1>Your Personal Space</h1>
      <p className="sub">{hi}{settings.name ? ', ' + settings.name : ''} · {format(new Date(), 'EEEE, MMM d')}. Take a breath, then write what is true today.</p>
      <section className="hero card">
        <div className="book" aria-hidden><div className="book-in">🌿</div></div>
        <div><h2>Begin today's page</h2><p className="sub">A few honest lines are enough.</p>
          <button className="btn" onClick={() => nav('/write')}>Write Journal</button></div>
      </section>
      <div className="two">
        <section className="card">
          <h3>How are you feeling today?</h3>
          <div className="moods">{MOODS.map((m) => (
            <button key={m.k} className={'mood ' + (moods[today()] === m.k ? 'sel' : '')} style={{ '--c': m.c }} onClick={() => setMoods({ ...moods, [today()]: m.k })} aria-pressed={moods[today()] === m.k}>
              <span>{m.e}</span>{m.l}</button>))}</div>
        </section>
        <section className="card">
          <h3>Writing prompt</h3>
          <div className="prompt"><button aria-label="Previous" onClick={() => setP((p + 4) % 5)}><ChevronLeft /></button>
            <button className="pr" onClick={() => nav('/write?prompt=' + encodeURIComponent(PROMPTS[p]))}>{PROMPTS[p]}</button>
            <button aria-label="Next" onClick={() => setP((p + 1) % 5)}><ChevronRight /></button></div>
        </section>
      </div>
      <h3 className="mt">Recent entries</h3>
      {recent.length === 0 ? (
        <div className="empty card"><h3>Your story begins here.</h3><button className="btn" onClick={() => nav('/write')}>Write Your First Entry</button></div>
      ) : (
        <div className="grid">{recent.map((e) => (
          <article key={e.id} className="card entry" onClick={() => nav('/journal')}>
            <small>{e.date}</small>
            {e.locked ? <h4><Lock size={14} /> Private entry</h4> : <><h4>{e.title || 'Untitled'}</h4><p>{e.body.slice(0, 90)}</p></>}
            {moodOf(e.mood) && <span className="chip">{moodOf(e.mood).e} {moodOf(e.mood).l}</span>}
          </article>))}</div>
      )}
      <div className="two mt">
        <section className="card"><h3>Quick actions</h3><div className="row wrap">
          <button className="btn" onClick={() => nav('/write')}>New Journal Entry</button>
          <button className="btn ghost" onClick={() => nav('/calendar')}>Open Calendar</button>
          <button className="btn ghost" onClick={() => nav('/mood')}>View Mood Insights</button></div></section>
        <section className="card"><h3>This week</h3><div className="week">{week.map((d) => { const m = moodOf(moods[d]); return <div key={d}><i style={{ background: m ? m.c : 'var(--pale)' }} title={m ? m.l : 'No check-in'} /><small>{format(new Date(d + 'T00:00'), 'EEE')}</small></div> })}</div></section>
      </div>
    </>
  )
}
