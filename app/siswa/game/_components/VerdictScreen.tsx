'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATS } from '../_data/level1'

interface VerificationScreenProps {
  onCorrect: () => void    // jawaban benar → lanjut MythBusted
  onWrong: () => void      // jawaban salah → coba lagi
  guidedMode?: boolean     // FD: tampilkan hint dari DiRA
}

const VIRAL_POST = {
  handle: '@faktaviral.id',
  badge: '📱 VIRAL POST',
  text: 'BREAKING: Remaja Indonesia rata-rata habiskan',
  highlight: '>8 jam/hari',
  suffix: 'di medsos! Generasi cemas kecanduan HP!',
}

type Answer = 'benar' | 'hoaks' | null

export default function VerificationScreen({ onCorrect, onWrong, guidedMode }: VerificationScreenProps) {
  const [selected, setSelected] = useState<Answer>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  const handleSubmit = () => {
    if (!selected) return
    setSubmitted(true)
    if (selected === 'hoaks') {
      // Jawaban benar — tapi bukan hoaks murni, misleading
      setTimeout(() => onCorrect(), 1200)
    } else {
      setIsWrong(true)
    }
  }

  const handleRetry = () => {
    setSelected(null)
    setSubmitted(false)
    setIsWrong(false)
    onWrong()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex', flexDirection: 'column', gap: '18px',
        maxWidth: '680px', margin: '0 auto',
        width: '100%',
      }}
    >
      {/* ── Header DiRA ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        {/* Name tab */}
        <div style={{
          background: 'rgba(10, 20, 15, 0.95)',
          borderTop: '2px solid rgba(0, 255, 136, 0.3)',
          borderLeft: '2px solid rgba(0, 255, 136, 0.3)',
          borderRight: '2px solid rgba(0, 255, 136, 0.3)',
          borderBottom: 'none',
          borderRadius: '6px 14px 0 0',
          padding: '4px 14px',
          color: 'var(--accent)',
          fontSize: 'clamp(10px, 1.6vh, 13px)',
          fontWeight: 800,
          letterSpacing: '1px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>👤</span>
          <span>ASISTEN DIRA</span>
        </div>

        {/* Dialog box */}
        <div style={{
          background: 'rgba(10, 20, 18, 0.95)',
          border: '2px solid rgba(0, 255, 136, 0.4)',
          borderRadius: '0px 14px 14px 14px',
          padding: 'clamp(12px, 2vh, 18px) clamp(14px, 2.5vw, 22px)',
          boxShadow: '0 10px 25px rgba(0,255,136,0.1)',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <p style={{
            margin: 0,
            fontSize: 'clamp(12px, 2vh, 15px)',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            lineHeight: 1.65,
          }}>
            Kamu sudah melihat datanya. Sekarang, <strong style={{ color: 'var(--accent)' }}>ingat postingan viral</strong> di awal tadi?{' '}
            Berdasarkan analisis statistikmu — apakah klaim tersebut <strong style={{ color: 'var(--accent)' }}>benar</strong> atau <strong style={{ color: '#FF3366' }}>hoaks</strong>?
          </p>
        </div>
      </div>

      {/* ── Viral Post (sama seperti cutscene) ── */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: 'clamp(14px, 2.5vh, 22px) clamp(16px, 3vw, 26px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Noise/grain overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,0,80,0.015) 3px, rgba(255,0,80,0.015) 4px)',
          pointerEvents: 'none',
        }} />

        {/* Post header */}
        <div style={{
          fontSize: 'clamp(9px, 1.4vh, 11px)',
          color: '#ff0050',
          fontWeight: 800,
          marginBottom: '10px',
          letterSpacing: '1px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            📱
          </motion.span>
          {VIRAL_POST.badge} {VIRAL_POST.handle}
          {/* Live pulse */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            marginLeft: 'auto',
          }}>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff0050', display: 'inline-block' }}
            />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>LIVE</span>
          </span>
        </div>

        {/* Post content */}
        <p style={{
          margin: 0,
          fontSize: 'clamp(12px, 2.1vh, 16px)',
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.6,
          fontWeight: 600,
        }}>
          "{VIRAL_POST.text}{' '}
          <strong style={{ color: '#FF5050', fontSize: 'clamp(14px, 2.4vh, 18px)' }}>{VIRAL_POST.highlight}</strong>
          {' '}{VIRAL_POST.suffix}"
        </p>

        {/* Stats teaser strip */}
        <div style={{
          marginTop: '12px',
          display: 'flex', gap: '14px',
          fontSize: 'clamp(10px, 1.6vh, 12px)',
          color: 'rgba(255,255,255,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '10px',
        }}>
          <span>❤️ 48.2K likes</span>
          <span>🔁 22.4K reposts</span>
          <span>💬 9.1K comments</span>
        </div>
      </motion.div>

      {/* ── Data reminder strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'flex', gap: '10px', flexWrap: 'wrap',
          padding: 'clamp(8px, 1.4vh, 12px) clamp(12px, 2vw, 18px)',
          background: 'rgba(0,255,136,0.05)',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: '12px',
          fontSize: 'clamp(10px, 1.7vh, 13px)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>📊 Datamu:</span>
        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>Mean = {STATS.mean} jam</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>25/35 siswa ≤ 8 jam</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>n = {STATS.n} siswa</span>
      </motion.div>

      {/* ── Choice Buttons ── */}
      <AnimatePresence mode="wait">
        {!isWrong ? (
          <motion.div
            key="choices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '12px' }}
          >
            {/* BENAR */}
            <motion.button
              whileHover={!submitted ? { scale: 1.02, y: -2 } : {}}
              whileTap={!submitted ? { scale: 0.97 } : {}}
              onClick={() => !submitted && setSelected('benar')}
              disabled={submitted}
              style={{
                flex: 1,
                padding: 'clamp(12px, 2.2vh, 18px)',
                borderRadius: '14px',
                border: selected === 'benar'
                  ? '2px solid #00FF88'
                  : '2px solid rgba(255,255,255,0.12)',
                background: selected === 'benar'
                  ? 'rgba(0,255,136,0.1)'
                  : 'rgba(255,255,255,0.03)',
                color: '#fff',
                cursor: submitted ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 'clamp(26px, 4.5vh, 36px)' }}>✅</span>
              <span style={{
                fontWeight: 900,
                fontSize: 'clamp(13px, 2.2vh, 17px)',
                color: selected === 'benar' ? '#00FF88' : 'rgba(255,255,255,0.8)',
                letterSpacing: '0.5px',
              }}>BENAR</span>
              <span style={{ fontSize: 'clamp(9px, 1.4vh, 11px)', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                Klaim didukung data
              </span>
            </motion.button>

            {/* HOAKS */}
            <motion.button
              whileHover={!submitted ? { scale: 1.02, y: -2 } : {}}
              whileTap={!submitted ? { scale: 0.97 } : {}}
              onClick={() => !submitted && setSelected('hoaks')}
              disabled={submitted}
              style={{
                flex: 1,
                padding: 'clamp(12px, 2.2vh, 18px)',
                borderRadius: '14px',
                border: selected === 'hoaks'
                  ? '2px solid #FF3366'
                  : '2px solid rgba(255,255,255,0.12)',
                background: selected === 'hoaks'
                  ? 'rgba(255,51,102,0.1)'
                  : 'rgba(255,255,255,0.03)',
                color: '#fff',
                cursor: submitted ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 'clamp(26px, 4.5vh, 36px)' }}>❌</span>
              <span style={{
                fontWeight: 900,
                fontSize: 'clamp(13px, 2.2vh, 17px)',
                color: selected === 'hoaks' ? '#FF3366' : 'rgba(255,255,255,0.8)',
                letterSpacing: '0.5px',
              }}>HOAKS / MISLEADING</span>
              <span style={{ fontSize: 'clamp(9px, 1.4vh, 11px)', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                Klaim tidak sesuai data
              </span>
            </motion.button>
          </motion.div>
        ) : (
          /* Wrong answer feedback */
          <motion.div
            key="wrong"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '14px',
              padding: 'clamp(12px, 2vh, 18px) clamp(16px, 2.5vw, 22px)',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}
          >
            <div style={{ fontWeight: 800, color: '#FF5050', fontSize: 'clamp(12px, 2vh, 15px)' }}>
              🤔 Hmm, coba pikir lagi!
            </div>
            <p style={{ margin: 0, fontSize: 'clamp(11px, 1.8vh, 14px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              {guidedMode
                ? `Mean sebenarnya adalah ${STATS.mean} jam — bukan lebih dari 8 jam. Apakah klaim tersebut didukung data? 🔍`
                : 'Perhatikan mean yang sudah kamu hitung. Apakah mayoritas siswa benar-benar menghabiskan >8 jam?'}
            </p>
            <button
              className="game-btn game-btn-secondary"
              onClick={handleRetry}
              style={{ fontSize: 'clamp(11px, 1.8vh, 13px)', padding: '8px 20px', alignSelf: 'flex-start' }}
            >
              Coba Lagi →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit button ── */}
      {!isWrong && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: selected && !submitted ? 1 : 0.35 }}
          className="game-btn game-btn-primary"
          onClick={handleSubmit}
          disabled={!selected || submitted}
          style={{
            width: '100%',
            fontSize: 'clamp(12px, 2vh, 15px)',
            padding: 'clamp(10px, 1.8vh, 14px)',
            cursor: selected && !submitted ? 'pointer' : 'not-allowed',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {submitted ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity }}>⚙️</motion.span>
              Memproses...
            </span>
          ) : (
            'Tetapkan Jawaban →'
          )}
        </motion.button>
      )}
    </motion.div>
  )
}
