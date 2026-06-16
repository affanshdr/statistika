'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DetektivBookletProps {
  mode: 'FI' | 'FD'
  onComplete: () => void
  unlockedLevelIds: number[]
}

interface BookPage {
  levelId: number
  icon: string
  color: string
  title: string
  definition: string
  formulas: { label: string; value: string }[]
  example: { label: string; lines: string[] }
  tip?: string // DiRA tip for FD mode
}

// ─── All booklet pages across all levels ──────────────────────────────────────
const ALL_PAGES: BookPage[] = [
  // ── LEVEL 1 ──────────────────────────────────────────────────────────────
  {
    levelId: 1,
    icon: '📊',
    color: '#3B82F6',
    title: 'Distribusi Frekuensi & Histogram',
    definition:
      'Distribusi frekuensi adalah tabel yang mengelompokkan data mentah ke dalam kelas-kelas interval berurutan, disertai frekuensi (f) kemunculan data di tiap kelas. Histogram adalah diagram batang yang merepresentasikan distribusi frekuensi tersebut secara visual — batang saling berhimpit menunjukkan data bersifat kontinu.',
    formulas: [
      { label: 'Lebar Kelas', value: 'c  =  (Data Maks − Data Min) / Jumlah Kelas' },
      { label: 'Frekuensi Relatif', value: 'f_rel  =  (fᵢ / N) × 100%' },
    ],
    example: {
      label: 'Level 1 — Data Screen Time 35 Siswa SMA Harapan',
      lines: [
        'Data berkisar 1 – 18 jam, lebar kelas c = (18 − 1) / 5 ≈ 4 jam',
        '┌────────────┬───────┐',
        '│  Kelas     │   f   │',
        '├────────────┼───────┤',
        '│  1 – 4     │  13   │  ← terbanyak',
        '│  5 – 8     │  12   │',
        '│  9 – 12    │   4   │',
        '│  13 – 16   │   4   │',
        '│  17 – 20   │   2   │',
        '├────────────┼───────┤',
        '│  TOTAL (N) │  35   │',
        '└────────────┴───────┘',
      ],
    },
    tip: 'Bayangkan tiap kelas seperti "ember" yang menampung data! Siswa dengan screen time 1–4 jam masuk ember pertama, 5–8 jam masuk ember kedua, dst. Sekarang tinggal hitung berapa siswa di tiap ember! 🪣',
  },
  {
    levelId: 1,
    icon: '➕',
    color: '#8B5CF6',
    title: 'Mean (Rata-rata) Data Kelompok',
    definition:
      'Mean adalah ukuran pemusatan data yang dihitung dari jumlah seluruh nilai dibagi banyaknya data. Pada data kelompok, setiap kelas diwakili oleh nilai tengah (midpoint) interval kelasnya, karena nilai individual tidak diketahui secara pasti.',
    formulas: [
      { label: 'Nilai Tengah', value: 'xᵢ  =  (Batas Bawah + Batas Atas) / 2' },
      { label: 'Mean', value: 'x̄  =  Σ(fᵢ × xᵢ) / Σfᵢ' },
    ],
    example: {
      label: 'Level 1 — Perhitungan Mean Screen Time',
      lines: [
        'Nilai tengah tiap kelas: 2.5 | 6.5 | 10.5 | 14.5 | 18.5',
        '',
        '  Σ(f × x) = 13×2.5 + 12×6.5 + 4×10.5 + 4×14.5 + 2×18.5',
        '           = 32.5 + 78 + 42 + 58 + 37',
        '           = 247.5',
        '',
        '  x̄  = 247.5 / 35  ≈  7.07 jam/hari',
        '',
        '✓ Mean (7.07) < 8 jam → Klaim viral TIDAK terbukti!',
      ],
    },
    tip: 'Mean itu seperti "berbagi rata": total semua jam screen time dibagi ke semua siswa. Masalahnya, kalau 2 orang main 18 jam, semua orang seolah-olah kelihatan main lebih lama dari aslinya! 😮',
  },
  {
    levelId: 1,
    icon: '📍',
    color: '#06B6D4',
    title: 'Median Data Kelompok',
    definition:
      'Median adalah nilai tengah data setelah diurutkan dari terkecil ke terbesar. Pada data kelompok, median dihitung menggunakan rumus interpolasi pada kelas yang memuat data ke-N/2. Median lebih tahan terhadap outlier dibandingkan mean, sehingga lebih representatif bila ada data ekstrem.',
    formulas: [
      { label: 'Letak Median', value: 'Data ke-  N/2  (untuk N ganjil: ke-(N+1)/2)' },
      { label: 'Median', value: 'Me  =  L  +  ((N/2 − Fₖ) / fₘ) × c' },
      { label: 'Keterangan', value: 'L = tepi bawah kelas median (batas bawah − 0.5)' },
    ],
    example: {
      label: 'Level 1 — Perhitungan Median Screen Time (N = 35)',
      lines: [
        'Data ke-17.5 → kelas [5–8] (Fk kumulatif sebelumnya = 13)',
        '',
        '  L  = 5 − 0.5  = 4.5',
        '  Fk = 13  (jumlah frekuensi kumulatif sebelum kelas)',
        '  fm = 12  (frekuensi kelas median)',
        '  c  = 4   (lebar kelas)',
        '',
        '  Me  = 4.5 + ((17.5 − 13) / 12) × 4',
        '      = 4.5 + (4.5 / 12) × 4',
        '      = 4.5 + 1.5  =  6.0 jam/hari',
      ],
    },
    tip: 'Median itu "pemimpin adil" di barisan! Separuh siswa ada di kiri, separuh ada di kanan. Tidak peduli berapa orang yang berdiri jauh di ujung kanan — dia tetap nilai yang berada tepat di posisi tengah! 🏃',
  },
  {
    levelId: 1,
    icon: '🏆',
    color: '#F59E0B',
    title: 'Modus Data Kelompok',
    definition:
      'Modus adalah nilai yang paling sering muncul dalam data. Pada data kelompok, modus terletak pada kelas interval dengan frekuensi tertinggi (kelas modus). Rumus modus data kelompok memperhitungkan selisih frekuensi dengan kelas tetangga kiri (d₁) dan kanan (d₂).',
    formulas: [
      { label: 'Modus', value: 'Mo  =  L  +  (d₁ / (d₁ + d₂)) × c' },
      { label: 'Keterangan', value: 'd₁ = f_modus − f_sebelum' },
      { label: '', value: 'd₂ = f_modus − f_sesudah' },
    ],
    example: {
      label: 'Level 1 — Perhitungan Modus Screen Time',
      lines: [
        'Kelas modus: [1–4] dengan frekuensi tertinggi f = 13',
        '',
        '  L  = 1 − 0.5  = 0.5  (tepi bawah kelas modus)',
        '  d₁ = 13 − 0   = 13   (tidak ada kelas sebelumnya)',
        '  d₂ = 13 − 12  = 1    (selisih dgn kelas sesudahnya)',
        '  c  = 4',
        '',
        '  Mo  = 0.5 + (13 / (13 + 1)) × 4',
        '      = 0.5 + (13 / 14) × 4',
        '      = 0.5 + 3.71  ≈  4.21 jam/hari',
      ],
    },
    tip: 'Modus adalah "yang paling populer"! Kelas mana yang paling ramai siswa screentime-nya? Itu kelas modus. Seperti mencari warna baju yang paling banyak dipakai di sekolah! 👕',
  },
  {
    levelId: 1,
    icon: '🔴',
    color: '#EF4444',
    title: 'Outlier (Pencilan Data)',
    definition:
      'Outlier atau pencilan adalah nilai data yang letaknya sangat jauh dari pola umum kumpulan data lainnya. Outlier terjadi karena kondisi atau kejadian ekstrem yang tidak mewakili mayoritas populasi. Outlier sangat mempengaruhi nilai Mean, tetapi hampir tidak mempengaruhi Median — inilah keunggulan Median sebagai ukuran pusat yang robust.',
    formulas: [
      { label: 'Pengaruh Outlier', value: 'Mean bergeser signifikan ke arah nilai outlier' },
      { label: 'Median vs Outlier', value: 'Median relatif stabil meski ada outlier ekstrem' },
      { label: 'Rekomendasi', value: 'Gunakan Median bila data mengandung outlier' },
    ],
    example: {
      label: 'Level 1 — Identifikasi & Dampak Outlier',
      lines: [
        '• 33 dari 35 siswa: screen time 1 – 16 jam (normal)',
        '• 2 siswa outlier: screen time 17 jam & 18 jam',
        '',
        '  Jika tanpa outlier (N=33):  Mean ≈ 6.42 jam/hari',
        '  Jika dengan outlier (N=35):  Mean ≈ 7.07 jam/hari',
        '',
        '→ Outlier menarik Mean ke atas sekitar +0.65 jam!',
        '→ Median tetap stabil di sekitar 6.0 jam/hari',
        '',
        '∴ Klaim ">8 jam rata-rata" dipengaruhi outlier!',
      ],
    },
    tip: 'Nilai rata-rata kelompokmu 70. Lalu 1 orang dapat nilai 100 → rata-rata naik jadi 73! Itulah kekuatan outlier yang bisa "memanipulasi" rata-rata tanpa disadari. Detektif data harus waspada! 😤',
  },
  {
    levelId: 1,
    icon: '📈',
    color: '#00FF88',
    title: 'Distribusi Menceng (Skewness)',
    definition:
      'Distribusi menceng atau skewed menggambarkan ketidaksimetrisan sebaran data dalam histogram. Terdapat dua jenis: menceng kanan (positive skew) — ekor histogram memanjang ke kanan, dan menceng kiri (negative skew) — ekor memanjang ke kiri. Bentuk distribusi mempengaruhi hubungan antara Mean, Median, dan Modus.',
    formulas: [
      { label: 'Menceng Kanan (+)', value: 'Mean > Median > Modus  (ekor ke kanan)' },
      { label: 'Menceng Kiri (−)', value: 'Mean < Median < Modus  (ekor ke kiri)' },
      { label: 'Simetris', value: 'Mean ≈ Median ≈ Modus  (kurva normal)' },
    ],
    example: {
      label: 'Level 1 — Identifikasi Skewness Data Screen Time',
      lines: [
        '• Histogram: batang tertinggi di kelas [1–4] (kiri)',
        '• Ada ekor panjang ke kanan (outlier 17 & 18 jam)',
        '',
        '  Mean   ≈ 7.07  >  Median = 6.0  ← terbukti menceng kanan!',
        '',
        '✓ Distribusi screen time → MENCENG KANAN (Right-Skewed)',
        '',
        '  Interpretasi: Mayoritas siswa main HP 1–8 jam,',
        '  tapi segelintir siswa dengan screen time ekstrem',
        '  menarik histogram memiliki ekor ke kanan.',
      ],
    },
    tip: 'Ekor histogram seperti ekor kadal yang memanjang! Kalau ekornya ke KANAN, namanya menceng kanan. Batang paling tinggi ada di KIRI, tapi ekor panjang di kanan menarik Mean ke atas. 🦎',
  },
]

