import { useEffect, useRef } from 'react'

// left %, delay s, duration s, size px
const PETALS = [[10, 0, 28, 18], [28, -9, 34, 13], [46, -4, 30, 16], [64, -15, 38, 12], [80, -7, 32, 15], [92, -19, 36, 13]]

export default function CalendarGarden() {
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
    <div ref={ref} className="cg" aria-hidden="true">
      <div className="cg-light" />
      <i className="cg-shd d1" /><i className="cg-shd d2" /><i className="cg-shd d3" />

      <div className="cg-box cg-l">
        <div className="cg-art">
          <img src="/images/cal-left.jpg" alt="" />
          <img className="cg-sw" src="/images/cal-left.jpg" alt="" />
          <i className="cg-glow gl1" />
        </div>
      </div>
      <div className="cg-box cg-r">
        <div className="cg-art">
          <img src="/images/cal-right.jpg" alt="" />
          <img className="cg-sw" src="/images/cal-right.jpg" alt="" />
          <i className="cg-glow gl2" />
        </div>
      </div>

      <img className="cg-mob" src="/images/cal-mobile.jpg" alt="" />
      <img className="cg-mob cg-sw" src="/images/cal-mobile.jpg" alt="" />

      {PETALS.map(([l, d, du, s], i) => <i key={i} className="cg-pet" style={{ left: l + '%', width: s, height: s * 0.7, '--d': d + 's', '--du': du + 's' }} />)}
    </div>
  )
}