import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../store.jsx'
import { ArrowRight } from 'lucide-react'
import Art from '../WelcomeArt.jsx'

const S = [
  ['01', 'Write Freely', 'Capture your thoughts, memories and little moments.', 's1'],
  ['02', 'Track Your Mood', 'Understand your emotions and see your progress over time.', 's2'],
  ['03', 'Stay Organized', 'See your entries in a calendar and never miss a moment.', 's3'],
  ['04', 'Gain Insights', 'Spot patterns, celebrate growth and learn about yourself.', 's4'],
  ['05', 'Make It Yours', 'Pick your theme, set preferences and lock private entries.', 's5'],
]
const N = S.length
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Welcome() {
  const nav = useNavigate()
  const { settings, setSettings } = useApp()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [portal, setPortal] = useState(null)
  const btn = useRef(null)
  const down = useRef(null)

  useEffect(() => {
    document.body.classList.add('welcome-page')
    return () => document.body.classList.remove('welcome-page')
  }, [])

  useEffect(() => {
    if (paused || portal || reduced()) return
    const t = setInterval(() => setI((v) => (v + 1) % N), 3400)
    return () => clearInterval(t)
  }, [paused, portal])

  const go = () => {
    if (portal) return
    setSettings({ ...settings, onboarded: true })
    if (reduced()) return nav('/home')
    const r = btn.current.getBoundingClientRect()
    setPortal({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }
  const finish = (e) => {
    if (e.target !== e.currentTarget) return
    document.body.classList.add('portal-in')
    setTimeout(() => document.body.classList.remove('portal-in'), 1500)
    nav('/home')
  }

  const next = () => setI((v) => (v + 1) % N)
  const prev = () => setI((v) => (v + N - 1) % N)
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
    e.currentTarget.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
  }

  return (
    <>
      <div className={'pt' + (portal ? ' zoom' : '')}>
        <section className="pt-text">
          <p className="eyebrow pt-in" style={{ '--d': '0s' }}>Welcome to MyJournal</p>
          <h1 className="pt-h pt-in" style={{ '--d': '.12s' }}>Your Story, Your Space</h1>
          <p className="lead pt-in" style={{ '--d': '.26s' }}>A peaceful place to write, reflect and grow — one day at a time.</p>
          <div className="gs-wrap pt-in" style={{ '--d': '.42s' }}>
            <button ref={btn} className="gs" onClick={go}>Get Started <ArrowRight size={18} /></button>
            <span className="gs-ring" aria-hidden="true" />
          </div>
        </section>

        <div className="pt-right pt-in" style={{ '--d': '.3s' }}>
          <div
            className="pt-stage" tabIndex={0} aria-label="Feature carousel"
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onPointerMove={move}
            onPointerDown={(e) => { down.current = e.clientX }}
            onPointerUp={(e) => { if (down.current == null) return; const dx = e.clientX - down.current; down.current = null; if (Math.abs(dx) > 40) (dx < 0 ? next : prev)() }}
            onKeyDown={(e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev() }}
          >
            <div className="pt-portal" aria-hidden="true"><i className="pt-disc" /><i className="pt-ring" /><i className="pt-ring two" /></div>
            <div className="pt-cards">
              {S.map(([n, t, d, img], k) => {
                let o = (((k - i) % N) + N) % N
                if (o > 2) o -= N
                const th = (o * 72 * Math.PI) / 180
                return (
                  <article key={t} className={'pc' + (o === 0 ? ' cur' : '')}
                    style={{ '--x': Math.sin(th).toFixed(3), '--z': (Math.cos(th) - 1).toFixed(3), '--sc': (0.62 + 0.38 * Math.cos(th)).toFixed(3), '--op': o === 0 ? 1 : Math.abs(o) === 1 ? 0.6 : 0.28, '--zi': 10 - Math.abs(o) * 3, '--i': k }}
                    onClick={() => setI(k)} aria-hidden={o !== 0}>
                    <div className="pc-in"><small>{n}</small><h3>{t}</h3><p>{d}</p><div className="cf-art"><Art k={img} /></div></div>
                  </article>
                )
              })}
            </div>
          </div>
          <div className="pt-dots">
            {S.map((_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={'Show card ' + (k + 1)} onClick={() => setI(k)} />)}
          </div>
        </div>
      </div>

      {portal && createPortal(
        <div className="pt-go" style={{ '--x': portal.x + 'px', '--y': portal.y + 'px' }} onAnimationEnd={finish}><i /></div>,
        document.body
      )}
    </>
  )
}