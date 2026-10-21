'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

interface OutlierSimulatorProps {
  dataset: number[]
  onExplored?: () => void
}

export default function OutlierSimulator({ dataset, onExplored }: OutlierSimulatorProps) {
  const [excludeOutliers, setExcludeOutliers] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Identify outliers (screen time >= 14 or > 12)
  const isOutlier = (val: number) => val >= 14
  const outliers = dataset.filter(isOutlier)
  const nonOutliers = dataset.filter(v => !isOutlier(v))

  // Dataset currently active in the simulation
  const activeData = excludeOutliers ? nonOutliers : dataset

  // Helper functions
  const calcSum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
  const calcMean = (arr: number[]) => Number((calcSum(arr) / arr.length).toFixed(2))
  const calcMedian = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(s.length / 2)
    return s.length % 2 === 0 ? Number(((s[mid - 1] + s[mid]) / 2).toFixed(1)) : s[mid]
  }

  const meanAll = calcMean(dataset)
  const medianAll = calcMedian(dataset)

  const meanClean = calcMean(nonOutliers)
  const medianClean = calcMedian(nonOutliers)

  const currentMean = excludeOutliers ? meanClean : meanAll
  const currentMedian = excludeOutliers ? medianClean : medianAll
  const currentN = activeData.length

  const handleToggle = (exclude: boolean) => {
    setExcludeOutliers(exclude)
    setHasInteracted(true)
    gameAudio.playOutlierMorph(exclude)
    if (onExplored) onExplored()
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
      border: '2.5px solid #8C6239',
      borderRadius: 20,
      padding: '18px 20px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25), inset 0 0 20px rgba(180, 140, 80, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      color: '#362014',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid rgba(140, 98, 57, 0.25)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🔬</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#9A3412', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              SIMULATOR INTERAKTIF: EFEK PENCILAN (OUTLIER)
            </div>
            <div style={{ fontSize: 11, color: '#5C3D1E', fontWeight: 600 }}>
              Bandingkan sensitivitas Rata-rata (Mean) vs Ketahanan (Resistensi) Median
            </div>
          </div>
        </div>

        <span style={{
          background: '#FEF3C7',
          border: '1.5px solid #8C6239',
          color: '#9A3412',
          fontSize: 10.5,
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 20
        }}>
          {excludeOutliers ? `Tanpa Outlier (n = ${currentN})` : `Semua Data (n = ${currentN})`}
        </span>
      </div>

      {/* Interactive Toggle Pill Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={() => handleToggle(false)}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: !excludeOutliers ? '2px solid #0E8388' : '1.5px solid #B48C50',
            background: !excludeOutliers ? 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)' : '#FFFDF7',
            color: !excludeOutliers ? '#FFFFFF' : '#6B4226',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
            boxShadow: !excludeOutliers ? '0 4px 12px rgba(14, 131, 136, 0.35)' : 'none',
          }}
        >
          <span>📊</span>
          <span>1. Sertakan Semua ({dataset.length} Siswa)</span>
        </button>

        <button
          onClick={() => handleToggle(true)}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: excludeOutliers ? '2px solid #D97706' : '1.5px solid #B48C50',
            background: excludeOutliers ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' : '#FFFDF7',
            color: excludeOutliers ? '#FFFFFF' : '#6B4226',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
            boxShadow: excludeOutliers ? '0 4px 12px rgba(217, 119, 6, 0.35)' : 'none',
          }}
        >
          <span>✂️</span>
          <span>2. Saring Outlier ({outliers.length} Siswa &gt; 14 jam)</span>
        </button>
      </div>

      {/* Outlier Data Badge Visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', background: '#FFFDF7', border: '1px solid #B48C50', padding: '8px 12px', borderRadius: 10 }}>
        <span style={{ fontSize: 11, color: '#5C3D1E', fontWeight: 700 }}>Data Terdeteksi Outlier:</span>
        {outliers.map((val, idx) => (
          <span
            key={idx}
            style={{
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              background: excludeOutliers ? '#FEE2E2' : '#FCA5A5',
              border: '1px solid #DC2626',
              color: '#991B1B',
              textDecoration: excludeOutliers ? 'line-through' : 'none',
              opacity: excludeOutliers ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {val} jam
          </span>
        ))}
        {excludeOutliers && (
          <span style={{ fontSize: 10.5, color: '#9A3412', fontStyle: 'italic', fontWeight: 700, marginLeft: 4 }}>
            (Dinonaktifkan sementara dari perhitungan)
          </span>
        )}
      </div>

      {/* Dynamic Metric Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Mean Card */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
          style={{
            background: '#FFFDF7',
            border: '1.5px solid #B48C50',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            boxShadow: '0 2px 8px rgba(140, 98, 57, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#9A3412', letterSpacing: '0.4px' }}>
              RATA-RATA (MEAN)
            </span>
            <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 900 }}>⚡ SENSITIF</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#362014', fontFamily: 'monospace' }}>
              {currentMean}
            </span>
            <span style={{ fontSize: 12, color: '#6B4226', fontWeight: 700 }}>jam/hari</span>
          </div>
          <div style={{ fontSize: 10.5, color: excludeOutliers ? '#059669' : '#5C3D1E', marginTop: 2, fontWeight: 700 }}>
            {excludeOutliers
              ? `📉 Anjlok sebesar ${(meanAll - meanClean).toFixed(2)} jam tanpa outlier!`
              : `📈 Terkerek naik akibat data ekstrem ${outliers.join(', ')} jam`}
          </div>
        </motion.div>

        {/* Median Card */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
          style={{
            background: '#FFFDF7',
            border: '1.5px solid #B48C50',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            boxShadow: '0 2px 8px rgba(140, 98, 57, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#059669', letterSpacing: '0.4px' }}>
              NILAI TENGAH (MEDIAN)
            </span>
            <span style={{ fontSize: 10, color: '#059669', fontWeight: 900 }}>🛡️ RESISTEN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#362014', fontFamily: 'monospace' }}>
              {currentMedian}
            </span>
            <span style={{ fontSize: 12, color: '#6B4226', fontWeight: 700 }}>jam/hari</span>
          </div>
          <div style={{ fontSize: 10.5, color: '#059669', marginTop: 2, fontWeight: 700 }}>
            {Math.abs(medianAll - medianClean) < 0.1
              ? `✅ Tetap stabil di ${medianClean} jam (kebal dari pencilan)!`
              : `Perubahan sangat minim: hanya ${(medianAll - medianClean).toFixed(1)} jam`}
          </div>
        </motion.div>
      </div>

      {/* Pedagogical Insight Box */}
      <div style={{
        background: '#FEF3C7',
        border: '1.5px solid #D97706',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 11.5,
        color: '#78350F',
        lineHeight: 1.55
      }}>
        💡 <strong>Kunci Literasi Data (HOTS Evaluasi):</strong><br />
        Ketika suatu distribusi data memiliki <em>outlier</em> ekstrem, <strong>Mean</strong> mudah sekali terdistorsi sehingga tampak sangat besar (misleading). Sebaliknya, <strong>Median</strong> jauh lebih akurat menggambarkan kebiasaan mayoritas siswa karena tahan terhadap pencilan!
      </div>
    </div>
  )
}
