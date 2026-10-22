'use client'

import React, { useRef } from 'react'

export interface JoystickProps {
  onDir: (x: number, y: number) => void
}

export default function Joystick({ onDir }: JoystickProps) {
  const outer = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const on = useRef(false)

  const compute = (cx: number, cy: number) => {
    const el = outer.current
    if (!el) return
    const b = el.getBoundingClientRect()
    const R = b.width / 2
    const dx = cx - (b.left + R)
    const dy = cy - (b.top + R)
    const d = Math.sqrt(dx * dx + dy * dy)
    onDir(
      Math.max(-1, Math.min(1, d > 0 ? dx / Math.max(d, R) : 0)),
      Math.max(-1, Math.min(1, d > 0 ? dy / Math.max(d, R) : 0))
    )
    if (knob.current) {
      knob.current.style.transform = `translate(calc(-50% + ${(dx / Math.max(d, 1)) * Math.min(d, R)}px),calc(-50% + ${(dy / Math.max(d, 1)) * Math.min(d, R)}px))`
    }
  }

  const reset = () => {
    on.current = false
    onDir(0, 0)
    if (knob.current) {
      knob.current.style.transform = 'translate(-50%,-50%)'
    }
  }

  return (
    <div
      style={{
        width: 'clamp(60px, 9vw, 84px)',
        height: 'clamp(60px, 9vw, 84px)',
        borderRadius: '50%',
        background: 'rgba(14, 131, 136, 0.22)',
        border: '2.5px solid rgba(0, 173, 181, 0.45)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 173, 181, 0.2)',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.3s, transform 0.2s',
      }}
      ref={outer}
      onPointerDown={e => {
        on.current = true
        outer.current?.setPointerCapture(e.pointerId)
        compute(e.clientX, e.clientY)
      }}
      onPointerMove={e => {
        if (on.current) compute(e.clientX, e.clientY)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        ref={knob}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '36%',
          height: '36%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#00ADB5 0%,#818cf8 100%)',
          boxShadow: '0 0 12px #00ADB5',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
