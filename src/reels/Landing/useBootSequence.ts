import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'

/**
 * The IMAX 15/70 boot-up. A xenon strike, a non-linear lamp warm-up, the frame
 * masking to the true 1.43:1 ratio, then the title card cut in on a frame line.
 * The edge-code readout doubles as the load/frame counter.
 */
export function useBootSequence(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el) return

    const q = gsap.utils.selector(el)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const counter = q('[data-counter]')[0] as HTMLElement | undefined
    const edgenum = q('[data-edgenum]')[0] as HTMLElement | undefined
    const head = q('[data-head]')[0] as HTMLElement | undefined

    const setEdge = (foot: number, frame: number) => {
      if (!edgenum) return
      edgenum.textContent = `VV 70 2026 ${String(foot).padStart(4, '0')}+${String(frame).padStart(2, '0')}`
    }
    setEdge(0, 0)

    const settle = () => {
      if (counter) counter.textContent = '0001'
      if (head) head.textContent = 'REEL 01'
      setEdge(137, 4)
    }

    if (reduced) {
      gsap.set(el, { '--m': 1, '--e': 1 })
      gsap.set(q('.lamp'), { opacity: 1 })
      gsap.set(q('.grain'), { opacity: 0.12 })
      gsap.set(q('.edgecode, .framemark, [data-titlecard], .leader, [data-aspect]'), {
        opacity: 1,
      })
      settle()
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      // 1 — xenon strike (ignition overshoot, then decay)
      tl.fromTo('.flash', { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power4.in' }, 0.25)
        .to('.flash', { opacity: 0.12, duration: 0.3 }, '>')
        .to('.flash', { opacity: 0, duration: 0.9, ease: 'power1.out' }, '>-0.08')

      // 2 — lamp warm-up: non-linear ramp to steady output
      tl.fromTo('.lamp', { opacity: 0 }, { opacity: 1, duration: 1.7, ease: 'expo.out' }, 0.32)

      // 3 — mask crops to a 2.39:1 letterbox, holds, then unfurls to true 1.43:1
      tl.fromTo(el, { '--m': 0 }, { '--m': 1, duration: 0.55, ease: 'power3.inOut' }, 0.5)
        .fromTo(el, { '--e': 0 }, { '--e': 1, duration: 0.8, ease: 'power2.inOut' }, 1.15)

      // 4 — frame furniture resolves in
      tl.to('.grain', { opacity: 0.12, duration: 1.2 }, 1.5)
        .to('[data-aspect]', { opacity: 1, duration: 0.5 }, 1.6)
        .to('.framemark', { opacity: 1, duration: 0.5, stagger: 0.06 }, 1.7)
        .to('.edgecode', { opacity: 1, duration: 0.5 }, 1.75)

      // 5 — edge-code counts up while assets "thread through the gate"
      const tick = { p: 0 }
      tl.to(tick, {
        p: 1,
        duration: 1.5,
        ease: 'none',
        onUpdate: () => setEdge(1 + Math.floor(tick.p * 136), Math.floor(tick.p * 24) % 24),
      }, 1.5)

      // 6 — title card: hard cut in on a frame line
      tl.set('[data-titlecard]', { opacity: 1 }, 3.05)
        .fromTo('[data-titlecard]', { scale: 1.01 }, { scale: 1, duration: 0.1, ease: 'none' }, 3.05)
        .add(settle, 3.05)

      // 7 — leader-print links
      tl.to('.leader', { opacity: 1, duration: 0.6 }, 3.4)

      // ambient: a very low-amplitude lamp flicker once warm
      const flick = gsap.fromTo(
        '.flicker',
        { opacity: 0 },
        { opacity: 0.05, duration: 0.09, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true },
      )
      tl.add(() => flick.play(), 2)

      // ambient: gate weave — a few hundred microns of frame drift
      const inner = q('.gate-inner')[0] as HTMLElement | undefined
      let raf = 0
      let t = 0
      const weave = () => {
        t += 0.05
        const x = (Math.sin(t * 2.3) + Math.sin(t * 5.1)) * 0.35
        const y = (Math.sin(t * 1.7) + Math.sin(t * 4.3)) * 0.3
        inner?.style.setProperty('--wx', `${x.toFixed(2)}px`)
        inner?.style.setProperty('--wy', `${y.toFixed(2)}px`)
        raf = requestAnimationFrame(weave)
      }
      tl.add(() => {
        raf = requestAnimationFrame(weave)
      }, 1.6)

      // let people skip the ceremony
      const skip = () => tl.progress(1)
      el.addEventListener('pointerdown', skip)
      window.addEventListener('keydown', skip)

      return () => {
        cancelAnimationFrame(raf)
        flick.kill()
        el.removeEventListener('pointerdown', skip)
        window.removeEventListener('keydown', skip)
      }
    }, el)

    return () => ctx.revert()
  }, [root])
}
