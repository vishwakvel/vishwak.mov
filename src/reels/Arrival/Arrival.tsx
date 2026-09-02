import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import glyph from './assets/glyph.webp'
import './Arrival.css'

type Card = { key: string; rot: number; flip: number; gloss: string; text: string }

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

/** A shape suggested in the fog — a raised limb and a spread of tapering legs. */
function Heptapod({ className }: { className: string }) {
  const bx = 100
  const by = 74
  const legs = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5 - 0.5
    const a = t * Math.PI * 0.52
    const len = 246 - Math.abs(t) * 34
    const w = 15 - Math.abs(t) * 4
    const dx = Math.sin(a)
    const dy = Math.cos(a)
    const nx = dy
    const ny = -dx
    const cx = bx + dx * len * 0.42 + t * 12
    const cy = by + dy * len * 0.5
    const tx = bx + dx * len + t * 26
    const ty = by + dy * len
    return (
      `M ${bx + nx * w} ${by + ny * w}` +
      ` Q ${cx + nx * w * 0.4} ${cy + ny * w * 0.4} ${tx} ${ty}` +
      ` Q ${cx - nx * w * 0.4} ${cy - ny * w * 0.4} ${bx - nx * w} ${by - ny * w} Z`
    )
  })
  return (
    <svg className={className} viewBox="0 0 200 340" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g fill="currentColor">
        {legs.map((d, i) => (
          <path key={i} d={d} />
        ))}
        <path d="M92 78 Q 66 32 96 2 Q 124 30 110 78 Z" />
        <ellipse cx="100" cy="58" rx="31" ry="26" />
      </g>
    </svg>
  )
}

export default function Arrival() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const card = CARDS[active]

  const step = useCallback((d: number) => {
    setActive((n) => (n + d + CARDS.length) % CARDS.length)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = root.current
    if (!el) return
    const drift = el.querySelectorAll<HTMLElement>('[data-drift]')
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      drift.forEach((n, i) => {
        const k = i === 0 ? 10 : 5
        gsap.to(n, { x: x * -k, y: y * -k * 0.55, duration: 1.8, ease: 'power2.out' })
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

      <div
        className="stage"
        role="group"
        aria-roledescription="carousel"
        aria-label="About"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') step(-1)
          if (e.key === 'ArrowRight') step(1)
        }}
      >
        <div
          className="stage__glyph"
          key={card.key}
          style={{ '--rot': `${card.rot}deg`, '--flip': card.flip, '--glyph': `url(${glyph})` } as CSSProperties}
          aria-hidden="true"
        >
          <span className="stage__ink" />
        </div>

        <article className="board" aria-live="polite">
          <p className="board__gloss">{card.gloss}</p>
          <p className="board__text">{card.text}</p>
        </article>

        <div className="nav">
          <button className="nav__arrow" onClick={() => step(-1)} aria-label="Previous">
            ‹
          </button>
          <div className="nav__dots">
            {CARDS.map((c, i) => (
              <button
                key={c.key}
                className={`nav__dot${active === i ? ' is-on' : ''}`}
                aria-label={`Card ${i + 1} of ${CARDS.length}`}
                aria-current={active === i}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <button className="nav__arrow" onClick={() => step(1)} aria-label="Next">
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
