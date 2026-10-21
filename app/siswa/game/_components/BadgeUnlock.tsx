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
    <div className="badge-unlock-overlay" onClick={onDone} style={{ cursor: 'pointer', background: 'rgba(40, 25, 15, 0.65)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDone}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: '24px',
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          maxWidth: '380px',
          width: '90%',
        }}
      >
        {/* 4 Decorative Corner Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 0 3px 0' }} />

        {/* Glow ring */}
        <motion.div
          style={{
            position: 'absolute', inset: '-4px', borderRadius: 'inherit',
            background: 'conic-gradient(from 0deg, #D97706, #0E8388, #D97706)',
            zIndex: -1, filter: 'blur(8px)', opacity: 0.5,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', color: '#9A3412', textTransform: 'uppercase' }}>
            🎖️ BADGE BARU TERBUKA!
          </div>

          <div style={{
            fontSize: '56px',
            filter: 'drop-shadow(0 4px 12px rgba(180, 140, 80, 0.4))'
          }}>
            {icon}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#362014', marginBottom: '6px' }}>
              {name}
            </div>
            <div style={{ fontSize: '13.5px', color: '#5C3D1E', lineHeight: 1.5 }}>
              {desc}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ fontSize: '11.5px', color: '#8C6239', fontWeight: 700 }}
          >
            Tap untuk lanjut
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
