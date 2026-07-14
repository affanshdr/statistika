'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
  id?: string
}

export default function MagneticButton({ children, onClick, disabled, style, id }: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 })
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(window.matchMedia('(pointer: fine)').matches)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!btnRef.current || disabled) return
    const rect = btnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = 100

    if (dist < radius) {
      const strength = (1 - dist / radius)
      x.set(dx * strength * 0.35)
      y.set(dy * strength * 0.35)
    } else {
      x.set(0)
      y.set(0)
    }
  }, [disabled, x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  useEffect(() => {
    if (!isDesktop) return
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isDesktop, handleMouseMove])

  return (
    <motion.button
      ref={btnRef}
      id={id}
      onClick={onClick}
      disabled={disabled}
      onMouseLeave={handleMouseLeave}
      className="magnetic-btn"
      style={{
        x: isDesktop ? springX : 0,
        y: isDesktop ? springY : 0,
        ...style,
      }}
      whileHover={!disabled ? { scale: 1.04, boxShadow: '0 8px 32px rgba(14,131,136,0.45)' } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
    >
      {children}
    </motion.button>
  )
}
