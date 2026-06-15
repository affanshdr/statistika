'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface BadgeUnlockProps {
  icon: string
  name: string
  desc: string
  onDone: () => void
}

export default function BadgeUnlock({ icon, name, desc, onDone }: BadgeUnlockProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="badge-unlock-overlay" onClick={onDone} style={{ cursor: 'pointer' }}>
      <motion.div
        className="badge-unlock-card"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDone}
      >
        {/* Glow ring */}
        <motion.div
          style={{
            position: 'absolute', inset: '-4px', borderRadius: 'inherit',
            background: 'conic-gradient(from 0deg, #00FF88, #00ccff, #00FF88)',
            zIndex: -1, filter: 'blur(8px)', opacity: 0.6,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent)' }}>
            BADGE BARU TERBUKA!
          </div>

          <div className="badge-icon">{icon}</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              {name}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {desc}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
          >
            Tap untuk lanjut
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
