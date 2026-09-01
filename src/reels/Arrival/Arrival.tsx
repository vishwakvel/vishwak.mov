import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import glyph from './assets/glyph.webp'
import './Arrival.css'

/** Reel 02 — Arrival. One screen, projected into the frame: the language lit
 *  against the gloom, and the about-me in three short movements. */
export default function Arrival() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = root.current
    if (!el) return
    const g = el.querySelector<HTMLElement>('.arrival__glyph')
    if (!g) return

    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 16
      const dy = (e.clientY / window.innerHeight - 0.5) * 16
      gsap.to(g, { x: dx, y: dy, duration: 1.4, ease: 'power2.out' })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="arrival" data-reel-content="arrival" ref={root}>
      <div className="arrival__sky" aria-hidden="true" />
      <div className="arrival__shell" aria-hidden="true" />
      <div className="arrival__silhouettes" aria-hidden="true">
        <span className="hep hep--1" />
        <span className="hep hep--2" />
      </div>
      <div className="arrival__fog arrival__fog--a" aria-hidden="true" />
      <div className="arrival__fog arrival__fog--b" aria-hidden="true" />

      <img className="arrival__glyph" src={glyph} alt="" aria-hidden="true" />

      <p className="arrival__eyebrow">Transmission 001 — About</p>

      <div className="arrival__content">
        <p>
          Hey, I'm Vishwak &mdash; from Raleigh, North Carolina, now at the
          University of Maryland for a dual degree in Computer Science and
          Mathematics, a minor in Computational Finance, and the ACES
          cybersecurity honors program.
        </p>
        <p>
          I'm drawn to computational modeling and machine learning: taking large,
          messy datasets and finding the structure hiding inside them. I work
          across the stack, from the math to the models on top of it &mdash;
          boosting, Bayesian methods, survival analysis, neural nets, and lately
          reinforcement learning, my newest focus.
        </p>
        <p>
          I'm also deep in game theory and how it plays out in markets &mdash;
          options pricing, sell-side quant, market making, volatility modeling.
          The math only works if you're accounting for the market being other
          people reacting to your own moves in real time.
        </p>
      </div>
    </div>
  )
}
