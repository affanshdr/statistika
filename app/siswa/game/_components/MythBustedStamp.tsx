'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface MythBustedStampProps {
  onComplete: () => void
}

export default function MythBustedStamp({ onComplete }: MythBustedStampProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onComplete, 3500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '24px',
        background: 'rgba(3,7,18,0.92)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Viral post mockup being stamped */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '20px 24px',
          maxWidth: '400px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontSize: '11px', color: '#ff0050', fontWeight: 800, marginBottom: '8px', letterSpacing: '1px' }}>
          📱 VIRAL POST @faktaviral.id
        </div>
        <p style={{ margin: 0 }}>
          "BREAKING: Remaja Indonesia rata-rata habiskan <strong style={{ color: 'rgba(255,80,80,0.8)' }}>&gt;8 jam/hari</strong> di medsos! Generasi cemas kecanduan HP!"
        </p>

        {/* MYTH BUSTED Stamp */}
        <motion.div
          initial={{ scale: 4, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: -18, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 250, damping: 14 }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-18deg)',
            width: '220px', height: '80px',
            border: '5px solid #00FF88',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            background: 'transparent',
            boxShadow: '0 0 30px rgba(0,255,136,0.6), inset 0 0 20px rgba(0,255,136,0.1)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            fontWeight: 900, fontSize: '26px', color: '#00FF88',
            letterSpacing: '2px', lineHeight: 1,
            textShadow: '0 0 20px rgba(0,255,136,0.8)',
            fontFamily: 'Impact, Arial Black, sans-serif',
          }}>
            MYTH BUSTED!
          </div>
          <div style={{ fontSize: '11px', color: '#00FF88', fontWeight: 800, letterSpacing: '3px', opacity: 0.8 }}>
            DATA BERBICARA
          </div>

          {/* Scanline effect */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.04) 2px, rgba(0,255,136,0.04) 4px)',
            pointerEvents: 'none',
          }} />
        </motion.div>
      </motion.div>

      {/* Celebration text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#00FF88' }}>
          Luar Biasa, Detektif!
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '380px' }}>
          Kamu baru saja menyelamatkan linimasa dari hoaks! Analisismu membuktikan bahwa klaim viral tersebut <strong style={{ color: '#fff' }}>TIDAK DIDUKUNG DATA</strong>.
        </p>
      </motion.div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            x: [(i % 2 === 0 ? -1 : 1) * (50 + i * 20), (i % 2 === 0 ? -1 : 1) * (100 + i * 30)],
            y: [-(50 + i * 15), -(120 + i * 25)],
          }}
          transition={{ delay: 0.5 + i * 0.1, duration: 1.5 }}
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: ['#00FF88', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981', '#F97316'][i],
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}
      >
        Memuat Buku Saku Detektif...
      </motion.p>
    </motion.div>
  )
}
