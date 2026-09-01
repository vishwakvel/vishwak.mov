import { useEffect, useRef } from 'react'

/**
 * Photochemical-style luminance grain, re-randomized at ~24fps (projection rate).
 * Drawn to a low-res backing buffer and scaled up by CSS for a soft, filmic tooth.
 */
export default function FilmGrain({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const SCALE = 0.5
    let img: ImageData | null = null

    const resize = () => {
      const w = Math.max(2, Math.floor(canvas.offsetWidth * SCALE))
      const h = Math.max(2, Math.floor(canvas.offsetHeight * SCALE))
      canvas.width = w
      canvas.height = h
      img = ctx.createImageData(w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      if (!img) return
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        // centred on mid-grey so `overlay` blend reads as neutral tooth,
        // deviations lift/drop luminance like real emulsion grain
        const v = (128 + (Math.random() * 2 - 1) * 92) | 0
        d[i] = d[i + 1] = d[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v
        d[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
    }

    if (reduced) {
      draw()
      return () => ro.disconnect()
    }

    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < 1000 / 24) return
      last = t
      if (!document.hidden) draw()
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
