import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './scroll/useSmoothScroll'
import Frame from './frame/Frame'
import TitleCard from './reels/TitleCard/TitleCard'
import Arrival from './reels/Arrival/Arrival'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// scroll budget per phase, in viewport heights
const BOOT = 1 // reel 01 held
const CROSS = 1 // reel 01 -> 02 advance
const TOTAL = BOOT + CROSS + 0.6

export default function App() {
  useSmoothScroll()

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const vh = () => window.innerHeight
      gsap.set('[data-reel-content="arrival"]', { autoAlpha: 0 })
      const head = document.querySelector<HTMLElement>('[data-head]')
      const counter = document.querySelector<HTMLElement>('[data-counter]')
      const edgenum = document.querySelector<HTMLElement>('[data-edgenum]')

      // reel 01 -> reel 02: the film advances one frame through the gate
      const cross = gsap.timeline({
        scrollTrigger: {
          start: () => vh() * BOOT,
          end: () => vh() * (BOOT + CROSS),
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const past = self.progress > 0.42
            if (head) head.textContent = past ? 'REEL 02' : 'REEL 01'
            if (counter) counter.textContent = past ? '0002' : '0001'
            if (edgenum) {
              edgenum.textContent = past
                ? 'VV 70 · 2026 · 0291+07 · KODAK 2383'
                : 'VV 70 · 2026 · 0137+04 · KODAK 2383'
            }
          },
        },
      })
      cross
        .fromTo(
          '[data-reel-content="landing"]',
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)' },
          { autoAlpha: 0, scale: 1.12, filter: 'blur(6px)', ease: 'power1.in' },
          0,
        )
        .fromTo(
          '[data-run]',
          { xPercent: 0, filter: 'blur(0px)' },
          { xPercent: -34, filter: 'blur(5px)', ease: 'power2.in' },
          0,
        )
        .to('[data-run]', { xPercent: 0, filter: 'blur(0px)', ease: 'power3.out' }, 0.55)
        .fromTo('.gate-flash', { opacity: 0 }, { opacity: 0.72, ease: 'power1.in' }, 0.18)
        .to('.gate-flash', { opacity: 0, ease: 'power1.out' }, 0.5)
        .fromTo(
          '[data-reel-content="arrival"]',
          { autoAlpha: 0, scale: 1.06 },
          { autoAlpha: 1, scale: 1, ease: 'power1.out' },
          0.4,
        )

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
        <Frame>
          <TitleCard />
          <Arrival />
        </Frame>
      </div>

      <noscript>
        <p className="noscript-note">Vishwak Velamuri — CS + Mathematics, University of Maryland.</p>
      </noscript>
    </>
  )
}
