'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const raf = useRef<number>(0)

  useEffect(() => {
    // Hanya aktif di pointer device (desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!isVisible) setIsVisible(true)
    }

    const onEnter = () => setIsVisible(true)
    const onLeave = () => setIsVisible(false)

    // Deteksi hover pada elemen interaktif
    const addHoverListeners = () => {
      const interactives = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], .magnetic-btn'
      )
      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => setIsHovering(true))
        el.addEventListener('mouseleave', () => setIsHovering(false))
      })
    }

    // RAF untuk update posisi cursor (smooth)
    const tick = () => {
      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`
        dotRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`
      }
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseleave', onLeave)
    addHoverListeners()
    raf.current = requestAnimationFrame(tick)

    // MutationObserver untuk elemen interaktif yang ditambahkan dinamis
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
      observer.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sembunyikan di touch/mobile
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null
  }

  return (
    <>
      {/* Outer ring — glow circle */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '40px',
          height: '40px',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 0.2s',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
        }}
      >
        {/* Magnifier SVG cursor */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          style={{
            transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s',
            transform: isHovering ? 'scale(1.5)' : 'scale(1)',
          }}
        >
          {/* Outer glow ring */}
          <circle
            cx="16"
            cy="16"
            r="13"
            stroke={isHovering ? '#00F0FF' : '#00ADB5'}
            strokeWidth="1.5"
            fill={isHovering ? 'rgba(0, 240, 255, 0.06)' : 'rgba(0, 173, 181, 0.04)'}
            style={{ transition: 'stroke 0.15s, fill 0.15s' }}
          />
          {/* Inner circle */}
          <circle
            cx="16"
            cy="16"
            r="8"
            stroke={isHovering ? '#00F0FF' : '#00ADB5'}
            strokeWidth="1"
            fill="none"
            opacity="0.5"
            style={{ transition: 'stroke 0.15s' }}
          />
          {/* Cross hairs */}
          <line x1="16" y1="11" x2="16" y2="21" stroke={isHovering ? '#00F0FF' : '#00ADB5'} strokeWidth="1" opacity="0.4" />
          <line x1="11" y1="16" x2="21" y2="16" stroke={isHovering ? '#00F0FF' : '#00ADB5'} strokeWidth="1" opacity="0.4" />
          {/* Handle */}
          <line
            x1="25"
            y1="25"
            x2="33"
            y2="33"
            stroke={isHovering ? '#00F0FF' : '#00ADB5'}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transition: 'stroke 0.15s' }}
          />
        </svg>
      </div>

      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isHovering ? '#00F0FF' : '#00ADB5',
          pointerEvents: 'none',
          zIndex: 100000,
          transition: 'opacity 0.2s, background 0.15s, transform 0.08s',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
          boxShadow: isHovering ? '0 0 8px rgba(0,240,255,0.8)' : '0 0 6px rgba(0,173,181,0.6)',
        }}
      />
    </>
  )
}
