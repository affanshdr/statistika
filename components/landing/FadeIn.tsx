'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  className?: string
}

export default function FadeIn({ 
  children, 
  delay = 0,
  direction = 'up',
  duration = 0.5,
  className = ''
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        y: direction === 'up' ? 24 : direction === 'down' ? -24 : 0,
        x: direction === 'left' ? 24 : direction === 'right' ? -24 : 0
      }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] as const 
      }}
    >
      {children}
    </motion.div>
  )
}
