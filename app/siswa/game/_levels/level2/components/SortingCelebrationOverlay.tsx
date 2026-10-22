'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ComputedStats, formatDistance } from '../data/level2StatData'

interface SortingCelebrationOverlayProps {
  stats: ComputedStats
  onProceed: () => void
  playSound: (type: 'chime' | 'whistle') => void
}

export default function SortingCelebrationOverlay({
  stats,
  onProceed,
  playSound,
}: SortingCelebrationOverlayProps) {
  useEffect(() => {
    playSound('chime')
    const t = setTimeout(() => {
      playSound('whistle')
    }, 600)
    return () => clearTimeout(t)
  }, [playSound])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.94) 0%, rgba(7, 19, 30, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#FFFFFF',
      }}
    >
      {/* Floating Sparkles and Confetti Ribbons */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            initial={{
              y: '-10%',
              x: `${(i / 28) * 100}%`,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              rotate: 360 * (i % 2 === 0 ? 2 : -2),
              opacity: [1, 1, 0.2],
            }}
            transition={{
              duration: 3 + (i % 5) * 0.4,
              repeat: Infinity,
              delay: (i % 7) * 0.25,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? '14px' : '8px',
              height: i % 3 === 0 ? '24px' : '12px',
              borderRadius: '3px',
              background:
                i % 4 === 0
                  ? '#F59E0B'
                  : i % 4 === 1
                  ? '#10B981'
                  : i % 4 === 2
                  ? '#38BDF8'
                  : '#EC4899',
            }}
          />
        ))}
      </div>

      {/* Main Celebration Card */}
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18 }}
        style={{
          position: 'relative',
          maxWidth: '820px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          borderRadius: '24px',
          border: '2px solid #10B981',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(16, 185, 129, 0.35)',
          padding: '32px 28px',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Animated Icon & Trophy */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontSize: '56px', marginBottom: '8px' }}
        >
          🚩 ⭐ 🏆
        </motion.div>

        {/* Victory Title */}
        <h2
          style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 900,
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #34D399, #FBBF24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}
        >
          BENDERA BERHASIL DIURUTKAN!
        </h2>

        <p style={{ color: '#CBD5E1', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.6 }}>
          Ketua Kelas Aditya telah menata seluruh 10 bendera lemparan ke dalam kotak terurut secara presisi dari yang terkecil sampai terbesar.
          Data terurut ini merupakan pondasi utama statistika!
        </p>

        {/* Visual Sorted Wave of Flags */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '16px 12px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 800,
              color: '#94A3B8',
              marginBottom: '10px',
              padding: '0 8px',
            }}
          >
            <span style={{ color: '#38BDF8' }}>◀ Terkecil (Min): {formatDistance(stats.min)}m</span>
            <span style={{ color: '#F59E0B' }}>Total: 10 Data Lemparan Terurut</span>
            <span style={{ color: '#EF4444' }}>Terbesar (Max): {formatDistance(stats.max)}m ▶</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
              gap: '6px',
              overflowX: 'auto',
            }}
          >
            {stats.sortedStudents.map((student, idx) => (
              <motion.div
                key={`sorted-flag-${student.studentId}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
                style={{
                  background:
                    idx === 0
                      ? 'rgba(56, 189, 248, 0.25)'
                      : idx === 9
                      ? 'rgba(239, 68, 68, 0.25)'
                      : idx === 4 || idx === 5
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(16, 185, 129, 0.15)',
                  border:
                    idx === 0
                      ? '1.5px solid #38BDF8'
                      : idx === 9
                      ? '1.5px solid #EF4444'
                      : idx === 4 || idx === 5
                      ? '1.5px solid #F59E0B'
                      : '1px solid #10B981',
                  borderRadius: '8px',
                  padding: '6px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 800 }}>Kotak #{idx + 1}</span>
                <span style={{ fontSize: '13px', margin: '2px 0' }}>🚩</span>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFFFFF' }}>
                  {formatDistance(student.distance)}m
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Speech Bubble from Ketua Kelas */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            borderLeft: '4px solid #F59E0B',
            borderRadius: '0 12px 12px 0',
            padding: '12px 16px',
            textAlign: 'left',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '28px' }}>🧑‍✈️</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#FCD34D' }}>
              Aditya (Ketua Kelas):
            </div>
            <div style={{ fontSize: '12px', color: '#E2E8F0', marginTop: '2px' }}>
              &ldquo;Semua bendera sudah berbaris rapi dari {formatDistance(stats.min)}m hingga {formatDistance(stats.max)}m! Kini seluruh bendera diurutkan sejajar di tengah lapangan. Ayo gerakkan Stevunt untuk menentukan letak Kuartil Q1, Q2 (Median), dan Q3!&rdquo;
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onProceed}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            border: 'none',
            borderRadius: '14px',
            color: '#FFFFFF',
            padding: '14px 36px',
            fontSize: '14px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)',
            letterSpacing: '0.5px',
          }}
        >
          LANJUT KE MISI KUARTIL (Q1, Q2, Q3) ▶
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