// ─── Level metadata for locked page display ───────────────────────────────────
const LEVEL_META: Record<number, { title: string; topics: string[]; icon: string }> = {
  2: {
    title: 'Kasus: Polling Pilkada',
    icon: '🗳️',
    topics: ['Populasi & Sampel', 'Teknik Sampling', 'Representativitas Data', 'Margin of Error'],
  },
  3: {
    title: 'Kasus: Anomali Cuaca',
    icon: '🌡️',
    topics: ['Data Deret Waktu', 'Tren & Musiman', 'Korelasi Data', 'Regresi Linear Sederhana'],
  },
}

const ALL_LEVEL_IDS = [1, 2, 3]

export default function DetektivBooklet({ mode, onComplete, unlockedLevelIds }: DetektivBookletProps) {
  const isFD = mode === 'FD'

  // Build the list of pages: unlocked content pages + locked-level placeholder pages
  const unlockedPages = ALL_PAGES.filter(p => unlockedLevelIds.includes(p.levelId))
  const lockedLevelIds = ALL_LEVEL_IDS.filter(id => !unlockedLevelIds.includes(id) && LEVEL_META[id])

  const totalContentPages = unlockedPages.length
  // locked levels appear as placeholder "pages" after the content pages
  const totalPages = totalContentPages + lockedLevelIds.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [hasReadLast, setHasReadLast] = useState(false)

  const isLastPage = currentIndex === totalPages - 1
  const isContentPage = currentIndex < totalContentPages
  const currentPage = isContentPage ? unlockedPages[currentIndex] : null
  const lockedLevelIndex = isContentPage ? -1 : currentIndex - totalContentPages
  const currentLockedLevelId = !isContentPage ? lockedLevelIds[lockedLevelIndex] : null

  const goNext = () => {
    if (currentIndex < totalPages - 1) {
      setDirection(1)
      setCurrentIndex(i => i + 1)
      if (currentIndex === totalPages - 2) setHasReadLast(true)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(i => i - 1)
    }
  }

  const canComplete = hasReadLast || totalPages === 0 || (totalPages === 1)

  const accentColor = isFD ? '#00FF88' : '#60a5fa'

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>

      {/* ── Booklet Header ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
          border: `1px solid ${accentColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
        }}>
          📖
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', color: accentColor, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Buku Saku Detektif
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
            Materi Level {unlockedLevelIds.length > 0 ? unlockedLevelIds.join(' & ') : '—'}
          </h2>
        </div>
        {/* Page counter */}
        <div style={{
          flexShrink: 0, padding: '6px 12px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)',
          fontFamily: 'monospace',
        }}>
          {currentIndex + 1} / {totalPages}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{
        width: '100%', height: '3px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.07)', marginBottom: '20px', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${((currentIndex + 1) / totalPages) * 100}%` }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
        />
      </div>

      {/* ── Page Content ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: '480px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingRight: '4px' }}
            className="modal-scrollbar"
          >
            {isContentPage && currentPage ? (
              <ContentPageView page={currentPage} isFD={isFD} accentColor={currentPage.color} />
            ) : currentLockedLevelId ? (
              <LockedPageView levelId={currentLockedLevelId} meta={LEVEL_META[currentLockedLevelId]} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Footer ── */}
      <div style={{
        display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px',
        paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Prev */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          style={{
            padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
            background: currentIndex === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
            color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
            fontSize: '13px', fontWeight: 700, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (currentIndex > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { if (currentIndex > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        >
          ← Kembali
        </button>

        {/* Page dots */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const pageIndex = totalPages > 10
              ? Math.round(i * (totalPages - 1) / 9)
              : i
            const isActive = currentIndex === pageIndex || (totalPages > 10 && Math.abs(currentIndex - pageIndex) <= 1)
            return (
              <button
                key={i}
                onClick={() => {
                  setDirection(pageIndex > currentIndex ? 1 : -1)
                  setCurrentIndex(pageIndex)
                  if (pageIndex === totalPages - 1) setHasReadLast(true)
                }}
                style={{
                  width: isActive ? '20px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: isActive ? accentColor : 'rgba(255,255,255,0.2)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.25s ease',
                  flexShrink: 0,
                }}
              />
            )
          })}
        </div>

        {/* Next / Complete */}
        {isLastPage ? (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={onComplete}
            style={{
              padding: '10px 18px', borderRadius: '12px', border: 'none',
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor === '#00FF88' ? '#06B6D4' : '#8B5CF6'})`,
              color: accentColor === '#00FF88' ? '#000' : '#fff',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              flexShrink: 0,
              boxShadow: `0 4px 18px ${accentColor}40`,
            }}
          >
            ✅ Selesai Baca
          </motion.button>
        ) : (
          <button
            onClick={goNext}
            style={{
              padding: '10px 18px', borderRadius: '12px', border: 'none',
              background: `linear-gradient(90deg, ${accentColor}cc, ${accentColor === '#00FF88' ? '#06B6D4cc' : '#8B5CF6cc'})`,
              color: accentColor === '#00FF88' ? '#000' : '#fff',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              flexShrink: 0,
              boxShadow: `0 3px 12px ${accentColor}30`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            Lanjut →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Content Page View ────────────────────────────────────────────────────────
function ContentPageView({ page, isFD, accentColor }: {
  page: BookPage
  isFD: boolean
  accentColor: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Page Title Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px 18px', borderRadius: '16px',
        background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}04)`,
        border: `1px solid ${accentColor}30`,
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: `${accentColor}15`, border: `1px solid ${accentColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
        }}>
          {page.icon}
        </div>
        <div>
          <div style={{
            fontSize: '9px', fontWeight: 900, letterSpacing: '1.5px',
            color: accentColor, textTransform: 'uppercase', marginBottom: '3px',
          }}>
            Level {page.levelId} — Statistika Deskriptif
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            {page.title}
          </h3>
        </div>
      </div>

      {/* Definisi */}
      <Section
        badge="DEFINISI"
        badgeColor="#60a5fa"
        icon="📖"
        content={
          <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.75, color: 'rgba(255,255,255,0.82)' }}>
            {page.definition}
          </p>
        }
      />

      {/* Rumus */}
      <Section
        badge="RUMUS"
        badgeColor="#F59E0B"
        icon="📐"
        content={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {page.formulas.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)',
              }}>
                {f.label && (
                  <span style={{
                    fontSize: '10px', fontWeight: 800, color: '#F59E0B',
                    minWidth: '90px', flexShrink: 0, paddingTop: '2px', letterSpacing: '0.5px',
                  }}>
                    {f.label.toUpperCase()}
                  </span>
                )}
                <code style={{
                  fontSize: '13px', fontFamily: 'monospace', fontWeight: 700,
                  color: '#fde68a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {f.value}
                </code>
              </div>
            ))}
          </div>
        }
      />

      {/* Contoh */}
      <Section
        badge="CONTOH"
        badgeColor="#00FF88"
        icon="💡"
        content={
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '1px solid rgba(0,255,136,0.2)',
            background: 'rgba(0,255,136,0.04)',
          }}>
            <div style={{
              padding: '8px 14px', background: 'rgba(0,255,136,0.1)',
              borderBottom: '1px solid rgba(0,255,136,0.15)',
              fontSize: '11px', fontWeight: 800, color: '#00FF88', letterSpacing: '0.5px',
            }}>
              📌 {page.example.label}
            </div>
            <div style={{ padding: '12px 14px' }}>
              {page.example.lines.map((line, i) => {
                const isEmpty = line.trim() === ''
                const isHighlight = line.startsWith('✓') || line.startsWith('∴') || line.startsWith('→')
                return isEmpty
                  ? <div key={i} style={{ height: '8px' }} />
                  : (
                    <div key={i} style={{
                      fontFamily: 'monospace',
                      fontSize: '12.5px',
                      lineHeight: 1.7,
                      color: isHighlight ? '#86efac' : 'rgba(255,255,255,0.8)',
                      fontWeight: isHighlight ? 700 : 400,
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                    }}>
                      {line}
                    </div>
                  )
              })}
            </div>
          </div>
        }
      />

      {/* DiRA Tip — FD mode only */}
      {isFD && page.tip && (
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          padding: '12px 14px', borderRadius: '12px',
          background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)',
        }}>
          <img
            src="/dira-avatar.png"
            alt="DiRA"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65 }}>
            <strong style={{ color: '#00FF88' }}>DiRA: </strong>
            {page.tip}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Locked Level Placeholder Page ───────────────────────────────────────────
