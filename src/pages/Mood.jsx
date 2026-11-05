import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, eachDayOfInterval, endOfDay, endOfMonth, endOfWeek, endOfYear, format, parseISO, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { MOODS, moodOf, today, useApp } from '../store.jsx'

const RANGES = ['Day', 'Week', 'Month', 'Year', 'Custom']

export default function Mood() {
  const nav = useNavigate()
  const { moods, entries } = useApp()
  const [r, setR] = useState('Week')
  const [off, setOff] = useState(0)
  const [cf, setCf] = useState(format(addDays(new Date(), -29), 'yyyy-MM-dd'))
  const [ct, setCt] = useState(today())
  const now = new Date()

  let s, e
  if (r === 'Day') { s = startOfDay(addDays(now, off)); e = endOfDay(s) }
  else if (r === 'Week') { s = startOfWeek(addWeeks(now, off)); e = endOfWeek(s) }
  else if (r === 'Month') { s = startOfMonth(addMonths(now, off)); e = endOfMonth(s) }
  else if (r === 'Year') { s = startOfYear(addYears(now, off)); e = endOfYear(s) }
  else { s = startOfDay(parseISO(cf)); e = endOfDay(parseISO(ct)) }
  const bad = r === 'Custom' && s > e
  const sk = format(s, 'yyyy-MM-dd'), ek = format(e, 'yyyy-MM-dd')

  const pts = useMemo(() => {
    if (bad) return []
    let p
    if (r === 'Day') {
      p = entries.filter((x) => x.date === sk && x.mood && !x.draft).map((x) => { const t = new Date(x.created); return { x: t.getHours() + t.getMinutes() / 60, mood: x.mood, label: x.locked ? 'Private entry' : (x.title || 'Untitled') } })
    } else {
      p = Object.entries(moods).filter(([d]) => d >= sk && d <= ek).map(([d, m]) => ({ x: parseISO(d).getTime() + 432e5, mood: m, label: format(parseISO(d), 'EEE, MMM d') }))
    }
    return p.sort((a, b) => a.x - b.x).map((q) => ({ ...q, y: 5 - MOODS.findIndex((m) => m.k === q.mood) }))
  }, [r, sk, ek, moods, entries, bad])

  const days = differenceInCalendarDays(e, s) + 1
  let domain, ticks, fmt
  if (r === 'Day') { domain = [0, 24]; ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24]; fmt = (v) => String(v).padStart(2, '0') + ':00' }
  else {
    domain = [s.getTime(), e.getTime()]
    if (r === 'Year') { ticks = Array.from({ length: 12 }, (_, i) => new Date(s.getFullYear(), i, 1).getTime()); fmt = (v) => format(v, 'MMM') }
    else { const st = Math.max(1, Math.ceil(days / 7)); ticks = bad ? [] : eachDayOfInterval({ start: s, end: e }).filter((_, i) => i % st === 0).map((d) => d.getTime() + 432e5); fmt = (v) => format(v, days <= 8 ? 'EEE d' : 'd MMM') }
  }
  const label = r === 'Day' ? format(s, 'EEEE, MMM d') : r === 'Week' ? `${format(s, 'd MMM')} – ${format(e, 'd MMM')}` : r === 'Month' ? format(s, 'MMMM yyyy') : r === 'Year' ? format(s, 'yyyy') : ''
  const dense = pts.length > 45
  const checkin = r === 'Day' ? moodOf(moods[sk]) : null

  const Dot = ({ cx, cy, payload }) => {
    if (cx == null) return null
    const m = moodOf(payload.mood), rad = dense ? 5 : 15
    return (
      <g className="gdot">
        <circle cx={cx} cy={cy} r={rad + 5} fill={m.c} opacity=".25" />
        <circle cx={cx} cy={cy} r={rad} fill={m.c} stroke="#fff" strokeWidth="2" />
        {!dense && <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15">{m.e}</text>}
      </g>
    )
  }
  const tilt = (ev) => {
    if (ev.pointerType !== 'mouse') return
    const b = ev.currentTarget.getBoundingClientRect()
    ev.currentTarget.style.setProperty('--ry', (((ev.clientX - b.left) / b.width - 0.5) * 4).toFixed(2) + 'deg')
    ev.currentTarget.style.setProperty('--rx', (-((ev.clientY - b.top) / b.height - 0.5) * 4).toFixed(2) + 'deg')
  }
  const untilt = (ev) => { ev.currentTarget.style.setProperty('--rx', '0deg'); ev.currentTarget.style.setProperty('--ry', '0deg') }

  return (
    <>
      <h1>Understand Your Journey</h1>
      <p className="sub">See how your moods flow over time.</p>

      <div className="row between wrap mfilter">
        <div className="seg" role="tablist" aria-label="Time range">
          {RANGES.map((x) => <button key={x} role="tab" aria-selected={r === x} className={r === x ? 'on' : ''} onClick={() => { setR(x); setOff(0) }}>{x}</button>)}
        </div>
        {r !== 'Custom' ? (
          <div className="row">
            <button className="ic" aria-label="Previous period" title="Previous" onClick={() => setOff(off - 1)}><ChevronLeft /></button>
            <b className="plabel">{label}</b>
            <button className="ic" aria-label="Next period" title="Next" disabled={off >= 0} onClick={() => setOff(off + 1)}><ChevronRight /></button>
          </div>
        ) : (
          <div className="row wrap">
            <label className="dl">From<input type="date" className="inp" value={cf} max={ct} onChange={(ev) => setCf(ev.target.value)} /></label>
            <label className="dl">To<input type="date" className="inp" value={ct} min={cf} max={today()} onChange={(ev) => setCt(ev.target.value)} /></label>
          </div>
        )}
      </div>
      {bad && <p className="err" role="alert">The start date must be before the end date.</p>}

      <section className="gcard" onPointerMove={tilt} onPointerLeave={untilt}>
        <div className="row between wrap">
          <div className="lg">{MOODS.map((m) => <span key={m.k} title={m.l}><i style={{ background: m.c }}>{m.e}</i>{pts.filter((p) => p.mood === m.k).length}</span>)}</div>
          {checkin && <span className="chip">Check-in: {checkin.e} {checkin.l}</span>}
        </div>
        {pts.length === 0 ? (
          <div className="gempty"><h3>Every feeling has a place here.</h3><p className="sub">{r === 'Day' ? 'No entries with a mood on this day.' : 'No mood check-ins in this period.'}</p><button className="btn" onClick={() => nav('/home')}>Record Today's Mood</button></div>
        ) : (
          <div className="gbox" key={r + off + cf + ct}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 14, right: 18, bottom: 6, left: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="var(--pale)" />
                <XAxis type="number" dataKey="x" domain={domain} ticks={ticks} tickFormatter={fmt} tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} allowDataOverflow />
                <YAxis type="number" dataKey="y" domain={[-0.5, 5.5]} ticks={[0, 1, 2, 3, 4, 5]} tickFormatter={(v) => MOODS[5 - v].e} tick={{ fontSize: 18 }} width={42} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ strokeDasharray: '4 4', stroke: 'var(--sage)' }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload, m = moodOf(p.mood)
                  return <div className="gtip"><span>{m.e}</span><b>{m.l}</b><small>{p.label}</small></div>
                }} />
                <Scatter data={pts} shape={Dot} line={{ stroke: '#91ad92', strokeOpacity: 0.55, strokeWidth: 2 }} lineType="joint" animationDuration={900} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </>
  )
}