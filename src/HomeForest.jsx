import { useEffect, useRef } from 'react'

// left %, top %, size px, drift x, drift y, drift seconds, blink seconds, delay
const FLIES = [
  [30, 22, 7, 40, -50, 17, 4.2, 0], [42, 38, 6, -36, -40, 21, 5.1, -3], [54, 28, 8, 30, -60, 19, 3.8, -7],
  [66, 46, 6, -44, -36, 23, 4.6, -5], [76, 30, 7, 38, -48, 18, 5.4, -9], [48, 58, 5, 28, -42, 22, 3.9, -2],
  [36, 52, 6, -30, -52, 20, 4.8, -11], [84, 54, 7, 34, -44, 24, 4.1, -6], [58, 66, 5, -26, -38, 19, 5.2, -13],
  [24, 44, 6, 32, -46, 21, 4.4, -8], [70, 18, 5, -34, -40, 25, 3.7, -4], [90, 40, 6, 28, -50, 18, 4.9, -10],
]

export default function HomeForest() {
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
    <div ref={ref} className="hbg" aria-hidden="true">
      <div className="hb-art hb-d">
        <img src="/images/hm-forest.jpg" alt="" />
        <img className="hb-sw" src="/images/hm-forest.jpg" alt="" />
        <i className="hb-glow" />
      </div>
      <div className="hb-art hb-mo">
        <img src="/images/hm-forest-m.jpg" alt="" />
        <img className="hb-sw" src="/images/hm-forest-m.jpg" alt="" />
        <i className="hb-glow" />
      </div>
      <div className="hb-rays" />
      <div className="hb-shade" />
      {FLIES.map(([l, t, s, dx, dy, du, bl, d], i) => (
        <i key={i} className="ff" style={{ left: l + '%', top: t + '%', width: s, height: s, '--dx': dx + 'px', '--dy': dy + 'px', '--du': du + 's', '--bl': bl + 's', '--d': d + 's' }} />
      ))}
    </div>
  )
}