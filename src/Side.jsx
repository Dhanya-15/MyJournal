import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth, formatDistanceToNow } from 'date-fns'
import { BookOpen, Folder, Flame, Heart } from 'lucide-react'
import { moodOf, today, useApp } from './store.jsx'

export default function Side() {
  const { entries, moods, collections } = useApp()
  const now = new Date(), days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
  let streak = 0; for (let i = 0; i < 400; i++) { const d = format(new Date(Date.now() - i * 864e5), 'yyyy-MM-dd'); if (entries.some((e) => e.date === d) || moods[d]) streak++; else if (i > 0) break; else continue }
  const stats = [[BookOpen, entries.length, 'Entries'], [Folder, collections.length, 'Collections'], [Flame, streak, 'Streak Days'], [Heart, entries.filter((e) => e.fav).length, 'Favorites']]
  const recent = [...entries].sort((a, b) => b.created - a.created).slice(0, 4)
  return (
    <aside className="rside">
      <section className="card"><h3>{format(now, 'MMMM yyyy')}</h3>
        <div className="mc">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <small key={d}>{d}</small>)}
          {Array.from({ length: getDay(days[0]) }).map((_, i) => <span key={'b' + i} />)}
          {days.map((d) => { const k = format(d, 'yyyy-MM-dd'), m = moodOf(moods[k]); return <span key={k} className={'mcd ' + (k === today() ? 'now' : '')}>{format(d, 'd')}{m && <i style={{ background: m.c }} />}</span> })}</div></section>
      <section className="card"><h3>Journal Stats</h3><div className="stats">{stats.map(([I, n, l]) => <div key={l}><I size={22} /><b>{n}</b><small>{l}</small></div>)}</div></section>
      <section className="card"><h3>Recent Activity</h3>{recent.length === 0 && <p className="sub">Nothing yet.</p>}
        {recent.map((e) => <div key={e.id} className="act"><span>{e.locked ? 'Locked an entry' : 'Wrote “' + (e.title || 'Untitled') + '”'}</span><small>{formatDistanceToNow(e.created)} ago</small></div>)}</section>
    </aside>
  )
}
