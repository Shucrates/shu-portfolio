'use client'

import React from 'react'

interface AsteriskLogoProps {
  size?: number
  color?: string
  /** 0 = empty outline, 1 = fully filled */
  progress?: number
  className?: string
  id?: string
}

export default function AsteriskLogo({
  size = 40,
  color = '#111111',
  progress = 1,
  className = '',
  id,
}: AsteriskLogoProps) {
  // The SVG path for a 6-arm geometric asterisk (matching the wireframe style)
  // Built as a solid filled shape so we can clip it with a progress-based reveal
  const viewBox = 100
  const cx = 50
  const cy = 50

  // Total perimeter (approx) for stroke-dasharray trick on path
  // We use a clip-rect approach: reveal from top with progress
  const clipHeight = progress * viewBox

  return (
    <svg
      id={id}
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id ? `clip-${id}` : 'clip-asterisk'}>
          {/* Radial reveal: use a circle that grows from center */}
          <circle
            cx={cx}
            cy={cy}
            r={progress * 55}
          />
        </clipPath>
        {/* Outline version for the loading state */}
        <mask id={id ? `mask-${id}` : 'mask-asterisk'}>
          <rect width="100" height="100" fill="white" />
          <circle cx={cx} cy={cy} r={progress * 55} fill="black" />
        </mask>
      </defs>

      {/* Filled asterisk — revealed by growing circle */}
      <g clipPath={id ? `url(#clip-${id})` : 'url(#clip-asterisk)'}>
        <AsteriskShape cx={cx} cy={cy} color={color} />
      </g>

      {/* Outline asterisk — hidden as fill reveals */}
      {progress < 1 && (
        <g mask={id ? `url(#mask-${id})` : 'url(#mask-asterisk)'} opacity={0.3}>
          <AsteriskShape cx={cx} cy={cy} color={color} opacity={0} stroke={color} strokeWidth={1.5} />
        </g>
      )}
    </svg>
  )
}

function AsteriskShape({
  cx,
  cy,
  color,
  opacity = 1,
  stroke,
  strokeWidth,
}: {
  cx: number
  cy: number
  color: string
  opacity?: number
  stroke?: string
  strokeWidth?: number
}) {
  // 6-arm asterisk using rotated rectangles — matches the bold geometric wireframe style
  const arms = [0, 60, 120]
  const armW = 13
  const armH = 48

  return (
    <g>
      {arms.map((angle) => (
        <rect
          key={angle}
          x={cx - armW / 2}
          y={cy - armH / 2}
          width={armW}
          height={armH}
          rx={1}
          fill={stroke ? 'none' : color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          transform={`rotate(${angle} ${cx} ${cy})`}
        />
      ))}
    </g>
  )
}
