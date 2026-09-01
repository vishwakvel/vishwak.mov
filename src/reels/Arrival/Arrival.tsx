import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import mist from './assets/mist.webp'
import glyph from './assets/glyph.webp'
import './Arrival.css'

type Card = {
  key: string
  rot: number
  flip: number
  gloss: string
  related: string[]
  match: string
  text: string
}

/** Three glyphs; select one and the analysis resolves it — a gloss, the
 *  candidate meanings, and the translation. */
const CARDS: Card[] = [
  {
    key: '01',
    rot: -104,
    flip: 1,
    gloss: 'HUMAN',
    match: '0.94',
    related: ['origin', 'self', 'place', 'learning', 'home', 'begin'],
    text: `Hey, I'm Vishwak — from Raleigh, North Carolina, now at the University of Maryland for a dual degree in Computer Science and Mathematics, a minor in Computational Finance, and the ACES cybersecurity honors program.`,
  },
  {
    key: '02',
    rot: 27,
    flip: -1,
    gloss: 'PATTERN',
    match: '0.88',
    related: ['structure', 'signal', 'order', 'model', 'meaning', 'noise'],
    text: `I'm drawn to computational modeling and machine learning: taking large, messy datasets and finding the structure hiding inside them. I work across the stack, from the math to the models on top of it — boosting, Bayesian methods, survival analysis, neural nets, and lately reinforcement learning, my newest focus.`,
  },
  {
    key: '03',
    rot: 141,
    flip: 1,
    gloss: 'GAME',
    match: '0.90',
    related: ['exchange', 'move', 'reaction', 'price', 'time', 'others'],
    text: `I'm also deep in game theory and how it plays out in markets — options pricing, sell-side quant, market making, volatility modeling. The math only works if you're accounting for the market being other people reacting to your own moves in real time.`,
  },
]

export default function Arrival() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = root.current
    if (!el) return
    const bg = el.querySelector<HTMLElement>('.arrival__bg')
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      gsap.to(bg, { xPercent: x * -3, yPercent: y * -2, duration: 1.8, ease: 'power2.out' })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="arrival" data-reel-content="arrival" ref={root}>
      <div className="arrival__bg" aria-hidden="true" style={{ backgroundImage: `url(${mist})` }} />
      <div className="arrival__shell" aria-hidden="true" />
      <div className="arrival__grade" aria-hidden="true" />

      <div className="arrival__eyebrow">
        <span>Transmission 001 — About</span>
        <span className="arrival__hint">select a glyph to translate</span>
      </div>

      <div className="glyphs" role="tablist" aria-label="Glyphs">
        {CARDS.map((c, i) => (
          <button
            key={c.key}
            role="tab"
            id={`glyph-${c.key}`}
            aria-selected={active === i}
            aria-controls={`panel-${c.key}`}
            className={`glyph${active === i ? ' is-active' : ''}`}
            aria-label={`Glyph ${c.key} — ${c.gloss}`}
            style={
              {
                '--rot': `${c.rot}deg`,
                '--flip': c.flip,
                '--glyph': `url(${glyph})`,
              } as CSSProperties
            }
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <span className="glyph__ink" aria-hidden="true" />
            <span className="glyph__tag">{c.key}</span>
          </button>
        ))}
      </div>

      <div className="analysis">
        {CARDS.map((c, i) => (
          <article
            key={c.key}
            id={`panel-${c.key}`}
            role="tabpanel"
            aria-labelledby={`glyph-${c.key}`}
            aria-hidden={active !== i}
            className={`panel${active === i ? ' is-shown' : ''}`}
          >
            <header className="panel__head">
              <span>Analysis · Glyph {c.key}</span>
              <span>Match {c.match}</span>
            </header>
            <p className="panel__gloss">{c.gloss}</p>
            <ul className="panel__related">
              {c.related.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="panel__text">{c.text}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
