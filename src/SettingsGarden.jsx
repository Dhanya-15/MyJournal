import { useEffect, useRef } from 'react'
import { Database, FolderTree, Info, PenLine, ShieldCheck, UserRound } from 'lucide-react'

// one curved eucalyptus stem, with round leaves placed along it
const C = [[10, 250], [70, 190], [130, 120], [270, 30]]
const pt = (t) => { const u = 1 - t; return [0, 1].map((i) => u * u * u * C[0][i] + 3 * u * u * t * C[1][i] + 3 * u * t * t * C[2][i] + t * t * t * C[3][i]) }
const tg = (t) => { const u = 1 - t; const d = [0, 1].map((i) => 3 * u * u * (C[1][i] - C[0][i]) + 6 * u * t * (C[2][i] - C[1][i]) + 3 * t * t * (C[3][i] - C[2][i])); return (Math.atan2(d[1], d[0]) * 180) / Math.PI }
const TONES = ['#a7c2a5', '#8fb391', '#b9cfb6', '#7fa683', '#c5d8c2']
const LEAVES = [
  ...Array.from({ length: 10 }, (_, k) => {
    const t = 0.1 + k * 0.09, [x, y] = pt(t), a = tg(t), s = 1.25 - k * 0.07
    return [[x, y, a + 18, s, TONES[(k * 2) % 5]], [x, y, a + 162, s * 0.92, TONES[(k * 2 + 1) % 5]]]
  }).flat(),
  [270, 30, tg(1) + 90, 0.7, TONES[0]],
]

function Branch({ cls }) {
  return (
    <div className={'br ' + cls}>
      <svg viewBox="0 0 300 260">
        <path d="M10 250C70 190 130 120 270 30" stroke="#6f8f6e" strokeWidth="3" fill="none" strokeLinecap="round" />
        {LEAVES.map(([x, y, r, s, c], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
            <ellipse cx="0" cy="-14" rx="10" ry="13" fill={c} stroke="#6f9a73" strokeOpacity=".4" strokeWidth=".8" />
            <path d="M0 0V-24" stroke="#fff" strokeOpacity=".4" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  )
}

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
        <Branch cls="b-l" /><Branch cls="b-r" /><Branch cls="b-b" />
      </div>
      <div className="sg-near">
        {ICONS.map(([I, c]) => <span key={c} className={'fi ' + c}><I size={20} /></span>)}
      </div>
    </div>
  )
}