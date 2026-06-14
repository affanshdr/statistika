'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATS, CORRECT_TABLE, screenTimeData } from '../_data/level1'

interface DetektivBookletProps {
  mode: 'FI' | 'FD'
  onComplete: () => void
}

const CHAPTERS = [
  {
    id: 'skewness',
    icon: '📈',
    title: 'Distribusi Menceng Kanan (Right-Skewed)',
    subtitle: 'MATERI 1 / 3',
    color: '#3B82F6',
    content: `Distribusi menceng kanan (right-skewed) terjadi ketika data menumpuk di nilai rendah, tetapi memiliki "ekor" panjang ke arah nilai yang lebih tinggi.`,
    contentFD: `Bayangkan nilai ulangan teman-temanmu: kebanyakan dapat nilai 70-80 (banyak yang di sini), tapi ada 1-2 orang yang dapat nilai 95-100. Nah, distribusinya jadi "ekor"-nya ke kanan!`,
    visual: 'skewness',
    keyPoints: [
      { icon: '📊', text: 'Data menumpuk di nilai rendah-sedang (kelas 1-4 dan 5-8)' },
      { icon: '🐍', text: 'Ada "ekor" memanjang ke arah KANAN (nilai tinggi/ekstrem)' },
      { icon: '💡', text: 'Pada data screen time kita: 71.4% siswa bermain <= 8 jam, tapi ada yang bermain hingga 17 dan 18 jam' },
    ],
    diraTip: 'Ingat histogram yang baru kamu buat? Batang paling tinggi ada di kelas 1-4 jam (13 siswa) dan kelas 5-8 jam (12 siswa), terus batangnya makin pendek ke kanan. Itulah ciri khas distribusi menceng kanan! 📈',
  },
  {
    id: 'outlier',
    icon: '🔴',
    title: 'Outlier (Pencilan Data)',
    subtitle: 'MATERI 2 / 3',
    color: '#EF4444',
    content: `Outlier adalah nilai data yang letaknya sangat jauh dari pusat data lainnya. Outlier bisa terjadi karena kondisi ekstrem yang tidak mewakili mayoritas populasi.`,
    contentFD: `Misalnya dari 35 teman, 25 main HP 1-8 jam. Tapi ada yang main sampai 17 dan 18 jam. Kedua angka ekstrem itulah yang kita sebut OUTLIER — si pengecualian yang bikin rata-rata jadi meleset!`,
    visual: 'outlier',
    keyPoints: [
      { icon: '🎯', text: 'Outlier dalam data kita: siswa dengan screen time ekstrem seperti 17 jam dan 18 jam' },
      { icon: '⚠️', text: 'Outlier bisa merusak gambaran "rata-rata" yang sebenarnya' },
      { icon: '🔍', text: 'Detektif data harus selalu mewaspadai outlier sebelum membuat kesimpulan!' },
    ],
    diraTip: 'Dalam data kita, ada outlier berupa nilai ekstrem: siswa yang main HP 17 jam dan 18 jam sehari. Itu angka yang sangat tidak biasa dibanding mayoritas siswa lainnya!',
  },
  {
    id: 'mean-median',
    icon: '⚖️',
    title: 'Kelemahan Mean vs Keunggulan Median',
    subtitle: 'MATERI 3 / 3',
    color: '#F59E0B',
    content: `Mean (rata-rata) sangat sensitif terhadap outlier. Satu nilai ekstrem saja bisa menarik mean ke atas/bawah secara signifikan. Dalam kasus data menceng, Median (nilai tengah) lebih jujur menggambarkan situasi kelompok.`,
    contentFD: `Mean itu kayak teman yang gampang dipengaruhi — 1 orang main HP 18 jam sehari bisa bikin rata-rata semua orang kelihatan tinggi! Sedangkan Median lebih "jujur" — dia lihat nilai yang ada di posisi tengah, tidak peduli outlier.`,
    visual: 'mean-median',
    keyPoints: [
      { icon: '🔢', text: `Mean data kita: ${STATS.mean} jam/hari (tertarik ke atas oleh nilai ekstrem)` },
      { icon: '📍', text: `Median data kita: ${STATS.median} jam/hari (lebih mencerminkan siswa "biasa")` },
      { icon: '🚨', text: `Klaim ">8 jam rata-rata" TIDAK didukung data — mean sebenarnya hanya ${STATS.mean} jam!` },
    ],
    diraTip: `Coba hitung: kalau ada 35 siswa dan 25 diantaranya main 1-8 jam, tapi ada yang main 17 dan 18 jam — apakah adil bilang "rata-rata >8 jam"? Tentu tidak! Median = ${STATS.median} jam jauh lebih representatif.`,
  },
]

