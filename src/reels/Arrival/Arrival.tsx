import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import glyph from './assets/glyph.webp'
import './Arrival.css'

type Card = { key: string; rot: number; flip: number; gloss: string; text: string }

/** Three circles the heptapods draw; choose one and it's written up on the board. */
const CARDS: Card[] = [
  {
    key: '01',
    rot: -104,
    flip: 1,
    gloss: 'HUMAN',
    text: `Hey, I'm Vishwak! I'm from Raleigh, North Carolina, and I'm now at the University of Maryland, getting my dual degree in Computer Science and Mathematics with a minor in Computational Finance, and I'm part of the ACES (Advanced Cybersecurity Experience for Students) honors program.`,
  },
  {
    key: '02',
    rot: 27,
    flip: -1,
    gloss: 'LEARN',
    text: `I'm drawn to computational modeling and machine learning, especially the process of taking large, messy, complex datasets and finding the structure hiding inside them. I work across the stack, from the math itself to the models built on top of it, boosting, Bayesian methods, survival analysis, neural nets, and most recently reinforcement learning, which has become my newest focus.`,
  },
  {
    key: '03',
    rot: 141,
    flip: 1,
    gloss: 'GAME',
    text: `I'm also deep into game theory and how it plays out in markets: options pricing, sell-side quant, market making, volatility modeling. I like it because the math only works if you're accounting for the fact that the market is other people reacting to your own moves in real time.`,
  },
]

/** An abstract standing form — a central mass with splayed tapering limbs,
 *  a shape suggested in the fog rather than drawn. */
function Heptapod({ className }: { className: string }) {
  const bx = 100
  const by = 118
  const legs = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6 - 0.5
    const a = t * Math.PI * 0.66
    const len = 205 - Math.abs(t) * 46
    const w = 22 - Math.abs(t) * 7
    const dx = Math.sin(a)
    const dy = Math.cos(a)
    const nx = dy
    const ny = -dx
    const mx = bx + dx * len * 0.55
    const my = by + dy * len * 0.55
    const tx = bx + dx * len
    const ty = by + dy * len
    return (
      `M ${bx + nx * w} ${by + ny * w}` +
      ` Q ${mx + nx * w * 0.5} ${my + ny * w * 0.5} ${tx} ${ty}` +
      ` Q ${mx - nx * w * 0.5} ${my - ny * w * 0.5} ${bx - nx * w} ${by - ny * w} Z`
    )
  })
  return (
    <svg className={className} viewBox="0 0 200 320" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g fill="#0a1310">
        {legs.map((d, i) => (
          <path key={i} d={d} />
        ))}
        <path d="M100 6 C134 6 150 40 146 82 C143 116 124 138 100 140 C76 138 57 116 54 82 C50 40 66 6 100 6 Z" />
      </g>
    </svg>
  )
}

export default function Arrival() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = root.current
    if (!el) return
    const parallax = el.querySelectorAll<HTMLElement>('[data-drift]')
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      parallax.forEach((n, i) => {
        const k = i === 0 ? 8 : 4
        gsap.to(n, { x: x * -k, y: y * -k * 0.6, duration: 1.8, ease: 'power2.out' })
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="arrival" data-reel-content="arrival" ref={root}>
      <div className="arrival__fog" aria-hidden="true" data-drift />
      <Heptapod className="hep hep--1" />
      <Heptapod className="hep hep--2" />
      <div className="arrival__grade" aria-hidden="true" />

      <span className="arrival__tag">Transmission 001</span>

      <div className="glyphs" role="tablist" aria-label="Glyphs">
        {CARDS.map((c, i) => (
          <button
            key={c.key}
            role="tab"
            id={`glyph-${c.key}`}
            aria-selected={active === i}
            aria-controls={`board-${c.key}`}
            className={`glyph${active === i ? ' is-active' : ''}`}
            aria-label={`Glyph ${c.key} — ${c.gloss}`}
            style={
              { '--rot': `${c.rot}deg`, '--flip': c.flip, '--glyph': `url(${glyph})` } as CSSProperties
            }
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <span className="glyph__ink" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="boards">
        {CARDS.map((c, i) => (
          <article
            key={c.key}
            id={`board-${c.key}`}
            role="tabpanel"
            aria-labelledby={`glyph-${c.key}`}
            aria-hidden={active !== i}
            className={`board${active === i ? ' is-shown' : ''}`}
          >
            <p className="board__gloss">{c.gloss}</p>
            <p className="board__text">{c.text}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
