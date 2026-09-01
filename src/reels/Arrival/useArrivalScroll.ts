import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LogogramHandle } from './Logogram'

gsap.registerPlugin(ScrollTrigger)

// scroll window for reel 02, in viewport heights (matches App.tsx phases)
const START_VH = 2
const END_VH = 6
const MV_CENTERS = [0.15, 0.5, 0.85]
const PLATEAU = 0.06
const FADE = 0.12

/**
 * Scroll through the Arrival panel: the hero logogram inks in, then the three
 * movements of the about-me resolve one at a time, occupying the same space the
 * way the logograms do — all present, one in focus.
 */
export function useArrivalScroll(
  root: RefObject<HTMLElement | null>,
  hero: RefObject<LogogramHandle | null>,
) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      hero.current?.setProgress(1)
      return
    }
    const el = root.current
    if (!el) return

    const movements = Array.from(el.querySelectorAll<HTMLElement>('.movement'))
    const vh = () => window.innerHeight

    const st = ScrollTrigger.create({
      start: () => vh() * START_VH,
      end: () => vh() * END_VH,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        hero.current?.setProgress(p / 0.22)
        movements.forEach((m, i) => {
          const c = MV_CENTERS[i]
          const d = Math.abs(p - c)
          let op = d <= PLATEAU ? 1 : Math.max(0, 1 - (d - PLATEAU) / FADE)
          if (i === movements.length - 1 && p > c) op = 1
          m.style.opacity = String(op)
          m.style.transform = `translateY(${(p - c) * -30}px)`
        })
      },
    })

    return () => st.kill()
  }, [root, hero])
}
