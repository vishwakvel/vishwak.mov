import { useRef } from 'react'
import FilmGrain from './FilmGrain'
import { useBootSequence } from './useBootSequence'
import './Landing.css'

const GITHUB = 'https://github.com/vishwakvel'
const LINKEDIN = 'https://linkedin.com/in/vishwakv'

// IMAX is 15/70 — 15 perforations per frame edge.
const PERFS_PER_FRAME = 15
const SPROCKET_RUN = PERFS_PER_FRAME * 2

export default function Landing() {
  const root = useRef<HTMLDivElement>(null)
  useBootSequence(root)

  return (
    <main className="reel" ref={root}>
      <div className="flash" aria-hidden="true" />

      {/* filmstrip furniture, in the surround so the mask never clips it */}
      <div className="strip" aria-hidden="true">
        <div className="strip__base" />
        <div className="strip__adjacent strip__adjacent--prev" />
        <div className="strip__adjacent strip__adjacent--next" />
        <div className="strip__frameline strip__frameline--l" />
        <div className="strip__frameline strip__frameline--r" />

        <div className="sprockets sprockets--top">
          <div className="sprockets__run" data-run>
            {Array.from({ length: SPROCKET_RUN }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>
        <div className="sprockets sprockets--bottom">
          <div className="sprockets__run" data-run>
            {Array.from({ length: SPROCKET_RUN }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>

        <span className="strip__stamp" data-edgenum>
          VV 70 · 2026 · 0000+00 · KODAK 2383
        </span>
      </div>

      <div className="gate">
        <div className="lamp" aria-hidden="true" />
        <FilmGrain className="grain" />
        <div className="flicker" aria-hidden="true" />

        <div className="gate-inner">
          <div className="framemark framemark--tr" aria-hidden="true" />
          <div className="framemark framemark--br" aria-hidden="true" />

          <div className="titlecard" data-titlecard>
            <h1>
              <span>Vishwak</span>
              <span>Velamuri</span>
            </h1>
            <div className="titlecard__rule" />
          </div>

          <nav className="leader" aria-label="Elsewhere">
            <a href={GITHUB} target="_blank" rel="noreferrer">
              GITHUB<i aria-hidden="true">↗</i>
            </a>
            <span className="leader__sep" aria-hidden="true">/</span>
            <a href={LINKEDIN} target="_blank" rel="noreferrer">
              LINKEDIN<i aria-hidden="true">↗</i>
            </a>
          </nav>
        </div>
      </div>

      <p className="aspect-label" data-aspect>
        <span>IMAX</span> 15/70 — 1.43:1
      </p>

      <div className="hud">
        <span className="hud__head" data-head>
          ● PICTURE START
        </span>
        <span className="hud__counter" data-counter>
          0000
        </span>
      </div>

      <noscript>
        <p className="noscript">Vishwak Velamuri</p>
      </noscript>
    </main>
  )
}