function LockedPageView({ levelId, meta }: {
  levelId: number
  meta: { title: string; topics: string[]; icon: string }
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px', gap: '24px', padding: '20px' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px',
      }}>
        🔒
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', letterSpacing: '1.5px', marginBottom: '8px' }}>
          BELUM TERBUKA — LEVEL {levelId}
        </div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>
          {meta.icon} {meta.title}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
          Selesaikan level sebelumnya untuk membuka materi ini.
        </p>
      </div>
      <div style={{
        width: '100%', maxWidth: '380px', padding: '18px 20px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '12px', letterSpacing: '0.5px' }}>
          TOPIK YANG AKAN DIPELAJARI:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {meta.topics.map((topic, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              fontSize: '13px', color: 'rgba(255,255,255,0.25)',
            }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>🔒</span>
              {topic}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section Layout Helper ─────────────────────────────────────────────────────
function Section({ badge, badgeColor, icon, content }: {
  badge: string
  badgeColor: string
  icon: string
  content: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '6px',
          background: `${badgeColor}15`, border: `1px solid ${badgeColor}35`,
          fontSize: '10px', fontWeight: 900, color: badgeColor, letterSpacing: '1px',
        }}>
          {icon} {badge}
        </span>
        <div style={{ flex: 1, height: '1px', background: `${badgeColor}15` }} />
      </div>
      {content}
    </div>
  )
}
