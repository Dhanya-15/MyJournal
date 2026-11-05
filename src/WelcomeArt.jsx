const G = '#3f6b52', D = '#274a38', INK = '#2f4a3a', GOLD = '#d9b25c'

const Leaf = ({ x, y, r = 0, s = 1, c = '#7fa683' }) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M0 0C8-16 30-18 42 0C30 16 8 16 0 0Z" fill={c} />
)

function Face({ x, y, c, t }) {
  const closed = t === 'calm' || t === 'tired'
  const mouth = t === 'happy' || t === 'calm' ? 'M-8 6Q0 14 8 6' : t === 'sad' || t === 'angry' ? 'M-8 12Q0 4 8 12' : 'M-7 9H7'
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="31" fill={c} opacity=".3" />
      <circle r="23" fill={c} />
      {closed
        ? <path d="M-12-3Q-8 1-4-3M4-3Q8 1 12-3" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        : <><circle cx="-8" cy="-4" r="2.6" fill={INK} /><circle cx="8" cy="-4" r="2.6" fill={INK} /></>}
      <path d={mouth} stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {t === 'angry' && <path d="M-13-11L-4-8M13-11L4-8" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />}
    </g>
  )
}

const Shadow = () => <ellipse cx="150" cy="198" rx="100" ry="9" fill="#000" opacity=".08" />

function Journal() {
  return (
    <>
      <Shadow />
      <g transform="rotate(-10 150 110)">
        <rect x="88" y="34" width="118" height="152" rx="8" fill="#f3ecd8" />
        <rect x="82" y="28" width="118" height="152" rx="9" fill={G} />
        <rect x="82" y="28" width="12" height="152" rx="6" fill={D} />
        <g transform="translate(146 100)">
          <path d="M0 26V-6" stroke="#e6d7a8" strokeWidth="2" />
          <path d="M0 4C-14 2-18-10-16-16C-6-16 0-8 0 4Z" fill="#e6d7a8" />
          <path d="M0-2C14-4 18-16 16-22C6-22 0-14 0-2Z" fill="#e6d7a8" />
        </g>
      </g>
      <g transform="rotate(32 235 90)">
        <rect x="228" y="30" width="12" height="120" rx="6" fill={D} />
        <rect x="228" y="52" width="12" height="5" fill={GOLD} />
        <path d="M228 150H240L234 168Z" fill={GOLD} />
      </g>
      <Leaf x={52} y={182} r={-30} s={0.9} />
      <Leaf x={222} y={190} r={-160} s={0.8} c="#5f8f66" />
    </>
  )
}

function Moods() {
  const f = [[78, 70, '#9fc29a', 'happy'], [150, 52, '#f4d27a', 'calm'], [222, 74, '#c4b3e6', 'neutral'], [92, 150, '#a9c6e6', 'sad'], [156, 138, '#f2a493', 'angry'], [224, 152, '#ecdcbc', 'tired']]
  return <>{f.map(([x, y, c, t]) => <Face key={t} x={x} y={y} c={c} t={t} />)}</>
}

function Calendar() {
  const hi = ['1-2', '2-4', '3-1']
  return (
    <>
      <Shadow />
      <rect x="60" y="36" width="180" height="152" rx="12" fill="#fbf9f1" stroke="#e2dcc8" />
      <path d="M60 48a12 12 0 0 1 12-12h156a12 12 0 0 1 12 12v22H60z" fill={G} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={82 + i * 28} y="24" width="8" height="24" rx="4" fill={GOLD} />)}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
        <circle key={r + '-' + c} cx={82 + c * 22} cy={96 + r * 22} r="4.5" fill={hi.includes(r + '-' + c) ? G : '#d9d4c0'} />
      )))}
      <Leaf x={50} y={196} r={-60} s={0.9} />
    </>
  )
}

function Chart() {
  const bars = [['#cfe0cb', 45], ['#a9c9a8', 75], ['#7fa683', 100], ['#4f7d5c', 128]]
  return (
    <>
      <Shadow />
      <rect x="50" y="162" width="200" height="22" rx="8" fill="#f3f0e4" stroke="#e2dcc8" />
      {bars.map(([c, h], i) => <rect key={i} x={72 + i * 44} y={162 - h} width="28" height={h} rx="7" fill={c} />)}
      <Leaf x={236} y={180} r={-120} s={0.8} c="#5f8f66" />
      <Leaf x={40} y={186} r={-40} s={0.7} />
    </>
  )
}

function Themes() {
  return (
    <>
      <Shadow />
      <rect x="56" y="50" width="130" height="110" rx="12" fill={D} transform="rotate(-8 121 105)" />
      <rect x="84" y="64" width="130" height="110" rx="12" fill="#a9c9a8" transform="rotate(-2 149 119)" />
      <g transform="rotate(5 175 133)">
        <rect x="110" y="78" width="130" height="110" rx="12" fill="#f6f1e2" stroke="#e2dcc8" />
        <path d="M175 150V120" stroke={G} strokeWidth="2" />
        <path d="M175 138C163 136 159 126 161 120C171 120 175 128 175 138Z" fill={G} />
        <path d="M175 132C187 130 191 120 189 114C179 114 175 122 175 132Z" fill={G} />
      </g>
    </>
  )
}

const ART = { s1: Journal, s2: Moods, s3: Calendar, s4: Chart, s5: Themes }

export default function Art({ k }) {
  const C = ART[k] || Journal
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">
      <C />
    </svg>
  )
}