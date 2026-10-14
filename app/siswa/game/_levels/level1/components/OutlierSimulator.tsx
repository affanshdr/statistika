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
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
      border: '1.5px solid rgba(56, 189, 248, 0.35)',
      borderRadius: 16,
      padding: '16px 18px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 16px rgba(56, 189, 248, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔬</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#38BDF8', letterSpacing: '0.4px' }}>
              SIMULATOR INTERAKTIF: EFEK PENCILAN (OUTLIER)
            </div>
            <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
              Bandingkan sensitivitas Rata-rata (Mean) vs Ketahanan (Resistensi) Median
            </div>
          </div>
        </div>

        <span style={{
          background: excludeOutliers ? 'rgba(245, 158, 11, 0.18)' : 'rgba(56, 189, 248, 0.18)',
          border: `1px solid ${excludeOutliers ? '#F59E0B' : '#38BDF8'}`,
          color: excludeOutliers ? '#FCD34D' : '#7DD3FC',
          fontSize: 10,
          fontWeight: 800,
          padding: '3px 10px',
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
            border: !excludeOutliers ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.12)',
            background: !excludeOutliers ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
            color: !excludeOutliers ? '#FFFFFF' : '#94A3B8',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
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
            border: excludeOutliers ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.12)',
            background: excludeOutliers ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
            color: excludeOutliers ? '#FDE68A' : '#94A3B8',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
        >
          <span>✂️</span>
          <span>2. Saring Outlier ({outliers.length} Siswa &gt; 14 jam)</span>
        </button>
      </div>

      {/* Outlier Data Badge Visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 10 }}>
        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Data Terdeteksi Outlier:</span>
        {outliers.map((val, idx) => (
          <span
            key={idx}
            style={{
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              background: excludeOutliers ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.35)',
              border: '1px solid #EF4444',
              color: '#FCA5A5',
              textDecoration: excludeOutliers ? 'line-through' : 'none',
              opacity: excludeOutliers ? 0.45 : 1,
              transition: 'all 0.2s'
            }}
          >
            {val} jam
          </span>
        ))}
        {excludeOutliers && (
          <span style={{ fontSize: 10.5, color: '#F59E0B', fontStyle: 'italic', marginLeft: 4 }}>
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
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.4px' }}>
              RATA-RATA (MEAN)
            </span>
            <span style={{ fontSize: 10, color: '#F87171', fontWeight: 800 }}>⚡ SENSITIF</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace' }}>
              {currentMean}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>jam/hari</span>
          </div>
          <div style={{ fontSize: 10.5, color: excludeOutliers ? '#10B981' : '#94A3B8', marginTop: 2 }}>
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
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', letterSpacing: '0.4px' }}>
              NILAI TENGAH (MEDIAN)
            </span>
            <span style={{ fontSize: 10, color: '#34D399', fontWeight: 800 }}>🛡️ RESISTEN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace' }}>
              {currentMedian}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>jam/hari</span>
          </div>
          <div style={{ fontSize: 10.5, color: '#34D399', marginTop: 2 }}>
            {Math.abs(medianAll - medianClean) < 0.1
              ? `✅ Tetap stabil di ${medianClean} jam (kebal dari pencilan)!`
              : `Perubahan sangat minim: hanya ${(medianAll - medianClean).toFixed(1)} jam`}
          </div>
        </motion.div>
      </div>

      {/* Pedagogical Insight Box */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 11.5,
        color: '#FDE68A',
        lineHeight: 1.55
      }}>
        💡 <strong>Kunci Literasi Data (HOTS Evaluasi):</strong><br />
        Ketika suatu distribusi data memiliki <em>outlier</em> ekstrem, <strong>Mean</strong> mudah sekali terdistorsi sehingga tampak sangat besar (misleading). Sebaliknya, <strong>Median</strong> jauh lebih akurat menggambarkan kebiasaan mayoritas siswa karena tahan terhadap pencilan!
      </div>
    </div>
  )
}
