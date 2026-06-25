'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MythBustedStampProps {
  onComplete: () => void
}

export default function MythBustedStamp({ onComplete }: MythBustedStampProps) {
  const [phase, setPhase] = useState<'stamp' | 'mentor'>('stamp')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // After stamp animation (3.5s), transition to mentor dialog
  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase('mentor'), 3500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        flexDirection: 'column',
        background: 'rgba(250,246,238,0.92)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
        padding: '0',
      }}
    >
      <div style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        boxSizing: 'border-box',
      }}>
      <AnimatePresence mode="wait">
        {/* ── Phase 1: MYTH BUSTED Stamp ── */}
        {phase === 'stamp' && (
          <motion.div
            key="stamp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
          >
            {/* Viral post mockup being stamped */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{
                position: 'relative',
                background: 'rgba(217,119,6,0.06)',
                border: '1px solid rgba(180,140,80,0.1)',
                borderRadius: '16px',
                padding: '20px 24px',
                maxWidth: '400px',
                textAlign: 'center',
                color: '#78716C',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontSize: '11px', color: '#ff0050', fontWeight: 800, marginBottom: '8px', letterSpacing: '1px' }}>
                📱 VIRAL POST @faktaviral.id
              </div>
              <p style={{ margin: 0 }}>
                {'"'}BREAKING: Remaja Indonesia rata-rata habiskan{' '}
                <strong style={{ color: 'rgba(255,80,80,0.8)' }}>&gt;8 jam/hari</strong>{' '}
                di medsos! Generasi cemas kecanduan HP!{'"'}
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
                  border: '5px solid #D97706',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                  background: 'transparent',
                  boxShadow: '0 0 30px rgba(217,119,6,0.6), inset 0 0 20px rgba(217,119,6,0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  fontWeight: 900, fontSize: '26px', color: '#D97706',
                  letterSpacing: '2px', lineHeight: 1,
                  textShadow: '0 0 20px rgba(217,119,6,0.8)',
                  fontFamily: 'Impact, Arial Black, sans-serif',
                }}>
                  MYTH BUSTED!
                </div>
                <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, letterSpacing: '3px', opacity: 0.8 }}>
                  DATA BERBICARA
                </div>
                {/* Scanline effect */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(217,119,6,0.04) 2px, rgba(217,119,6,0.04) 4px)',
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
              <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#D97706' }}>
                Luar Biasa, Detektif!
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#78716C', lineHeight: 1.6, maxWidth: '380px' }}>
                Kamu baru saja menyelamatkan linimasa dari hoaks! Analisismu membuktikan bahwa klaim viral tersebut{' '}
                <strong style={{ color: '#1C1917' }}>TIDAK DIDUKUNG DATA</strong>.
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
                  background: ['#D97706', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EA580C', '#10B981', '#F97316'][i],
                  pointerEvents: 'none',
                }}
              />
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}
            >
              DiRA sedang menyiapkan pesannya...
            </motion.p>
          </motion.div>
        )}

        {/* ── Phase 2: Mentor Dialog ── */}
        {phase === 'mentor' && (
          <motion.div
            key="mentor"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: '560px', width: '100%',
              display: 'flex', flexDirection: 'column', gap: '16px',
              alignItems: 'center',
            }}
          >
            {/* DiRA avatar + header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
            >
              {/* Agent DIRA image */}
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
                src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
                onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
                alt="Agent DiRA"
                style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(217,119,6,0.4))' }}
              />
              <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, letterSpacing: '2px' }}>
                PESAN DARI DIRA
              </div>
            </motion.div>

            {/* Dialog bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'rgba(217,119,6,0.04)',
                border: '1px solid rgba(217,119,6,0.25)',
                borderRadius: '20px',
                padding: '16px 20px',
                width: '100%',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: '#D97706' }}>
                🎉 &quot;Luar biasa, Detektif!
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#44403C', lineHeight: 1.6 }}>
                Kamu baru saja menyelamatkan linimasa dari hoaks! Analisismu membuktikan bahwa mata kita sering ditipu oleh angka rata-rata yang dimanipulasi oleh data ekstrem (outlier).
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#44403C', lineHeight: 1.6 }}>
                Tapi, tahukah kamu apa <strong style={{ color: '#1C1917' }}>nama ilmiah</strong> dari bentuk grafik yang kamu buat tadi? Dan bagaimana outlier bisa{' '}
                <strong style={{ color: '#1C1917' }}>merusak nilai rata-rata (mean)</strong> secara matematis?
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#44403C', lineHeight: 1.6 }}>
                Sebelum kita lanjut ke Kasus Level 2, kamu wajib membuka{' '}
                <strong style={{ color: '#D97706' }}>&apos;Buku Saku Detektif&apos;</strong> di bawah ini untuk memperkuat senjata analisismu!&quot;
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              style={{
                padding: '16px 40px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(90deg, #D97706, #EA580C)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(217,119,6,0.45)',
                letterSpacing: '0.5px',
              }}
            >
              📖 Buka Buku Saku Detektif →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  )
}
