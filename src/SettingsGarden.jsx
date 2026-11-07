import { useEffect, useRef } from 'react'
import { Database, FolderTree, Info, PenLine, ShieldCheck, UserRound } from 'lucide-react'

const ICONS = [[UserRound, 'f1'], [PenLine, 'f2'], [ShieldCheck, 'f3'], [Database, 'f4'], [FolderTree, 'f5'], [Info, 'f6']]

export default function SettingsGarden() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return
    let raf
    const mv = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', ((e.clientX / innerWidth - 0.5) * 2).toFixed(3))
        el.style.setProperty('--py', ((e.clientY / innerHeight - 0.5) * 2).toFixed(3))
      })
    }
    addEventListener('pointermove', mv)
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div ref={ref} className="sg" aria-hidden="true">
      <div className="sg-far">
        <div className="sun" />
        {['s1', 's2', 's3', 's4', 's5'].map((c) => <i key={c} className={'shd ' + c} />)}
      </div>
      <div className="sg-mid">
        <img className="gi g-vine" src="/images/gar-vine.jpg" alt="" />
        <img className="gi g-top" src="/images/gar-top.jpg" alt="" />
        <img className="gi g-bot" src="/images/gar-bottom.jpg" alt="" />
      </div>
      <div className="sg-near">
        {ICONS.map(([I, c]) => <span key={c} className={'fi ' + c}><I size={20} /></span>)}
      </div>
    </div>
  )
}