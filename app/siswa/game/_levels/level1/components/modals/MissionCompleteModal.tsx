'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

export interface MissionCompleteModalProps {
  stars: number
  elapsedSeconds: number
  rawElapsedSeconds?: number
  mistakeCount?: number
  penaltySeconds?: number
  onFinish: () => void
}

export default function MissionCompleteModal({
  stars,
  elapsedSeconds,
  rawElapsedSeconds,
  mistakeCount = 0,
  penaltySeconds,
  onFinish,
}: MissionCompleteModalProps) {
  const mistakes = mistakeCount
  const penalty = penaltySeconds ?? (mistakes * 30)
  const rawSeconds = rawElapsedSeconds ?? Math.max(0, elapsedSeconds - penalty)
  const totalSeconds = elapsedSeconds

  const rawMin = Math.floor(rawSeconds / 60)
  const rawSec = rawSeconds % 60
  const formattedRawTime = `${String(rawMin).padStart(2, '0')}:${String(rawSec).padStart(2, '0')}`

  const totalMin = Math.floor(totalSeconds / 60)
  const totalSec = totalSeconds % 60
  const formattedTotalTime = `${String(totalMin).padStart(2, '0')}:${String(totalSec).padStart(2, '0')}`

  const starLostDueToPenalty = rawSeconds <= 360 && totalSeconds > 360

  const ratingInfo = useMemo(() => {
    if (stars === 3) {
      return {
        title: '⭐⭐⭐ Detektif Elit!',
        subtitle: 'Luar biasa! Analisis statistik tuntas sangat cepat dalam durasi < 6 menit.',
        color: '#D97706',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeBorder: 'rgba(245, 158, 11, 0.4)',
      }
    }
    if (stars === 2) {
      return {
        title: '⭐⭐ Detektif Terlatih!',
        subtitle: 'Bagus sekali! Investigasi selesai dengan cermat & tepat sasaran (durasi 6 - 10 menit).',
        color: '#2563EB',
        badgeBg: 'rgba(37, 99, 235, 0.12)',
        badgeBorder: 'rgba(37, 99, 235, 0.35)',
      }
    }
    return {
      title: '⭐ Detektif Pemula!',
      subtitle: 'Misi terselesaikan! Terus berlatih untuk mempercepat analisis datamu (> 10 menit).',
      color: '#059669',
      badgeBg: 'rgba(5, 150, 105, 0.12)',
      badgeBorder: 'rgba(5, 150, 105, 0.35)',
    }
  }, [stars])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 20, 30, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FDF7EA 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          padding: 'clamp(20px, 3vh, 28px) clamp(18px, 2.5vw, 26px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: '#2D1A12',
          fontFamily: 'var(--font-ui, sans-serif)',
        }}
      >
        {/* Ornate Brass Corners */}
        <div style={{ position: 'absolute', top: 6, left: 6, width: 14, height: 14, borderTop: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderTop: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 14, borderBottom: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderBottom: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239', pointerEvents: 'none' }} />

        {/* Top Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '50px', padding: '3px 14px', fontSize: '11px', fontWeight: 900, color: '#B45309', letterSpacing: '0.5px', marginBottom: '8px' }}>
          <span>🏆</span>
          <span>MISI LEVEL 1 SELESAI</span>
        </div>

        {/* Modal Title */}
        <h2 style={{ margin: '4px 0 2px', fontSize: 'clamp(24px, 3.5vh, 28px)', fontWeight: 900, color: '#3E2723', letterSpacing: '-0.5px' }}>
          Misi Selesai
        </h2>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350F', marginBottom: '14px' }}>
          Analisis Ukuran Pemusatan Data • SMP Negeri
        </div>

        {/* 3 Large Animated Stars Container */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          margin: '10px 0 12px',
          padding: '10px 0',
          background: 'radial-gradient(ellipse at center, rgba(254, 243, 199, 0.7) 0%, rgba(254, 243, 199, 0) 70%)',
        }}>
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15 + starIdx * 0.18,
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                }}
                style={{
                  fontSize: starIdx === 2 ? 'clamp(52px, 7.5vh, 60px)' : 'clamp(42px, 6vh, 48px)',
                  lineHeight: 1,
                  filter: isEarned ? 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.6))' : 'none',
                  color: isEarned ? '#F59E0B' : 'rgba(140, 98, 57, 0.22)',
                  transition: 'all 0.2s ease',
                }}
              >
                ★
              </motion.div>
            )
          })}
        </div>

        {/* Star Rating Info Pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            background: ratingInfo.badgeBg,
            border: `1.5px solid ${ratingInfo.badgeBorder}`,
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 900, color: ratingInfo.color, marginBottom: '3px' }}>
            {ratingInfo.title}
          </div>
          <div style={{ fontSize: '11.5px', color: '#573016', lineHeight: 1.4, fontWeight: 600 }}>
            {ratingInfo.subtitle}
          </div>
        </motion.div>

        {/* Performance Statistics Grid: Waktu & Penalti */}
        <div style={{
          background: '#FFFDF9',
          border: '1.5px solid #D6C29E',
          borderRadius: '14px',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 2px 6px rgba(140, 98, 57, 0.08)',
          textAlign: 'left',
        }}>
          {/* Row 1: Waktu Murni & Sanksi Kesalahan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Waktu Murni */}
            <div style={{
              background: 'rgba(140, 98, 57, 0.05)',
              borderRadius: '10px',
              padding: '8px 10px',
              border: '1px solid rgba(140, 98, 57, 0.15)',
            }}>
              <div style={{ fontSize: '9.5px', color: '#8C6239', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                ⏱️ Waktu Pengerjaan
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#3E2723', fontFamily: 'monospace', marginTop: '2px' }}>
                {formattedRawTime}
              </div>
            </div>

            {/* Sanksi Kesalahan */}
            <div style={{
              background: mistakes > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              borderRadius: '10px',
              padding: '8px 10px',
              border: `1px solid ${mistakes > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}>
              <div style={{ fontSize: '9.5px', color: mistakes > 0 ? '#B91C1C' : '#047857', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {mistakes > 0 ? '⚠️ Sanksi Kesalahan' : '✨ Bebas Kesalahan'}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 900, color: mistakes > 0 ? '#DC2626' : '#059669', marginTop: '2px' }}>
                {mistakes > 0 ? `${mistakes}x Salah (+${penalty}s)` : '0x Salah (+0s)'}
              </div>
            </div>
          </div>

          {/* Row 2: Total Waktu Akhir (Digunakan untuk Penentuan Bintang) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.14) 100%)',
            border: '1.5px solid #F59E0B',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🏁 Total Waktu Akhir
              </div>
              <div style={{ fontSize: '10.5px', color: '#B45309', fontWeight: 700 }}>
                {stars === 3 ? 'Kategori Cepat (< 06:00)' : stars === 2 ? 'Kategori Standar (06:00 - 10:00)' : 'Kategori Santai (> 10:00)'}
              </div>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#78350F',
              fontFamily: 'monospace',
              background: '#FFFDF9',
              padding: '3px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}>
              {formattedTotalTime}
            </div>
          </div>

          {/* Optional notice if penalty dropped rating from 3 to 2 stars */}
          {starLostDueToPenalty && (
            <div style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: '#B91C1C',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              ⚠️ Penalti waktu +{penalty}s membuat total waktu &gt; 06:00 (bintang 2)
            </div>
          )}
        </div>

        {/* Result Status Badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>✅</span>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065F46' }}>
            HASIL: Perhitungan Median, Modus, dan Rata-rata <strong>Lengkap & Siap Digunakan</strong>
          </span>
        </div>

        {/* Primary Action Button: Selesai */}
        <button
          data-testid="btn-mission-complete-finish"
          onClick={() => {
            gameAudio.playClick()
            onFinish()
          }}
          style={{
            width: '100%',
            padding: '13px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <span>Selesai</span>
          <span style={{ fontSize: '16px' }}>➔</span>
        </button>
      </motion.div>
    </div>
  )
}
