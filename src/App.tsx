import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './scroll/useSmoothScroll'
import Landing from './reels/Landing/Landing'
import Arrival from './reels/Arrival/Arrival'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// scroll budget per phase, in viewport heights
const BOOT = 1 // reel 01 held
const CROSS = 1 // reel 01 -> 02 transition
const ARRIVAL = 4 // reel 02 movements
const TOTAL = BOOT + CROSS + ARRIVAL + 1

export default function App() {
  useSmoothScroll()

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const vh = () => window.innerHeight

      // reel 01 -> reel 02: push through the IMAX screen into the fog
      const cross = gsap.timeline({
        scrollTrigger: {
          start: () => vh() * BOOT,
          end: () => vh() * (BOOT + CROSS),
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      cross
        .fromTo(
          '.reel',
          { scale: 1, filter: 'blur(0px) brightness(1)' },
          { scale: 1.32, filter: 'blur(10px) brightness(0.55)', ease: 'power1.in' },
          0,
        )
        .to('.reel .gate-inner, .reel .strip, .reel .hud, .reel .aspect-label', { autoAlpha: 0, ease: 'power1.in' }, 0)
        .to('.reel', { autoAlpha: 0, ease: 'power2.in' }, 0.58)
        .fromTo('.worldshift__tint', { opacity: 0 }, { opacity: 0.9, ease: 'power1.in' }, 0.14)
        .fromTo('.worldshift__fog', { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, ease: 'power1.out' }, 0.1)
        .to('.worldshift__fog', { opacity: 0.5, ease: 'power1.in' }, 0.82)
        .fromTo('.arrival', { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, ease: 'power1.out' }, 0.42)

      return () => {
        cross.scrollTrigger?.kill()
        cross.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <>
      <div className="scroll-track" style={{ height: `${TOTAL * 100}svh` }} aria-hidden="true" />

      <div className="viewport-stage">
        <Landing />
        <div className="worldshift" aria-hidden="true">
          <div className="worldshift__tint" />
          <div className="worldshift__fog" />
        </div>
        <Arrival />
      </div>
    </>
  )
}
