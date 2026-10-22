'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

interface MythBustedStampProps {
  onComplete: () => void
}

export default function MythBustedStamp({ onComplete }: MythBustedStampProps) {
  const [phase, setPhase] = useState<'stamp' | 'mentor'>('stamp')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // After stamp animation (3.5s), transition to mentor dialog
  useEffect(() => {
    gameAudio.playUnlockJingle()
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20, 10, 5, 0.7)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), inset 0 0 30px rgba(180, 140, 80, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          color: '#362014',
          boxSizing: 'border-box',
        }}
      >
        {/* Corner Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '3px 0 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 3px 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '0 0 0 3px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 0 3px 0', pointerEvents: 'none' }} />

        <AnimatePresence mode="wait">
          {/* ── Phase 1: MYTH BUSTED Stamp ── */}
          {phase === 'stamp' && (
            <motion.div
              key="stamp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}
            >
              {/* Viral post mockup being stamped */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{
                  position: 'relative',
                  background: '#FFFDF7',
                  border: '1.5px solid #B48C50',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  width: '100%',
                  maxWidth: '420px',
                  textAlign: 'center',
                  color: '#362014',
                  fontSize: '14px',
                  lineHeight: 1.55,
                  boxShadow: 'inset 0 2px 6px rgba(140, 98, 57, 0.08), 0 4px 12px rgba(0,0,0,0.06)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>
                  📱 VIRAL POST @faktaviral.id
                </div>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {'"'}BREAKING: Remaja Indonesia rata-rata habiskan{' '}
                  <strong style={{ color: '#DC2626' }}>&gt;8 jam/hari</strong>{' '}
                  di medsos! Generasi cemas kecanduan HP!{'"'}
                </p>

                {/* MYTH BUSTED Stamp (Authentic Red Rubber Stamp) */}
                <motion.div
                  initial={{ scale: 4, rotate: -25, opacity: 0 }}
                  animate={{ scale: 1, rotate: -16, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 250, damping: 14 }}
                  style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-16deg)',
                    width: '230px', height: '80px',
                    border: '5px solid #DC2626',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                    background: 'rgba(254, 242, 242, 0.9)',
                    boxShadow: '0 0 25px rgba(220, 38, 38, 0.4), inset 0 0 15px rgba(220, 38, 38, 0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    fontWeight: 900, fontSize: '26px', color: '#DC2626',
                    letterSpacing: '2px', lineHeight: 1,
                    textShadow: '0 0 12px rgba(220, 38, 38, 0.3)',
                    fontFamily: 'Impact, Arial Black, sans-serif',
                  }}>
                    MYTH BUSTED!
                  </div>
                  <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 900, letterSpacing: '3px', opacity: 0.9, marginTop: '2px' }}>
                    DATA BERBICARA
                  </div>
                </motion.div>
              </motion.div>

              {/* Celebration text */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#362014' }}>
                  Luar Biasa, Detektif!
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#5C3D1E', lineHeight: 1.6, maxWidth: '420px', fontWeight: 600 }}>
                  Kamu baru saja menyelamatkan linimasa dari hoaks! Analisismu membuktikan bahwa klaim viral tersebut{' '}
                  <strong style={{ color: '#9A3412' }}>TIDAK DIDUKUNG DATA</strong>.
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                style={{ fontSize: '12.5px', color: '#78350F', margin: 0, fontWeight: 700 }}
              >
                Pak Sutrisno sedang menyiapkan evaluasinya...
              </motion.p>
            </motion.div>
          )}

          {/* ── Phase 2: Mentor Dialog ── */}
          {phase === 'mentor' && (
            <motion.div
              key="mentor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                display: 'flex', flexDirection: 'column', gap: '16px',
                alignItems: 'center',
              }}
            >
              {/* Pak Sutrisno avatar + header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <motion.img
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
                  src="/Assets/Character/pak-sutrisno-portrait.png"
                  alt="Pak Sutrisno"
                  style={{ height: '110px', objectFit: 'contain', imageRendering: 'pixelated', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.3))' }}
                />
                <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  EVALUASI DARI PAK SUTRISNO
                </div>
              </motion.div>

              {/* Dialog bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: '#FFFDF7',
                  border: '1.5px solid #B48C50',
                  borderRadius: '18px',
                  padding: '18px 22px',
                  width: '100%',
                  boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.08), 0 4px 12px rgba(0,0,0,0.06)',
                  boxSizing: 'border-box',
                }}
              >
                <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 900, color: '#362014' }}>
                  🎉 &quot;Kerja luar biasa, {typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('player') || '{}').username || JSON.parse(localStorage.getItem('student') || '{}').username || 'Detektif') : 'Detektif'}!
                </p>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#5C3D1E', lineHeight: 1.6, fontWeight: 600 }}>
                  Kamu telah berhasil membuktikan secara objektif bahwa postingan viral tersebut keliru! Data empiris kita menunjukkan mayoritas siswa menggunakan gawai secara wajar, dan angka tinggi hanya disebabkan oleh segelintir data pencilan (outlier).
                </p>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#5C3D1E', lineHeight: 1.6, fontWeight: 600 }}>
                  Dengan menuntaskan tugas kedisiplinan dan investigasi statistika ini dengan sangat cemerlang, <strong style={{ color: '#059669' }}>sanksimu resmi dicabut</strong> dan kamu diperbolehkan kembali mengikuti kegiatan belajar!
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#78350F', lineHeight: 1.6, fontWeight: 600 }}>
                  Ayo kita lihat rangkuman hasil investigasi dan lencana prestasi yang berhasil kamu raih!&quot;
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                style={{
                  padding: '14px 36px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(14, 131, 136, 0.4)',
                  letterSpacing: '0.5px',
                }}
              >
                📊 Lihat Hasil Investigasi →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
