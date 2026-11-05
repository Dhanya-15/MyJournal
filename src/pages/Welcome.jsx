import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Art from '../WelcomeArt.jsx'

const S = [
  ['01', 'Write Freely', 'Capture your thoughts, memories and little moments.', 's1'],
  ['02', 'Track Your Mood', 'Understand your emotions and see your progress over time.', 's2'],
  ['03', 'Stay Organized', 'See your entries in a calendar and never miss a moment.', 's3'],
  ['04', 'Gain Insights', 'Spot patterns, celebrate growth and learn about yourself.', 's4'],
  ['05', 'Make It Yours', 'Pick your theme, set preferences and lock private entries.', 's5'],
]
const N = S.length

export default function Welcome() {
  const nav = useNavigate()
  const { settings, setSettings, setDemo } = useApp()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef(null)

  useEffect(() => {
    document.body.classList.add('welcome-page')
    return () => document.body.classList.remove('welcome-page')
  }, [])

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((v) => (v + 1) % N), 3200)
    return () => clearInterval(t)
  }, [paused])

  const go = () => { setSettings({ ...settings, onboarded: true }); nav('/home') }
  const next = () => setI((v) => (v + 1) % N)
  const prev = () => setI((v) => (v + N - 1) % N)
  const off = (k) => { let o = (k - i + N) % N; if (o > 2) o -= N; return o }

  return (
    <div className="wl">
      <img className="wl-bg" src="/images/wel-book.jpg" alt="" />
      <button className="wl-skip" onClick={go}>Skip <ArrowRight size={16} /></button>

      <section className="wl-text">
        <p className="eyebrow wl-in" style={{ '--d': '0s' }}>Welcome to MyJournal</p>
        <h1 className="wl-h wl-in" style={{ '--d': '.12s' }}>Your Story, Your Space</h1>
        <p className="lead wl-in" style={{ '--d': '.26s' }}>A peaceful place to write, reflect and grow — one day at a time.</p>
        <div className="wl-cta wl-in" style={{ '--d': '.4s' }}>
          <button className="btn" onClick={go}>Get Started <ArrowRight size={16} /></button>
          <button className="btn ghost" onClick={() => setDemo(true)}>Try Demo</button>
        </div>
      </section>

      <section
        className="cf wl-in" style={{ '--d': '.5s' }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => { if (startX.current == null) return; const dx = e.changedTouches[0].clientX - startX.current; if (Math.abs(dx) > 40) (dx < 0 ? next : prev)(); startX.current = null }}
      >
        <button className="cf-arr l" aria-label="Previous card" onClick={prev}><ChevronLeft /></button>
        {S.map(([n, t, d, img], k) => {
          const o = off(k)
          return (
            <article key={t} className={'cf-card' + (o === 0 ? ' cur' : '')} style={{ '--o': o, '--a': Math.abs(o) }} onClick={() => setI(k)} aria-hidden={o !== 0}>
              <small>{n}</small>
              <h3>{t}</h3>
              <p>{d}</p>
              <div className="cf-art"><Art k={img} /></div>
            </article>
          )
        })}
        <button className="cf-arr r" aria-label="Next card" onClick={next}><ChevronRight /></button>
      </section>

      <div className="cf-dots">
        {S.map((_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={'Show card ' + (k + 1)} onClick={() => setI(k)} />)}
      </div>
    </div>
  )
}