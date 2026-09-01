import { useRef } from 'react'
import Logogram, { type LogogramHandle } from './Logogram'
import { useArrivalScroll } from './useArrivalScroll'
import './Arrival.css'

export default function Arrival() {
  const root = useRef<HTMLElement>(null)
  const hero = useRef<LogogramHandle>(null)
  useArrivalScroll(root, hero)

  return (
    <section className="arrival" ref={root}>
      <div className="arrival__sky" aria-hidden="true" />
      <div className="arrival__shell" aria-hidden="true" />
      <div className="arrival__haze" aria-hidden="true" />
      <div className="arrival__silhouettes" aria-hidden="true">
        <span className="hep hep--1" />
        <span className="hep hep--2" />
      </div>
      <div className="arrival__fog arrival__fog--a" aria-hidden="true" />
      <div className="arrival__fog arrival__fog--b" aria-hidden="true" />

      <Logogram ref={hero} className="arrival__glyph" seed={41} blooms={14} interactive />

      <div className="arrival__hud">
        <span>REEL 02</span>
        <span className="arrival__hud-title">ARRIVAL</span>
        <span>0002</span>
      </div>

      <div className="arrival__content">
        <p className="arrival__eyebrow">Transmission 001 — About</p>

        <article className="movement" data-mv="1">
          <Logogram className="movement__mark" seed={11} blooms={3} autoDraw />
          <p>
            Hey, I'm Vishwak! I'm from Raleigh, North Carolina, and I'm now at the
            University of Maryland, getting my dual degree in Computer Science and
            Mathematics with a minor in Computational Finance, and I'm part of the
            ACES (Advanced Cybersecurity Experience for Students) honors program.
          </p>
        </article>

        <article className="movement" data-mv="2">
          <Logogram className="movement__mark" seed={23} blooms={4} autoDraw />
          <p>
            I'm drawn to computational modeling and machine learning, especially
            the process of taking large, messy, complex datasets and finding the
            structure hiding inside them. I work across the stack, from the math
            itself to the models built on top of it &mdash; boosting, Bayesian
            methods, survival analysis, neural nets, and most recently
            reinforcement learning, which has become my newest focus.
          </p>
        </article>

        <article className="movement" data-mv="3">
          <Logogram className="movement__mark" seed={37} blooms={4} autoDraw />
          <p>
            I'm also deep into game theory and how it plays out in markets:
            options pricing, sell-side quant, market making, volatility modeling.
            I like it because the math only works if you're accounting for the
            fact that the market is other people reacting to your own moves in
            real time.
          </p>
        </article>
      </div>
    </section>
  )
}
