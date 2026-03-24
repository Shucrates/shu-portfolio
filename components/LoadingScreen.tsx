'use client'

import { useEffect, useRef, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)
  const progressRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  // Asterisk geometry
  const cx = 50
  const cy = 50
  const armW = 13
  const armH = 48
  const arms = [0, 60, 120]

  useEffect(() => {
    const duration = 2200 // ms
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const raw = Math.min(elapsed / duration, 1)
      // Ease out — fast start, slow end
      const eased = 1 - Math.pow(1 - raw, 3)
      progressRef.current = eased
      setProgress(eased)

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Done — trigger fade out after a short pause
        setTimeout(() => {
          setFadingOut(true)
          setTimeout(() => {
            onComplete()
          }, 650)
        }, 300)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onComplete])

  const clipR = progress * 58

  return (
    <div className={`loading-screen${fadingOut ? ' fade-out' : ''}`} id="loading-screen" role="status" aria-label="Loading">
      {/* Nav overlay */}
      {/* <div className="loading-nav">
        <div className="loading-nav-links">
          <a href="#" className="active-link">HOME</a>
          <a href="#">WORK</a>
          <a href="#">ABOUT</a>
          <a href="#">CONTACT</a>
        </div>
        <span className="loading-nav-menu">MENU</span>
      </div> */}

      {/* Animated asterisk */}
      <div className="loading-asterisk-wrap">
        <svg
          id="loading-asterisk"
          width="200"
          height="200"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="loading-clip">
              <circle cx={cx} cy={cy} r={clipR} />
            </clipPath>
          </defs>

          {/* Faint outline (always visible) */}
          <g opacity="0.15">
            {arms.map((angle) => (
              <rect
                key={angle}
                x={cx - armW / 2}
                y={cy - armH / 2}
                width={armW}
                height={armH}
                rx={1}
                fill="#ffffff"
                transform={`rotate(${angle} ${cx} ${cy})`}
              />
            ))}
          </g>

          {/* Filled asterisk revealed by growing circle */}
          <g clipPath="url(#loading-clip)">
            {arms.map((angle) => (
              <rect
                key={angle}
                x={cx - armW / 2}
                y={cy - armH / 2}
                width={armW}
                height={armH}
                rx={1}
                fill="#ffffff"
                transform={`rotate(${angle} ${cx} ${cy})`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Progress percentage */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          fontFamily: 'Inter, Helvetica Neue, sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}
      >
        {Math.round(progress * 100)}%
      </div>
    </div>
  )
}
