import { useEffect, useRef } from 'react'

// left %, delay s, duration s, size px
const MOTES = [[14, 0, 34, 10], [32, -12, 40, 8], [52, -6, 36, 12], [70, -20, 44, 9], [88, -9, 38, 11]]

export default function ForestCanopy() {
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
    <div ref={ref} className="fc" aria-hidden="true">
      <div className="fc-rays" />
      <div className="fc-strip"><img src="/images/jr-strip.jpg" alt="" /></div>
      <div className="fc-c fc-tl"><div className="fc-in"><img src="/images/jr-tl.jpg" alt="" /><i className="fc-glow g3" /></div></div>
      <div className="fc-c fc-tr"><div className="fc-in"><img src="/images/jr-tr.jpg" alt="" /><i className="fc-glow g4" /></div></div>
      {MOTES.map(([l, d, du, s], i) => <i key={i} className="fc-mote" style={{ left: l + '%', width: s, height: s, '--d': d + 's', '--du': du + 's' }} />)}
    </div>
  )
}