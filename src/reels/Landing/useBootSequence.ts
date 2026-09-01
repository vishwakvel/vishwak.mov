import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'

const pad = (n: number, w: number) => String(n).padStart(w, '0')
const WIDE_RATIO = 2.39 // the letterbox we crop to before the IMAX unfurl

/**
 * The IMAX 15/70 boot-up. A xenon strike, a non-linear lamp warm-up, the frame
 * masking to a 2.39:1 letterbox then unfurling to the true 1.43:1 IMAX ratio,
 * the film advancing through the gate and locking, then the title card cutting
 * in on a frame line. The keykode edge stamp doubles as the load counter.
 */
export function useBootSequence(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el) return

    const q = gsap.utils.selector(el)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const gate = q('.gate')[0] as HTMLElement | undefined
    const inner = q('.gate-inner')[0] as HTMLElement | undefined
    const counter = q('[data-counter]')[0] as HTMLElement | undefined
    const edgenum = q('[data-edgenum]')[0] as HTMLElement | undefined
    const head = q('[data-head]')[0] as HTMLElement | undefined

    // --- mask: clip the gate from fullscreen -> 2.39 letterbox -> 1.43 frame ---
    let m = reduced ? 1 : 0 // 0..1 crop to letterbox
    let e = reduced ? 1 : 0 // 0..1 unfurl letterbox -> IMAX
    const applyMask = () => {
      if (!gate || !inner) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const fw = inner.offsetWidth
      const fh = inner.offsetHeight
      const ixFull = (vw - fw) / 2
      const iyWide = (vh - fw / WIDE_RATIO) / 2
      const iyFull = (vh - fh) / 2
      const ix = ixFull * m
      const iy = iyWide * m + (iyFull - iyWide) * e
      gate.style.clipPath = `inset(${Math.max(0, iy)}px ${Math.max(0, ix)}px)`
    }
    applyMask()
    window.addEventListener('resize', applyMask)

    const setEdge = (foot: number, frame: number) => {
      if (edgenum) edgenum.textContent = `VV 70 · 2026 · ${pad(foot, 4)}+${pad(frame, 2)} · KODAK 2383`
    }
    setEdge(0, 0)

    const settle = () => {
      if (counter) counter.textContent = '0001'
      if (head) head.textContent = 'REEL 01'
      setEdge(137, 4)
    }

    if (reduced) {
      gsap.set(q('.lamp'), { opacity: 1 })
      gsap.set(q('.grain'), { opacity: 0.17 })
      gsap.set(q('.strip, .framemark, [data-titlecard], .leader, [data-aspect]'), { opacity: 1 })
      settle()
      return () => window.removeEventListener('resize', applyMask)
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      const mask = { m: 0, e: 0 }
      const syncMask = () => {
        m = mask.m
        e = mask.e
        applyMask()
      }

      // 1 — xenon strike (ignition overshoot, then decay)
      tl.fromTo('.flash', { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power4.in' }, 0.25)
        .to('.flash', { opacity: 0.12, duration: 0.3 }, '>')
        .to('.flash', { opacity: 0, duration: 0.9, ease: 'power1.out' }, '>-0.08')

      // 2 — lamp warm-up: non-linear ramp to steady output
      tl.fromTo('.lamp', { opacity: 0 }, { opacity: 1, duration: 1.7, ease: 'expo.out' }, 0.32)

      // 3 — mask crops to a 2.39:1 letterbox, then unfurls to true 1.43:1
      tl.to(mask, { m: 1, duration: 0.55, ease: 'power3.inOut', onUpdate: syncMask }, 0.5)
        .to(mask, { e: 1, duration: 0.8, ease: 'power2.inOut', onUpdate: syncMask }, 1.15)

      // 4 — frame + strip furniture resolve in
      tl.to('.grain', { opacity: 0.17, duration: 1.2 }, 1.5)
        .to('.strip', { opacity: 1, duration: 0.6 }, 1.55)
        .to('[data-aspect]', { opacity: 1, duration: 0.5 }, 1.65)
        .to('.framemark', { opacity: 1, duration: 0.5, stagger: 0.06 }, 1.7)

      // 5 — edge stamp counts up while the film threads through
      const tick = { p: 0 }
      tl.to(tick, {
        p: 1,
        duration: 1.4,
        ease: 'none',
        onUpdate: () => setEdge(1 + Math.floor(tick.p * 136), Math.floor(tick.p * 24) % 24),
      }, 1.6)

      // 6 — the film advances and locks into the gate
      tl.fromTo(
        '[data-run]',
        { xPercent: 26, filter: 'blur(6px)' },
        { xPercent: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out' },
        2.3,
      ).to('[data-run]', { xPercent: -1, duration: 0.06, yoyo: true, repeat: 3, ease: 'none' }, 3.0)

      // 7 — title card: hard cut in on a frame line
      tl.set('[data-titlecard]', { opacity: 1 }, 3.1)
        .fromTo('[data-titlecard]', { scale: 1.01 }, { scale: 1, duration: 0.1, ease: 'none' }, 3.1)
        .add(settle, 3.1)

      // 8 — leader-print links
      tl.to('.leader', { opacity: 1, duration: 0.6 }, 3.45)

      // ambient: a very low-amplitude lamp flicker once warm
      const flick = gsap.fromTo(
        '.flicker',
        { opacity: 0 },
        { opacity: 0.05, duration: 0.09, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true },
      )
      tl.add(() => flick.play(), 2)

      // ambient: gate weave — a few hundred microns of frame drift, once locked
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
      }, 3.1)

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

    return () => {
      window.removeEventListener('resize', applyMask)
      ctx.revert()
    }
  }, [root])
}
