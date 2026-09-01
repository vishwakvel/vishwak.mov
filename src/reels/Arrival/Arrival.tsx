import { useEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import mist from './assets/mist.webp'
import glyph from './assets/glyph.webp'
import './Arrival.css'

/** The about-me, delivered the way the heptapods talk — one symbol at a time.
 *  Each card is a logogram; attend to one and it translates. */
const CARDS = [
  {
    num: 'i',
    rot: -104,
    flip: 1,
    text: `Hey, I'm Vishwak — from Raleigh, North Carolina, now at the University of Maryland for a dual degree in Computer Science and Mathematics, a minor in Computational Finance, and the ACES cybersecurity honors program.`,
  },
  {
    num: 'ii',
    rot: 27,
    flip: -1,
    text: `I'm drawn to computational modeling and machine learning: taking large, messy datasets and finding the structure hiding inside them. I work across the stack, from the math to the models on top of it — boosting, Bayesian methods, survival analysis, neural nets, and lately reinforcement learning, my newest focus.`,
  },
  {
    num: 'iii',
    rot: 141,
    flip: 1,
    text: `I'm also deep in game theory and how it plays out in markets — options pricing, sell-side quant, market making, volatility modeling. The math only works if you're accounting for the market being other people reacting to your own moves in real time.`,
  },
]

export default function Arrival() {
  const root = useRef<HTMLDivElement>(null)

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
        <span className="arrival__hint">hover to translate</span>
      </div>

      <ul className="cards">
        {CARDS.map((c) => (
          <li
            key={c.num}
            className="card"
            tabIndex={0}
            style={{ '--rot': `${c.rot}deg`, '--flip': c.flip } as CSSProperties}
          >
            <img className="card__glyph" src={glyph} alt="" aria-hidden="true" />
            <span className="card__num">{c.num}</span>
            <p className="card__text">{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
