'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATS } from '../_data/level1'
import DiRA from './DiRA'

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
  const [isMobile, setIsMobile] = useState(false)
  const [showDira, setShowDira] = useState(true)
  const [diraMsg, setDiraMsg] = useState(
    'Kamu sudah melihat datanya. Sekarang, ingat postingan viral di awal tadi? Berdasarkan analisis statistikmu — apakah klaim tersebut benar atau hoaks?'
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSubmit = () => {
    if (!selected) return
    setSubmitted(true)
    if (selected === 'hoaks') {
      // Jawaban benar — tapi bukan hoaks murni, misleading
      setTimeout(() => onCorrect(), 1200)
    } else {
      setIsWrong(true)
      setDiraMsg(
        guidedMode
          ? `Hmm, perhatikan mean = ${STATS.mean} jam. Apakah itu lebih dari 8 jam? 🤔`
          : 'Perhatikan mean yang sudah kamu hitung. Apakah mayoritas siswa benar-benar menghabiskan >8 jam?'
      )
      setShowDira(true)
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
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* 2-Column layout: Left column has post and data reminder, Right column has question, choices, and submit button */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '24px',
        alignItems: 'stretch',
        width: '100%',
      }}>
        {/* Left Column */}
        <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          {/* ── Viral Post (Mockup Instagram Card) ── */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="instagram-card"
            style={{
              width: '100%',
              background: '#000',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              color: '#fff',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#000',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '12px',
                    color: '#000'
                  }}>
                    P
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>pinterpolitik</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" style={{ fill: '#3897f0', marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <div style={{ color: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>•••</div>
            </div>

            {/* Post Image Body */}
            <div style={{
              background: '#fff',
              position: 'relative',
              height: isMobile ? '230px' : '260px',
              overflow: 'hidden',
              display: 'flex',
              color: '#000',
              flexShrink: 0,
            }}>
              {/* Left Text */}
              <div style={{
                flex: 1,
                padding: '16px 0px 16px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                zIndex: 2,
                lineHeight: 1.1,
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#c90000',
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                }}>
                  BREAKING:
                </div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#000',
                  fontFamily: '"Arial Narrow", Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                }}>
                  <span>Remaja Indonesia</span>
                  <span>rata-rata</span>
                  <span>habiskan</span>
                  <span style={{ color: '#c90000' }}>&gt;8 jam</span>
                  <span style={{ color: '#c90000' }}>sehari di</span>
                  <span style={{ color: '#c90000' }}>medsos!</span>
                  <span style={{ marginTop: '4px', fontSize: '13px', fontWeight: 800 }}>Generasi cemas</span>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>kecanduan HP!</span>
                </div>
              </div>

              {/* Right Silhouette Image */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60%',
                height: '100%',
                zIndex: 1,
              }}>
                <img
                  src="/teen_silhouette.png"
                  alt="Teen Silhouette"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px 6px',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ❤️ <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>12,9rb</span>
                </span>
                <span style={{
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  💬 <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>1.134</span>
                </span>
                <span style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✈️ <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>3.560</span>
                </span>
              </div>
              <span style={{ cursor: 'pointer', fontSize: '14px' }}>🔖</span>
            </div>

            {/* Caption Info */}
            <div style={{
              padding: '0 14px 12px',
              fontSize: '11px',
              lineHeight: 1.3,
              color: '#fff',
            }}>
              <div style={{ marginBottom: '4px', color: '#fff' }}>
                Disukai oleh <strong>edukasi.kompas</strong> dan <strong>lainnya</strong>
              </div>
              <div>
                <strong>pinterpolitik</strong> Sebuah studi terbaru mengungkap fakta mencengangkan: remaja Indonesia rata-rata menghabiskan lebih dari 8 jam sehari di media sosial!... <span style={{ color: '#fff', cursor: 'pointer' }}>selengkapnya</span>
              </div>
            </div>
          </motion.div>

          {/* ── Data reminder strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
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
        </div>

        {/* Right Column */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 'clamp(14px, 2.5vh, 18px)', fontWeight: 800, color: '#fff', textAlign: isMobile ? 'center' : 'left' }}>
            Apakah klaim tersebut benar atau hoaks?
          </h3>

          {/* ── Choice Buttons / Error Feedback ── */}
          <AnimatePresence mode="wait">
            {!isWrong ? (
              <motion.div
                key="choices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {/* BENAR */}
                <motion.button
                  whileHover={!submitted ? { scale: 1.015, y: -1 } : {}}
                  whileTap={!submitted ? { scale: 0.98 } : {}}
                  onClick={() => !submitted && setSelected('benar')}
                  disabled={submitted}
                  style={{
                    padding: 'clamp(12px, 2vh, 16px)',
                    borderRadius: '14px',
                    border: selected === 'benar'
                      ? '2px solid #00FF88'
                      : '2px solid rgba(255,255,255,0.12)',
                    background: selected === 'benar'
                      ? 'rgba(0,255,136,0.1)'
                      : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    cursor: submitted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center', gap: '14px',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>✅</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{
                      fontWeight: 900,
                      fontSize: '15px',
                      color: selected === 'benar' ? '#00FF88' : 'rgba(255,255,255,0.85)',
                      letterSpacing: '0.5px',
                    }}>BENAR</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                      Klaim didukung data
                    </span>
                  </div>
                </motion.button>

                {/* HOAKS */}
                <motion.button
                  whileHover={!submitted ? { scale: 1.015, y: -1 } : {}}
                  whileTap={!submitted ? { scale: 0.98 } : {}}
                  onClick={() => !submitted && setSelected('hoaks')}
                  disabled={submitted}
                  style={{
                    padding: 'clamp(12px, 2vh, 16px)',
                    borderRadius: '14px',
                    border: selected === 'hoaks'
                      ? '2px solid #FF3366'
                      : '2px solid rgba(255,255,255,0.12)',
                    background: selected === 'hoaks'
                      ? 'rgba(255,51,102,0.1)'
                      : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    cursor: submitted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center', gap: '14px',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>❌</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{
                      fontWeight: 900,
                      fontSize: '15px',
                      color: selected === 'hoaks' ? '#FF3366' : 'rgba(255,255,255,0.85)',
                      letterSpacing: '0.5px',
                    }}>HOAKS / MISLEADING</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                      Klaim tidak sesuai data
                    </span>
                  </div>
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
                <div style={{ fontWeight: 800, color: '#FF5050', fontSize: '14px' }}>
                  🤔 Hmm, coba pikir lagi!
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  {guidedMode
                    ? `Mean sebenarnya adalah ${STATS.mean} jam — bukan lebih dari 8 jam. Apakah klaim tersebut didukung data? 🔍`
                    : 'Perhatikan mean yang sudah kamu hitung. Apakah mayoritas siswa benar-benar menghabiskan >8 jam?'}
                </p>
                <button
                  className="game-btn game-btn-secondary"
                  onClick={handleRetry}
                  style={{ fontSize: '12px', padding: '8px 20px', alignSelf: 'flex-start' }}
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
                fontSize: '14px',
                padding: '12px 20px',
                cursor: selected && !submitted ? 'pointer' : 'not-allowed',
                position: 'relative', overflow: 'hidden',
                boxShadow: selected && !submitted ? 'var(--accent-glow)' : 'none',
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
        </div>
      </div>

      {showDira && diraMsg && (
        <DiRA message={diraMsg} onDismiss={() => setShowDira(false)} />
      )}
    </motion.div>
  )
}
