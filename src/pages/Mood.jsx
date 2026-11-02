import { useState } from 'react'
import { format, isSameMonth, subMonths, differenceInCalendarDays } from 'date-fns'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MOODS, moodOf, useApp } from '../store.jsx'
import { useNavigate } from 'react-router-dom'

export default function Mood() {
  const nav = useNavigate()
  const { moods } = useApp()
  const [f, setF] = useState('month')
  const now = new Date()
  const rows = Object.entries(moods).map(([d, m]) => ({ d: new Date(d + 'T00:00'), m })).filter(({ d }) => f === 'all' ? true : f === 'week' ? differenceInCalendarDays(now, d) >= 0 && differenceInCalendarDays(now, d) < 7 : f === 'month' ? isSameMonth(d, now) : isSameMonth(d, subMonths(now, 1))).sort((a, b) => a.d - b.d)
  const counts = MOODS.map((m) => ({ ...m, n: rows.filter((r) => r.m === m.k).length }))
  const top = [...counts].sort((a, b) => b.n - a.n)[0]
  const wk = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => ({ day, ...Object.fromEntries(MOODS.map((m) => [m.k, rows.filter((r) => r.d.getDay() === i && r.m === m.k).length])) }))
  const pct = (n) => (rows.length ? Math.round((n / rows.length) * 100) : 0)
  return (
    <>
      <p className="eyebrow">Mood Insights</p><h1>Understand Your Journey</h1><p className="sub">See patterns, celebrate progress, and know yourself better.</p>
      <div className="row wrap pills">{[['week','This Week'],['month','This Month'],['prev','Previous Month'],['all','All Time']].map(([k, l]) => <button key={k} className={'tab ' + (f === k ? 'on' : '')} onClick={() => setF(k)}>{l}</button>)}</div>
      {rows.length === 0 ? <div className="empty card"><h3>Every feeling has a place here.</h3><button className="btn" onClick={() => nav('/home')}>Record Today's Mood</button></div> : (<>
        <div className="mtop">
          <section className="card"><img className="moodart" src="/images/mood-art.jpg" alt="" /><h3>Overall Mood</h3><p className="sub">A snapshot of how you felt.</p>
            <div className="row wrap"><div style={{ width: 190, height: 190, position: 'relative' }}><ResponsiveContainer><PieChart><Pie data={counts.filter((c) => c.n)} dataKey="n" nameKey="l" innerRadius={58} outerRadius={88} animationDuration={900}>{counts.filter((c) => c.n).map((c) => <Cell key={c.k} fill={c.c} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
              <div className="donut"><b>{rows.length}</b><small>Check-ins</small></div></div>
              <ul className="leg">{counts.map((c) => <li key={c.k}><i style={{ background: c.c }} />{c.l}<b>{pct(c.n)}%</b></li>)}</ul></div></section>
          <section className="card quoteC"><p className="serif">“Every feeling you record is a small act of kindness to yourself.”</p><small>You tracked {new Set(rows.map((r) => +r.d)).size} days. Most common: {top.e} {top.l}.</small></section>
        </div>
        <div className="three">
          <section className="card"><h3>Mood Trend</h3><p className="sub">How your moods changed over time.</p><div className="trend">{rows.map((r) => <i key={+r.d} title={format(r.d, 'PP') + ' · ' + moodOf(r.m).l} style={{ background: moodOf(r.m).c }} />)}</div></section>
          <section className="card"><h3>Mood by Day of Week</h3><div style={{ height: 180 }}><ResponsiveContainer><BarChart data={wk}><XAxis dataKey="day" tickLine={false} /><YAxis hide /><Tooltip />{MOODS.map((m) => <Bar key={m.k} dataKey={m.k} stackId="a" fill={m.c} radius={2} />)}</BarChart></ResponsiveContainer></div></section>
          <section className="card"><h3>Mood Calendar</h3><div className="heat">{rows.map((r) => <i key={+r.d} title={format(r.d, 'PP')} style={{ background: moodOf(r.m).c }} />)}</div></section>
        </div>
        <section className="card mt"><h3>Insights</h3><p>{rows.length >= 5 ? `You recorded “${top.l}” most often — ${pct(top.n)}% of your check-ins.` : 'Record a few more check-ins to see observations.'}</p></section></>)}
    </>
  )
}
