import { useRef } from 'react'
import FilmGrain from './FilmGrain'
import { useBootSequence } from './useBootSequence'
import './Landing.css'

// TODO(vishwak): confirm these — GitHub is from the repo owner, LinkedIn is a placeholder.
const GITHUB = 'https://github.com/vishwakvel'
const LINKEDIN = '#'

const PERF_COUNT = 20

export default function Landing() {
  const root = useRef<HTMLDivElement>(null)
  useBootSequence(root)

  return (
    <main className="reel" ref={root}>
      <div className="flash" aria-hidden="true" />

      <div className="gate">
        <div className="lamp" aria-hidden="true" />
        <FilmGrain className="grain" />
        <div className="flicker" aria-hidden="true" />

        <div className="gate-inner">
          <div className="framemark framemark--tr" aria-hidden="true" />
          <div className="framemark framemark--br" aria-hidden="true" />

          <div className="edgecode" aria-hidden="true">
            <div className="perfs">
              {Array.from({ length: PERF_COUNT }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
            <span className="edgenum" data-edgenum>
              VV 70 2026 0000+00
            </span>
          </div>

          <div className="titlecard" data-titlecard>
            <h1>
              <span>Vishwak</span>
              <span>Velamuri</span>
            </h1>
            <div className="titlecard__rule" />
            <p className="titlecard__role">
              CS + Mathematics
              <span className="dot">·</span>
              Computational Finance
              <span className="dot">·</span>
              University of Maryland
            </p>
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
        <p className="noscript">Vishwak Velamuri — CS + Mathematics, University of Maryland.</p>
      </noscript>
    </main>
  )
}
