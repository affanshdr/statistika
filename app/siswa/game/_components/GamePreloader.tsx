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
  subtitle = 'Level 1: The Viral Myth',
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
          background: 'radial-gradient(circle at center, #0B1E2C 0%, #04070A 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#F8FAFC',
          userSelect: 'none',
        }}
      >
        {/* Animated Cyber Grid Overlay Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(0, 173, 181, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.7,
        }} />

        {/* Center Card Container */}
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          style={{
            maxWidth: 500,
            width: '100%',
            background: 'rgba(15, 35, 56, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(0, 173, 181, 0.4)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 173, 181, 0.25)',
            borderRadius: 24,
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Animated Icon Header */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
              border: '2px solid #00ADB5',
              boxShadow: '0 0 20px rgba(0, 173, 181, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            🕵️‍♂️
          </motion.div>

          {/* Title & Subtitle */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#00ADB5', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>
              {title}
            </div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.3px' }}>
              {subtitle}
            </h2>
          </div>

          {/* Loading Progress Bar Container */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 800 }}>
              <span style={{ color: '#94A3B8' }}>{statusText}</span>
              <span style={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: 900 }}>{progress}%</span>
            </div>

            {/* Progress Track */}
            <div style={{
              width: '100%',
              height: 12,
              background: 'rgba(4, 7, 10, 0.75)',
              border: '1px solid rgba(0, 173, 181, 0.3)',
              borderRadius: 8,
              padding: 2,
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.6)',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #00ADB5 0%, #38BDF8 50%, #34D399 100%)',
                  boxShadow: '0 0 12px rgba(0, 173, 181, 0.7)',
                  width: `${progress}%`,
                }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              />
            </div>
          </div>

          {/* Trivia / Tips Box */}
          <div style={{
            width: '100%',
            background: 'rgba(4, 7, 10, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            padding: '12px 14px',
            fontSize: 12,
            color: '#CBD5E1',
            lineHeight: 1.55,
            textAlign: 'center',
            fontWeight: 600,
          }}>
            {triviaText}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
