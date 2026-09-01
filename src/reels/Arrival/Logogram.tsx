import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export type LogogramHandle = { setProgress: (n: number) => void }

type Props = {
  className?: string
  seed?: number
  blooms?: number
  interactive?: boolean
  autoDraw?: boolean
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Bloom = {
  ang: number
  dir: number
  len: number
  curl: number
  drift: number
  hook: boolean
  start: number
  splotch: { at: number; r: number }[]
}
type Arc = { r: number; a0: number; a1: number; w: number; start: number }

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

/**
 * An original circular glyph in the spirit of the heptapod logograms — a ring
 * of ink with irregular blooms and splotches, inked on by scroll progress,
 * its tendrils reaching toward the cursor.
 */
const Logogram = forwardRef<LogogramHandle, Props>(function Logogram(
  { className, seed = 7, blooms = 12, interactive = false, autoDraw = false },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progRef = useRef(autoDraw ? 1 : 0)

  useImperativeHandle(ref, () => ({
    setProgress: (n: number) => {
      progRef.current = clamp01(n)
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) progRef.current = 1

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0
    let H = 0
    let R = 0

    const s = getComputedStyle(document.documentElement)
    const ink = s.getPropertyValue('--arr-ink').trim() || '#101614'
    const glow = s.getPropertyValue('--arr-fog-hi').trim() || '#c6cdc8'
    const ember = s.getPropertyValue('--arr-ember').trim() || '#c98f5c'

    const r = rng(seed)
    // irregular angular gaps so blooms cluster instead of sitting on spokes
    const gaps = Array.from({ length: blooms }, () => 0.35 + r() * 1.9)
    const gsum = gaps.reduce((a, b) => a + b, 0)
    let acc = 0
    const bl: Bloom[] = gaps.map((g, i) => {
      acc += g
      const long = r() > 0.62
      return {
        ang: (acc / gsum) * Math.PI * 2,
        dir: r() > 0.6 ? -1 : 1,
        len: (long ? 0.34 : 0.12) + r() * (long ? 0.5 : 0.28),
        curl: (r() - 0.5) * 3.4,
        drift: (r() - 0.5) * 0.6,
        hook: r() > 0.7,
        start: 0.4 + (i / blooms) * 0.5,
        splotch: Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({ at: 0.2 + r() * 0.9, r: 2.6 + r() * 5.5 })),
      }
    })
    const reach = new Float32Array(blooms)

    // a few partial concentric arc fragments inside the ring
    const arcs: Arc[] = Array.from({ length: 1 + Math.floor(r() * 3) }, () => {
      const a0 = r() * Math.PI * 2
      return { r: 0.42 + r() * 0.4, a0, a1: a0 + 0.6 + r() * 2.2, w: 1 + r() * 1.6, start: 0.55 + r() * 0.4 }
    })

    const pointer = { x: 0, y: 0, active: false }
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect()
      pointer.x = e.clientX - (b.left + b.width / 2)
      pointer.y = e.clientY - (b.top + b.height / 2)
      pointer.active = true
    }
    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onMove, { passive: true })
    }

    const resize = () => {
      W = canvas.width = Math.max(2, Math.floor(canvas.offsetWidth * dpr))
      H = canvas.height = Math.max(2, Math.floor(canvas.offsetHeight * dpr))
      R = Math.min(W, H) * 0.3
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const ribbon = (pts: number[][], widths: number[]) => {
      const left: number[][] = []
      const right: number[][] = []
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)]
        const b = pts[Math.min(pts.length - 1, i + 1)]
        let dx = b[0] - a[0]
        let dy = b[1] - a[1]
        const l = Math.hypot(dx, dy) || 1
        dx /= l
        dy /= l
        const w = widths[i]
        left.push([pts[i][0] - dy * w, pts[i][1] + dx * w])
        right.push([pts[i][0] + dy * w, pts[i][1] - dx * w])
      }
      ctx.beginPath()
      ctx.moveTo(left[0][0], left[0][1])
      for (const p of left) ctx.lineTo(p[0], p[1])
      for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1])
      ctx.closePath()
      ctx.fill()
    }

    const blob = (x: number, y: number, rad: number, k: number) => {
      const l1 = 1.4 + ((k * 7) % 3)
      const l2 = 2.6 + ((k * 3) % 4)
      ctx.beginPath()
      for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * Math.PI * 2
        const rr =
          rad *
          (0.5 + 0.42 * Math.abs(Math.sin(a * l1 + k)) + 0.24 * Math.sin(a * l2 + k * 2.3))
        const xx = x + Math.cos(a) * rr
        const yy = y + Math.sin(a) * rr
        if (i === 0) ctx.moveTo(xx, yy)
        else ctx.lineTo(xx, yy)
      }
      ctx.closePath()
      ctx.fill()
    }

    let raf = 0
    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const drawn = easeOut(progRef.current)
      ctx.clearRect(0, 0, W, H)
      if (drawn < 0.001) return

      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(1 + Math.sin(t * 0.0011) * 0.01, 1 + Math.sin(t * 0.0011) * 0.01)
      ctx.fillStyle = ink
      ctx.strokeStyle = ink
      ctx.lineCap = 'round'
      ctx.shadowColor = glow
      ctx.shadowBlur = 8 * dpr

      // --- ring ---
      const ringEnd = drawn * Math.PI * 2
      const N = 170
      const rpts: number[][] = []
      const rw: number[] = []
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2
        if (a > ringEnd + 0.02) break
        const ca = a - Math.PI / 2
        const wob = Math.sin(a * 3 + seed) * R * 0.02 + Math.sin(a * 9 + seed * 2) * R * 0.007
        const rr = R + wob
        rpts.push([Math.cos(ca) * rr, Math.sin(ca) * rr])
        rw.push((2.6 + Math.abs(Math.sin(a * 3 + seed * 1.3)) * 5 + Math.abs(Math.sin(a * 7 + seed)) * 1.6) * dpr)
      }
      if (rpts.length > 2) {
        ctx.globalAlpha = 1
        ribbon(rpts, rw)
      }

      // --- inner arc fragments ---
      ctx.globalAlpha = 0.8
      for (const arc of arcs) {
        if (drawn <= arc.start) continue
        const seg = clamp01((drawn - arc.start) / (1 - arc.start))
        ctx.lineWidth = arc.w * dpr
        ctx.beginPath()
        ctx.arc(0, 0, R * arc.r, arc.a0 - Math.PI / 2, arc.a0 - Math.PI / 2 + (arc.a1 - arc.a0) * seg)
        ctx.stroke()
      }

      // --- blooms ---
      for (let i = 0; i < bl.length; i++) {
        const b = bl[i]
        const local = clamp01((drawn - b.start) / (1 - b.start) / 0.55)
        if (local <= 0) continue

        const baseA = b.ang - Math.PI / 2
        const bx = Math.cos(baseA) * R
        const by = Math.sin(baseA) * R
        const tx = -Math.sin(baseA)
        const ty = Math.cos(baseA)
        // outward (or inward) plus a tangential lean, so blooms aren't pure spokes
        const nx = Math.cos(baseA) * b.dir + tx * b.drift
        const ny = Math.sin(baseA) * b.dir + ty * b.drift

        let target = 0
        if (interactive && pointer.active) {
          const px = pointer.x * dpr
          const py = pointer.y * dpr
          const dot = (px * Math.cos(baseA) + py * Math.sin(baseA)) / (Math.hypot(px, py) || 1)
          target = Math.max(0, dot) ** 2
        }
        reach[i] += (target - reach[i]) * 0.08

        const L = (b.len + reach[i] * 0.5) * R * 1.9 * local
        const M = 22
        const pts: number[][] = []
        const widths: number[] = []
        for (let sIdx = 0; sIdx <= M; sIdx++) {
          const f = sIdx / M
          const along = f * L
          const curl = Math.sin(f * Math.PI * 0.8) * b.curl * R * 0.19 * (f + 0.15)
          let x = bx + nx * along + tx * curl
          let y = by + ny * along + ty * curl
          if (interactive && pointer.active && reach[i] > 0.01) {
            const pull = reach[i] * f * f
            x += (pointer.x * dpr - x) * 0.1 * pull
            y += (pointer.y * dpr - y) * 0.1 * pull
          }
          pts.push([x, y])
          widths.push((4.4 * (1 - f) * (1 - f) + 0.4) * dpr)
        }
        ctx.globalAlpha = 0.9
        ribbon(pts, widths)

        for (const sp of b.splotch) {
          if (sp.at > local * 1.15) continue
          const along = Math.min(sp.at, 1) * L
          const curl = Math.sin(sp.at * Math.PI) * b.curl * R * 0.13
          const x = bx + nx * along + tx * curl
          const y = by + ny * along + ty * curl
          ctx.globalAlpha = 0.55
          blob(x, y, sp.r * dpr, i + sp.at)
        }

        if (b.hook && local > 0.85) {
          const ex = bx + nx * L + tx * b.curl * R * 0.1
          const ey = by + ny * L + ty * b.curl * R * 0.1
          ctx.globalAlpha = 0.85
          ctx.lineWidth = 2.2 * dpr
          ctx.beginPath()
          ctx.arc(ex, ey, 6 * dpr, b.curl, b.curl + Math.PI * 1.35)
          ctx.stroke()
        }
      }

      if (interactive && pointer.active) {
        ctx.fillStyle = ember
        ctx.shadowBlur = 18 * dpr
        ctx.globalAlpha = 0.3
        blob(pointer.x * dpr * 0.55, pointer.y * dpr * 0.55, 2 * dpr, 1)
      }

      ctx.restore()
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (interactive) {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onMove)
      }
    }
  }, [seed, blooms, interactive, autoDraw])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
})

export default Logogram
