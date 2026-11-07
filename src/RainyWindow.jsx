import { useEffect, useRef } from 'react'

// fixed values (no randomness), so the rain looks the same on every render
const RAIN = Array.from({ length: 44 }, (_, i) => ({ l: (i * 37) % 100, d: -((i * 13) % 17), du: 2.6 + ((i * 7) % 9) / 5, h: 26 + ((i * 11) % 34), o: 0.25 + ((i * 5) % 5) / 14 }))
const DROPS = [[12, 14, 0, 14], [34, 8, -5, 17], [58, 22, -9, 15], [76, 10, -3, 19], [90, 30, -12, 16], [22, 40, -7, 18]]

export default function RainyWindow() {
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
    <div ref={ref} className="rw" aria-hidden="true">
      <div className="rw-base" />
      <i className="rw-beam b1" /><i className="rw-beam b2" />
      <i className="rw-lt l1" /><i className="rw-lt l2" /><i className="rw-lt l3" />

      <div className="rw-obj rw-top"><img src="/images/rw-top.jpg" alt="" /></div>
      <div className="rw-obj rw-left">
        <div className="rw-in">
          <img src="/images/rw-left.jpg" alt="" />
          <img className="rw-sw" src="/images/rw-left.jpg" alt="" />
          <i className="rw-glow" />
        </div>
      </div>
      <div className="rw-obj rw-bottom"><img src="/images/rw-bottom.jpg" alt="" /></div>
      <img className="rw-mbot" src="/images/rw-mbot.jpg" alt="" />

      <div className="rw-rain">
        {RAIN.map((r, i) => <i key={i} className="rn" style={{ left: r.l + '%', height: r.h, opacity: r.o, '--d': r.d + 's', '--du': r.du + 's' }} />)}
        {DROPS.map(([l, t, d, du], i) => <i key={'d' + i} className="dr" style={{ left: l + '%', top: t + '%', '--d': d + 's', '--du': du + 's' }} />)}
      </div>
      <div className="rw-haze" />
    </div>
  )
}