import { useEffect, useRef } from 'react'

type Mote = { x: number; y: number; r: number; sp: number; ph: number; a: number }

/** Dust drifting in the projection light — a few slow motes in the surround. */
export default function Dust({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const N = 26
    let w = 0
    let h = 0

    const motes: Mote[] = Array.from({ length: N }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: (i % 7 === 0 ? 1.6 : 0.6) + Math.random() * 1.4,
      sp: 0.000015 + Math.random() * 0.00006,
      ph: Math.random() * Math.PI * 2,
      a: (i % 7 === 0 ? 0.16 : 0.05) + Math.random() * 0.14,
    }))

    const resize = () => {
      w = canvas.width = Math.max(2, Math.floor(canvas.offsetWidth * dpr))
      h = canvas.height = Math.max(2, Math.floor(canvas.offsetHeight * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of motes) {
        const flick = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 0.002 + p.ph)
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(241, 236, 224, ${(p.a * flick).toFixed(3)})`
        ctx.fill()
      }
    }

    if (reduced) {
      paint(0)
      return () => ro.disconnect()
    }

    let raf = 0
    let prev = performance.now()
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(64, t - prev)
      prev = t
      if (document.hidden) return
      for (const p of motes) {
        p.y -= p.sp * dt
        p.x += Math.sin(t * 0.0003 + p.ph) * 0.00012
        if (p.y < -0.03) {
          p.y = 1.03
          p.x = Math.random()
        }
      }
      paint(t)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
