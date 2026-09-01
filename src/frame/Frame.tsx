import { useRef, type ReactNode } from 'react'
import FilmGrain from './FilmGrain'
import Dust from './Dust'
import { useBootSequence } from './useBootSequence'
import './Frame.css'

// IMAX is 15/70 — 15 perforations per frame edge.
const SPROCKET_RUN = 15 * 2

/**
 * The persistent 70mm frame. The booth, filmstrip and gate never change —
 * only the picture inside .gate-screen, swapped reel to reel by scroll.
 */
export default function Frame({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useBootSequence(root)

  return (
    <div className="reel" ref={root}>
      <div className="flash" aria-hidden="true" />
      <div className="beam" aria-hidden="true" />
      <Dust className="dust" />

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
        <div className="gate-flash" aria-hidden="true" />

        <div className="gate-screen" data-screen>
          <div className="framemark framemark--tr" aria-hidden="true" />
          <div className="framemark framemark--br" aria-hidden="true" />
          {children}
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
    </div>
  )
}