function VisualSkewness() {
  const maxF = Math.max(...CORRECT_TABLE.map(b => b.f))
  const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#A78BFA', '#EC4899']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
        {CORRECT_TABLE.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '10px', color: colors[i] ?? '#fff', fontWeight: 700 }}>f={b.f}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: (b.f / maxF) * 80 }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
              style={{ width: '36px', borderRadius: '4px 4px 0 0', background: `${colors[i] ?? '#fff'}cc`, border: `1px solid ${colors[i] ?? '#fff'}`, boxShadow: `0 0 8px ${colors[i] ?? '#fff'}44` }}
            />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{b.kelas}</span>
          </div>
        ))}
        {/* Arrow showing skew direction */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '8px', paddingLeft: '4px' }}>
          <span style={{ fontSize: '11px', color: '#F59E0B' }}>→ ekor kanan</span>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Data menumpuk di kiri, ekor ke kanan = <strong style={{ color: '#3B82F6' }}>Skewed Kanan</strong>
      </div>
    </div>
  )
}

function VisualOutlier() {
  const points = [...screenTimeData].sort((a, b) => a - b)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '320px' }}>
        {points.map((v, i) => {
          const isOutlier = v >= 17
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: isOutlier ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                border: `2px solid ${isOutlier ? '#EF4444' : '#3B82F6'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800,
                color: isOutlier ? '#EF4444' : '#60a5fa',
                boxShadow: isOutlier ? '0 0 12px rgba(239,68,68,0.5)' : 'none',
                animation: isOutlier ? 'pulse 2s infinite' : 'none',
              }}
            >
              {v}
            </motion.div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
        <span style={{ color: '#60a5fa' }}>● Data Normal</span>
        <span style={{ color: '#EF4444' }}>🔴 Outlier</span>
      </div>
    </div>
  )
}

function VisualMeanMedian() {
  const mean = STATS.mean
  const median = STATS.median

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {[
        { label: 'MEDIAN', value: median, unit: 'jam/hari', color: '#00FF88', desc: 'Nilai tengah — tidak dipengaruhi outlier', icon: '📍' },
        { label: 'MEAN', value: mean, unit: 'jam/hari', color: '#F59E0B', desc: 'Rata-rata — TERPENGARUH outlier', icon: '⚠️' },
        { label: 'KLAIM VIRAL', value: '>8', unit: 'jam/hari', color: '#EF4444', desc: 'Klaim tidak didukung data nyata!', icon: '🚨' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          style={{
            display: 'flex', gap: '12px', alignItems: 'center',
            padding: '10px 14px', borderRadius: '12px',
            background: `${item.color}10`, border: `1px solid ${item.color}33`,
          }}
        >
          <span style={{ fontSize: '22px' }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: item.color, letterSpacing: '1px', marginBottom: '2px' }}>{item.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: item.color, fontFamily: 'var(--font-data)' }}>{item.value}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{item.unit}</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', maxWidth: '120px', lineHeight: 1.4 }}>
            {item.desc}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function DetektivBooklet({ mode, onComplete }: DetektivBookletProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [openedChapters, setOpenedChapters] = useState<Set<number>>(new Set([0]))
  const isFD = mode === 'FD'
  const allOpened = openedChapters.size >= CHAPTERS.length

  const chapter = CHAPTERS[currentChapter]

  const VISUALS = [VisualSkewness, VisualOutlier, VisualMeanMedian]
  const Visual = VISUALS[currentChapter]

  const handleNext = () => {
    const next = currentChapter + 1
    if (next < CHAPTERS.length) {
      setCurrentChapter(next)
      setOpenedChapters(prev => new Set([...prev, next]))
    }
  }

  const handleTabClick = (i: number) => {
    setCurrentChapter(i)
    setOpenedChapters(prev => new Set([...prev, i]))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ fontSize: '32px' }}>📖</div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px' }}>
            BUKU SAKU DETEKTIF
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            Teori di Balik Investigasimu
          </h2>
        </div>
      </div>

      {/* Chapter tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {CHAPTERS.map((ch, i) => {
          const isActive = currentChapter === i
          const isDone = openedChapters.has(i) && !isActive
          return (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: '10px', cursor: 'pointer',
                border: `1px solid ${isActive ? ch.color : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? `${ch.color}15` : 'transparent',
                color: isActive ? ch.color : isDone ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
                fontSize: '11px', fontWeight: 700, transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <span style={{ fontSize: '16px' }}>{isDone ? '✅' : ch.icon}</span>
              <span style={{ lineHeight: 1.2 }}>{ch.title.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          )
        })}
      </div>

      {/* Chapter content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentChapter}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="game-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Chapter header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
              background: `${chapter.color}15`, border: `1px solid ${chapter.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
            }}>
              {chapter.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: chapter.color, fontWeight: 800, letterSpacing: '1.5px' }}>
                {chapter.subtitle}
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>{chapter.title}</h3>
            </div>
          </div>

          {/* Description */}
          <p style={{
            margin: 0, fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)',
            padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
          }}>
            {isFD ? chapter.contentFD : chapter.content}
          </p>

          {/* Visual */}
          <div style={{
            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px', padding: '20px',
          }}>
            <Visual />
          </div>

          {/* Key points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chapter.keyPoints.map((kp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', gap: '10px', alignItems: 'center',
                  padding: '10px 14px', borderRadius: '10px',
                  background: `${chapter.color}08`, border: `1px solid ${chapter.color}22`,
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{kp.icon}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{kp.text}</span>
              </motion.div>
            ))}
          </div>

          {/* FD: DiRA tip */}
          {isFD && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '12px 14px', borderRadius: '12px',
              background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)',
            }}>
              <img src="/dira-avatar.png" alt="Dira" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--accent)' }}>DiRA: </strong>
                {chapter.diraTip}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {currentChapter < CHAPTERS.length - 1 ? (
          <button
            className="game-btn game-btn-primary"
            onClick={handleNext}
            style={{ flex: 1 }}
          >
            Lanjut ke {CHAPTERS[currentChapter + 1].title.split(' ').slice(0, 3).join(' ')} →
          </button>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: allOpened ? 1 : 0.5, scale: 1 }}
            className="game-btn game-btn-primary"
            onClick={onComplete}
            disabled={!allOpened}
            style={{
              flex: 1, fontSize: '15px',
              background: allOpened ? 'linear-gradient(90deg, #00FF88, #06B6D4)' : undefined,
              cursor: allOpened ? 'pointer' : 'not-allowed',
              boxShadow: allOpened ? '0 4px 20px rgba(0,255,136,0.4)' : 'none',
            }}
          >
            {allOpened ? '✅ Paham Materi & Lanjutkan Bermain →' : `Buka semua materi terlebih dahulu (${openedChapters.size}/${CHAPTERS.length})`}
          </motion.button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 20px rgba(239,68,68,0.9); }
        }
      `}</style>
    </motion.div>
  )
}
