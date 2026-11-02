import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Lock, Leaf, Heart, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

const S = [
  ['01', 'Write Freely', 'Capture your thoughts, memories and little moments.', 's1'],
  ['02', 'Track Your Mood', 'Understand your emotions and see your progress over time.', 's2'],
  ['03', 'Stay Organized', 'View your entries beautifully in a calendar and never miss a moment.', 's3'],
  ['04', 'Gain Insights', 'See patterns, celebrate growth and learn more about yourself.', 's4'],
  ['05', 'Make It Yours', 'Customize your theme, preferences and keep your space comfortable.', 's5'],
]
export default function Welcome() {
  const nav = useNavigate()
  const { settings, setSettings, setDemo } = useApp()
  const [i, setI] = useState(0)
  const go = () => { setSettings({ ...settings, onboarded: true }); nav('/home') }
  return (
    <div className="wel">
      <button className="skip" onClick={go}>Skip <ArrowRight size={16} /></button>
      <img className="welbook" src="/images/wel-book.jpg" alt="" />
      <p className="eyebrow">Welcome to MyJournal</p>
      <h1 className="big">Your Story, Your Space</h1>
      <p className="lead">A peaceful place to write, reflect and grow — one day at a time.</p>
      <div className="cards5">
        <button className="arr l" aria-label="Back" onClick={() => setI(Math.max(0, i - 1))}><ChevronLeft /></button>
        {S.map(([n, t, d, ic], k) => (
          <article key={t} className={'wc ' + (k === i ? 'cur' : '')} style={{ transform: `perspective(900px) rotateY(${(i - k) * 6}deg) translateY(${k === i ? 0 : 24 + Math.abs(i - k) * 6}px)` }} onClick={() => setI(k)}>
            <small>{n}</small><h3>{t}</h3><p>{d}</p><img className="art" src={`/images/${ic}.jpg`} alt="" /></article>))}
        <button className="arr r" aria-label="Next" onClick={() => setI(Math.min(4, i + 1))}><ChevronRight /></button>
      </div>
      <div className="row center">{S.map((_, k) => <button key={k} className={'dot ' + (k === i ? 'on' : '')} aria-label={'Slide ' + (k + 1)} onClick={() => setI(k)} />)}</div>
      <div className="wbar">
        <em className="quote">“A small step today for a calmer tomorrow.”</em>
        <div className="feat"><Lock /><div><b>Your data stays private</b><small>Stored safely in your browser. No account needed.</small></div></div>
        <div className="feat"><Leaf /><div><b>Simple and peaceful</b><small>A clean space with minimal distractions.</small></div></div>
        <div className="feat"><Heart /><div><b>Built for your wellbeing</b><small>Write, reflect and feel better every day.</small></div></div>
        <div className="col2"><button className="btn" onClick={go}>Get Started <ArrowRight size={16} /></button><button className="link" onClick={() => setDemo(true)}>Try Demo</button></div>
      </div>
    </div>
  )
}
