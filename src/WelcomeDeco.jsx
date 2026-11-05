const P = 'M0 0C10-18 34-20 48 0C34 18 10 18 0 0Z'

const LV = [
  [30, 40, 40, 1, '#6f9a73'], [48, 78, -10, 1.1, '#4f7d5c'], [62, 110, 60, 0.9, '#a9c9a8'],
  [88, 142, 10, 1.1, '#6f9a73'], [110, 175, 70, 1, '#4f7d5c'], [135, 205, 20, 0.9, '#a9c9a8'],
  [40, 60, -50, 0.9, '#a9c9a8'], [78, 120, -40, 1, '#6f9a73'], [120, 190, -35, 1, '#4f7d5c'], [150, 225, 40, 0.8, '#6f9a73'],
]

function Branch({ cls, flip }) {
  return (
    <svg className={'br ' + cls} viewBox="0 0 260 300">
      <g transform={flip ? 'translate(260 300) scale(-1 -1)' : undefined}>
        <path d="M0 0C50 70 80 140 160 230" stroke="#5f8f66" strokeWidth="3" fill="none" />
        {LV.map(([x, y, r, s, c], i) => <path key={i} d={P} fill={c} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} />)}
      </g>
    </svg>
  )
}

// [left %, size px, delay s, duration s]
const FL = [[8, 22, -3, 24], [24, 28, -11, 30], [46, 20, -7, 26], [66, 26, -16, 32], [82, 18, -5, 22], [93, 24, -13, 28]]
// [left %, top %]
const SP = [[12, 30], [30, 70], [55, 18], [72, 55], [88, 40], [40, 85], [8, 60], [95, 80]]

export default function Deco() {
  return (
    <div className="deco-wrap" aria-hidden="true">
      <Branch cls="br-tl" />
      <Branch cls="br-br" flip />
      {FL.map(([l, s, d, du], i) => (
        <svg key={'f' + i} className="fl" viewBox="-2 -22 52 44" style={{ left: l + '%', width: s, '--d': d + 's', '--du': du + 's' }}><path d={P} fill="#7fa683" /></svg>
      ))}
      {SP.map(([l, t], i) => <i key={'s' + i} className="sp" style={{ left: l + '%', top: t + '%', '--d': i * 0.7 + 's' }} />)}
    </div>
  )
}