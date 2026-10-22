'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STAT_TRIVIA = [
  '💡 Rentang (Range) adalah selisih antara nilai terbesar dan nilai terkecil dari sekumpulan data.',
  '💡 Tabel Distribusi Frekuensi membantu mengelompokkan data mentah agar lebih mudah dianalisis.',
  '💡 Tepi Bawah kelas interval dihitung dengan mengurangi batas bawah dengan 0.5.',
  '💡 Mean adalah nilai rata-rata, Median adalah nilai tengah, dan Modus adalah nilai paling sering muncul.',
  '💡 Selalu lakukan verifikasi data dan cek sumber berita sebelum membagikan informasi di media sosial!',
  '💡 Histrogram menyajikan distribusi frekuensi dalam bentuk grafik batang yang saling bersisian.'
]

interface GamePreloaderProps {
  title?: string
  subtitle?: string
  imagesToPreload?: string[]
  minDurationMs?: number
  onComplete: () => void
}

export default function GamePreloader({
  title = 'MEMUAT INVESTIGASI',
  subtitle = 'Kasus 1: Misteri Jam Layar',
  imagesToPreload = [],
  minDurationMs = 1400,
  onComplete
}: GamePreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Menginisialisasi Sistem...')
  const [triviaText] = useState(() => {
    const randomIndex = Math.floor(Math.random() * STAT_TRIVIA.length)
    return STAT_TRIVIA[randomIndex]
  })
  const isDoneRef = useRef(false)

  useEffect(() => {
    const startTime = performance.now()
    let loadedCount = 0
    const totalAssets = Math.max(1, imagesToPreload.length)

    const updateProgress = (targetPercent: number) => {
      setProgress(prev => Math.max(prev, targetPercent))
    }

    if (imagesToPreload.length > 0) {
      imagesToPreload.forEach(src => {
        const img = new Image()
        img.onload = img.onerror = () => {
          loadedCount++
          const realPercent = Math.floor((loadedCount / totalAssets) * 90)
          updateProgress(realPercent)
        }
        img.src = src
      })
    }

    // Smooth progressive timer for seamless visual loading
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime
      const timePercent = Math.min(100, Math.floor((elapsed / minDurationMs) * 100))

      setProgress(prev => {
        const next = Math.max(prev, Math.min(timePercent, 100))

        if (next < 35) {
          setStatusText('Memuat Aset Grafik & Peta Sekolah...')
        } else if (next < 70) {
          setStatusText('Menyiapkan Karakter & NPC Wali Kelas...')
        } else if (next < 95) {
          setStatusText('Menginisialisasi Data Statistik...')
        } else {
          setStatusText('Menyiapkan Arena Misi...')
        }

        if (next >= 100 && !isDoneRef.current) {
          isDoneRef.current = true
          clearInterval(interval)
          setTimeout(() => {
            onComplete()
          }, 250)
        }
        return next
      })
    }, 40)

    return () => clearInterval(interval)
  }, [imagesToPreload, minDurationMs, onComplete])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(20, 10, 5, 0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#362014',
          userSelect: 'none',
        }}
      >
        {/* Center Card Container */}
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          style={{
            maxWidth: 'min(500px, 92vw)',
            maxHeight: '94vh',
            overflowY: 'auto',
            width: '100%',
            background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 25px rgba(251, 191, 36, 0.25)',
            borderRadius: 24,
            padding: 'clamp(20px, 3vh, 32px) clamp(16px, 3.5vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(12px, 2vh, 20px)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Viewfinder Corner Brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '16px', height: '16px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '16px', height: '16px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '16px', height: '16px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0', pointerEvents: 'none' }} />

          {/* Animated Icon Header */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 'clamp(48px, 7vh, 64px)',
              height: 'clamp(48px, 7vh, 64px)',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3D2419 0%, #2D1A12 100%)',
              border: '2.5px solid #F59E0B',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(22px, 3.5vh, 28px)',
            }}
          >
            🕵️‍♂️
          </motion.div>

          {/* Title & Subtitle */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#FBBF24', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>
              {title}
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(15px, 2.2vh, 19px)', fontWeight: 900, color: '#FDE047', letterSpacing: '0.3px' }}>
              {subtitle}
            </h2>
          </div>

          {/* Loading Progress Bar Container */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 800 }}>
              <span style={{ color: '#FEF3C7' }}>{statusText}</span>
              <span style={{ color: '#FBBF24', fontFamily: 'monospace', fontWeight: 900 }}>{progress}%</span>
            </div>

            {/* Progress Track */}
            <div style={{
              width: '100%',
              height: 12,
              background: '#1A0D08',
              border: '1.5px solid #F59E0B',
              borderRadius: 8,
              padding: 2,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                  width: `${progress}%`,
                }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              />
            </div>
          </div>

          {/* Trivia / Tips Box */}
          <div style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1.5px solid #F59E0B',
            borderRadius: 14,
            padding: 'clamp(8px, 1.5vh, 12px) 14px',
            fontSize: 'clamp(11px, 1.6vh, 12px)',
            color: '#FEF3C7',
            lineHeight: 1.5,
            textAlign: 'center',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}>
            {triviaText}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
