'use client'

import { useEffect, useRef, CSSProperties } from 'react'
import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js'

interface GifCanvasProps {
  src: string
  style?: CSSProperties
  className?: string
  /** ms of no activity before deceleration begins. Default: 800 */
  idleTimeout?: number
  /** ms the ease-out deceleration takes. Default: 700 */
  decelDuration?: number
  /** Playback speed multiplier. 1 = original speed, 2 = 2x faster. Default: 1.5 */
  speed?: number
}

// Cubic ease-out: fast deceleration at first, trails off smoothly to 0
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export default function GifCanvas({
  src,
  style,
  className,
  idleTimeout = 800,
  decelDuration = 700,
  speed = 1.5,
}: GifCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let frames: ParsedFrame[] = []
    let frameIndex = 0
    let rafId: number | null = null
    let lastFrameTime = 0
    let isRunning = false       // RAF is active
    let playbackRate = 0.0      // 0 = stopped, 1 = full speed
    let decelerating = false
    let deceleratingSince = 0
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let disposed = false

    const tempCanvas = document.createElement('canvas')
    let tempCtx: CanvasRenderingContext2D | null = null

    // ── Draw a single frame ──────────────────────────────────────────────
    function drawFrame(
      ctx: CanvasRenderingContext2D,
      visCanvas: HTMLCanvasElement,
      index: number
    ) {
      const frame = frames[index]
      if (!frame || !tempCtx) return
      const { dims, patch, disposalType } = frame

      const imageData = new ImageData(
        new Uint8ClampedArray(patch),
        dims.width,
        dims.height
      )

      if (disposalType === 2) {
        tempCtx.clearRect(dims.left, dims.top, dims.width, dims.height)
      }

      tempCtx.putImageData(imageData, dims.left, dims.top)
      ctx.clearRect(0, 0, visCanvas.width, visCanvas.height)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(tempCanvas, 0, 0, visCanvas.width, visCanvas.height)
    }

    // ── RAF loop with smooth deceleration ───────────────────────────────
    function tick(
      now: number,
      ctx: CanvasRenderingContext2D,
      visCanvas: HTMLCanvasElement
    ) {
      if (!isRunning || disposed) return

      // Update playback rate if decelerating
      if (decelerating) {
        const t = Math.min((now - deceleratingSince) / decelDuration, 1)
        playbackRate = 1 - easeOutCubic(t)
        if (t >= 1) {
          // Fully stopped — clean exit
          playbackRate = 0
          isRunning = false
          decelerating = false
          rafId = null
          return
        }
      }

      const frame = frames[frameIndex]
      // GIF delay is in 1/100s → ms. Clamp to 16ms for 60fps ceiling.
      const baseDelay = Math.max((frame?.delay ?? 4) * 10, 16)
      // speed scales rate up; playbackRate handles deceleration (0–1)
      const effectiveDelay = baseDelay / Math.max(playbackRate * speed, 0.01)

      const elapsed = now - lastFrameTime
      if (elapsed >= effectiveDelay) {
        // Drift-corrected: carry over overshoot
        lastFrameTime = now - (elapsed % effectiveDelay)
        frameIndex = (frameIndex + 1) % frames.length
        drawFrame(ctx, visCanvas, frameIndex)
      }

      rafId = requestAnimationFrame((t) => tick(t, ctx, visCanvas))
    }

    function play(ctx: CanvasRenderingContext2D, visCanvas: HTMLCanvasElement) {
      // Coming back from deceleration or stopped → snap to full speed
      decelerating = false
      playbackRate = 1.0
      if (isRunning) return // RAF already spinning
      isRunning = true
      lastFrameTime = performance.now()
      rafId = requestAnimationFrame((t) => tick(t, ctx, visCanvas))
    }

    function startDeceleration() {
      if (!isRunning) return
      decelerating = true
      deceleratingSince = performance.now()
      // RAF keeps running — deceleration handled inside tick
    }

    function hardStop() {
      isRunning = false
      decelerating = false
      playbackRate = 0
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    // ── Load & parse GIF ─────────────────────────────────────────────────
    async function load() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const res = await fetch(src)
      const buf = await res.arrayBuffer()
      frames = decompressFrames(parseGIF(buf), true)

      if (!frames.length || disposed) return

      canvas.width  = frames[0].dims.width
      canvas.height = frames[0].dims.height
      tempCanvas.width  = canvas.width
      tempCanvas.height = canvas.height
      tempCtx = tempCanvas.getContext('2d')

      drawFrame(ctx, canvas, 0)

      // ── Shared activity handler ──────────────────────────────────────
      function onActivity() {
        play(ctx!, canvas!)
        if (idleTimer !== null) clearTimeout(idleTimer)
        idleTimer = setTimeout(startDeceleration, idleTimeout)
      }

      window.addEventListener('mousemove', onActivity)
      window.addEventListener('scroll',    onActivity, { passive: true })

      ;(canvas as HTMLCanvasElement & { _gifCleanup?: () => void })._gifCleanup =
        () => {
          window.removeEventListener('mousemove', onActivity)
          window.removeEventListener('scroll',    onActivity)
          if (idleTimer !== null) clearTimeout(idleTimer)
        }
    }

    load()

    return () => {
      disposed = true
      hardStop()
      const canvas = canvasRef.current
      if (canvas) {
        const el = canvas as HTMLCanvasElement & { _gifCleanup?: () => void }
        el._gifCleanup?.()
      }
    }
  }, [src, idleTimeout, decelDuration, speed])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  )
}
