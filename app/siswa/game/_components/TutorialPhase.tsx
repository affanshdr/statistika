'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { screenTimeData, STATS } from '../_data/level1'

interface TutorialPhaseProps {
  mode: 'FI' | 'FD'
  onComplete: () => void
}

// ── Slide definitions ─────────────────────────────────────
const SLIDES = [
  {
    id: 'data',
    icon: '📊',
    title: 'Apa itu Data?',
    tagline: 'KONSEP 1 / 5 — DATA',
    desc: 'Data adalah kumpulan angka atau informasi yang dikumpulkan dari pengamatan nyata. Setiap angka mewakili satu observasi dari satu orang atau kejadian.',
    descFD: 'Bayangin kamu tanya ke 10 teman: "Berapa jam sehari kamu pakai HP buat medsos?" Jawaban mereka itulah yang kita sebut DATA! 📋',
  },
  {
    id: 'distribusi',
    icon: '📦',
    title: 'Distribusi Frekuensi',
    tagline: 'KONSEP 2 / 5 — DISTRIBUSI',
    desc: 'Distribusi frekuensi adalah cara mengelompokkan data ke dalam kelas-kelas interval. Frekuensi (f) menunjukkan berapa banyak data yang jatuh di setiap kelas.',
    descFD: 'Daripada lihat 10 angka acak, lebih gampang kalau kita kelompokkin! Misal: "Siapa yang pakai HP 3–4 jam?" → masuk kotak kelas 3.5–4.4. Itu namanya distribusi frekuensi 📦',
  },
  {
    id: 'histogram',
    icon: '📈',
    title: 'Membaca Histogram',
    tagline: 'KONSEP 3 / 5 — HISTOGRAM',
    desc: 'Histogram adalah grafik batang yang menggambarkan distribusi frekuensi. Sumbu X adalah kelas interval, sumbu Y adalah frekuensi (jumlah data di setiap kelas).',
    descFD: 'Histogram itu kayak grafik batang, tapi batangnya nempel satu sama lain. Batang paling tinggi = kelas yang paling banyak datanya. Gampang kan? 📈',
  },
  {
    id: 'mean',
    icon: '🔢',
    title: 'Rata-rata (Mean)',
    tagline: 'KONSEP 4 / 5 — MEAN',
    desc: 'Mean (rata-rata) dihitung dengan menjumlahkan semua nilai data lalu dibagi jumlah data. Mean menunjukkan "pusat" distribusi data, namun bisa menyesatkan jika ada nilai ekstrem.',
    descFD: 'Mean itu totalin semua angka terus bagi jumlahnya. Contoh: (5.8 + 4.5 + ...) ÷ 10. Hasilnya jadi "wakil" dari semua data. Tapi hati-hati — 1 angka yang sangat besar bisa bikin mean keliatan besar padahal data lainnya kecil! 🤔',
  },
  {
    id: 'kritis',
    icon: '🕵️',
    title: 'Berpikir Kritis terhadap Data',
    tagline: 'KONSEP 5 / 5 — BERPIKIR KRITIS',
    desc: 'Klaim berbasis data harus diverifikasi. Pertanyakan: Dari mana datanya? Berapa sampelnya? Apakah mean representatif? Data bisa disajikan untuk menyesatkan (misleading) meskipun "secara teknis benar".',
    descFD: 'Kalau ada berita bilang "rata-rata 8 jam", jangan langsung percaya! Tanya dulu: datanya dari mana? Siapa yang disurvei? Mean-nya beneran 8 jam? Kita butuh bukti statistik — itu tugas kita hari ini! 🔍',
  },
]

// ── Sub-components for each slide animation ───────────────

function SlideData({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
      {screenTimeData.map((val, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            width: '58px', height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            border: '2px solid rgba(99,179,237,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>s{i + 1}</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-data)' }}>{val}</div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)' }}>jam</div>
        </motion.div>
      ))}
    </div>
  )
}

const CLASS_INTERVALS = [
  { label: '3.5–4.4', color: '#6366F1', items: [3.7, 4.0] },
  { label: '4.5–5.4', color: '#8B5CF6', items: [4.5, 5.1] },
  { label: '5.5–6.4', color: '#06B6D4', items: [5.8, 6.1, 6.4] },
  { label: '6.5–7.4', color: '#10B981', items: [7.2] },
  { label: '7.5–8.4', color: '#F59E0B', items: [7.7] },
  { label: '8.5–9.4', color: '#EF4444', items: [8.8] },
]

function SlideDistribusi({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
      {CLASS_INTERVALS.map((cls, ci) => (
        <motion.div
          key={ci}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.12 }}
          style={{
            background: `${cls.color}18`,
            border: `1px solid ${cls.color}55`,
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            minWidth: '72px',
          }}
        >
          <div style={{ fontSize: '10px', color: cls.color, fontWeight: 800, textAlign: 'center', letterSpacing: '0.3px' }}>{cls.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
            {cls.items.map((v, vi) => (
              <motion.div
                key={vi}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: ci * 0.12 + vi * 0.08 + 0.1, type: 'spring' }}
                style={{
                  background: cls.color,
                  color: '#fff',
                  borderRadius: '50px',
                  padding: '3px 7px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-data)',
                }}
              >{v}</motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: ci * 0.12 + 0.4 }}
            style={{ fontSize: '13px', fontWeight: 800, color: '#fff', background: cls.color, borderRadius: '6px', padding: '2px 10px' }}
          >
            f = {cls.items.length}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

const HISTOGRAM_DATA = [
  { label: '3.5–4.4', f: 2 },
  { label: '4.5–5.4', f: 2 },
  { label: '5.5–6.4', f: 3 },
  { label: '6.5–7.4', f: 1 },
  { label: '7.5–8.4', f: 1 },
  { label: '8.5–9.4', f: 1 },
]

function SlideHistogram() {
  const maxF = 3
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '4px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0', alignItems: 'flex-end', height: '130px', width: '100%', maxWidth: '380px', borderLeft: '2px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingLeft: '8px', paddingBottom: '4px' }}>
        {HISTOGRAM_DATA.map((bar, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', paddingBottom: '2px' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(bar.f / maxF) * 100}%` }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: 'easeOut' }}
              style={{
                width: '90%',
                background: 'linear-gradient(180deg, #00FF88 0%, #00cc88 100%)',
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '3px',
                boxShadow: '0 0 10px rgba(0,255,136,0.4)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#000' }}>f={bar.f}</span>
            </motion.div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0', width: '100%', maxWidth: '388px', paddingLeft: '16px' }}>
        {HISTOGRAM_DATA.map((bar, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', lineHeight: 1.3 }}>
            {bar.label.replace('–', '–\n')}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '24px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
        <span>Sumbu X = Kelas Interval (jam/hari)</span>
        <span>Sumbu Y = Frekuensi</span>
      </div>
    </div>
  )
}

function SlideMean() {
  const total = screenTimeData.reduce((a, b) => a + b, 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%', marginTop: '4px' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(0,255,136,0.06)',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: '14px',
          padding: '14px 20px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>RUMUS MEAN</div>
        <div style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.5px' }}>
          Mean = Σ(semua data) ÷ n
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--game-border)',
          borderRadius: '14px',
          padding: '14px 20px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>PERHITUNGAN:</div>
        <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
          ({screenTimeData.join(' + ')})
        </div>
        <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
          = {total.toFixed(1)} ÷ {STATS.n}
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}
        >
          Mean = {STATS.mean} jam/hari
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          background: 'rgba(255,51,102,0.08)',
          border: '1px solid rgba(255,51,102,0.3)',
          borderRadius: '10px',
          padding: '10px 16px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.85)',
          width: '100%',
          textAlign: 'center',
        }}
      >
        ⚠️ Klaim viral bilang <strong style={{ color: '#FF6B35' }}>8+ jam</strong>, padahal mean sebenarnya <strong style={{ color: 'var(--accent)' }}>{STATS.mean} jam</strong>
      </motion.div>
    </div>
  )
}

function SlideKritis() {
  const points = [
    { icon: '❓', text: 'Dari mana data tersebut berasal?', delay: 0.1 },
    { icon: '👥', text: 'Berapa jumlah sampelnya? Apakah representatif?', delay: 0.25 },
    { icon: '📐', text: 'Apakah mean benar-benar mencerminkan semua data?', delay: 0.4 },
    { icon: '🔍', text: 'Apakah ada nilai ekstrem yang mendistorsi rata-rata?', delay: 0.55 },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '4px' }}>
      {points.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: p.delay }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--game-border)',
            borderRadius: '10px',
            padding: '10px 14px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{p.icon}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{p.text}</span>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          background: 'rgba(0,255,136,0.06)',
          border: '1px solid var(--game-border-accent)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginTop: '4px',
          fontSize: '13px',
          color: 'var(--accent)',
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        🎯 Tugasmu: gunakan histogram untuk membuktikan apakah klaim viral itu benar!
      </motion.div>
    </div>
  )
}

const SLIDE_VISUALS = [SlideData, SlideDistribusi, SlideHistogram, SlideMean, SlideKritis]

// ── Main Component ────────────────────────────────────────
export default function TutorialPhase({ mode, onComplete }: TutorialPhaseProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [confirmed, setConfirmed] = useState<boolean[]>(Array(SLIDES.length).fill(false))
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640)
      setIsLandscape(window.innerHeight < 500 && window.innerWidth > window.innerHeight)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isFD = mode === 'FD'
  const currentSlide = SLIDES[slideIndex]
  const SlideVisual = SLIDE_VISUALS[slideIndex]

  const handleConfirm = () => {
    const next = [...confirmed]
    next[slideIndex] = true
    setConfirmed(next)
    if (slideIndex < SLIDES.length - 1) {
      setTimeout(() => setSlideIndex(i => i + 1), 300)
    } else {
      setTimeout(onComplete, 400)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#080810',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isLandscape ? '8px 12px' : isMobile ? '16px 12px 24px' : '24px 20px 32px',
        overflowY: 'auto',
      }}
    >
      {/* Top bar: label + skip (FI only) */}
      <div style={{
        width: '100%',
        maxWidth: '820px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isLandscape ? '6px' : isMobile ? '12px' : '20px',
        gap: '8px',
      }}>
        <div style={{
          fontSize: isLandscape ? '9px' : isMobile ? '10px' : '11px',
          fontWeight: 800,
          letterSpacing: '1.5px',
          color: 'var(--accent)',
          opacity: 0.9,
        }}>
          📚 {(isMobile || isLandscape) ? 'TUTORIAL' : 'TUTORIAL STATISTIKA DASAR'}
        </div>
        {!isFD && (
          <button
            className="game-btn game-btn-secondary"
            style={{ padding: '5px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
            onClick={onComplete}
          >
            {(isMobile || isLandscape) ? 'Lewati ›' : 'Lewati Tutorial ›'}
          </button>
        )}
      </div>

      {/* Progress bar — hidden in landscape */}
      {!isLandscape && (
      <div style={{ width: '100%', maxWidth: '820px', marginBottom: isMobile ? '16px' : '28px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i < slideIndex
                  ? 'rgba(0,255,136,0.6)'
                  : i === slideIndex
                    ? 'var(--accent)'
                    : 'rgba(255,255,255,0.1)',
              }}
              animate={{ scaleX: i === slideIndex ? [1, 1.03, 1] : 1 }}
              transition={{ repeat: i === slideIndex ? Infinity : 0, duration: 2 }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {SLIDES.map((s, i) => (
            <div key={i} style={{ color: i <= slideIndex ? 'var(--accent)' : undefined, fontSize: '10px', opacity: i === slideIndex ? 1 : 0.6, transition: 'all 0.3s', flex: 1, textAlign: 'center' }}>
              {s.icon}
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Slide card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            maxWidth: '820px',
            background: 'var(--game-card)',
            border: '1px solid var(--game-border-accent)',
            borderRadius: isLandscape ? '14px' : isMobile ? '18px' : '24px',
            padding: isLandscape ? '12px 14px' : isMobile ? '20px 16px' : '32px 28px',
            display: 'flex',
            flexDirection: isLandscape ? 'row' : 'column',
            gap: isLandscape ? '12px' : isMobile ? '14px' : '20px',
            boxShadow: '0 0 40px rgba(0,255,136,0.06)',
          }}
        >
          {/* LEFT column in landscape, normal flow otherwise */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isLandscape ? '10px' : isMobile ? '14px' : '20px', flex: 1, minWidth: 0 }}>

          {/* Slide header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isLandscape ? '8px' : isMobile ? '10px' : '14px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                fontSize: isLandscape ? '20px' : isMobile ? '28px' : '40px',
                width: isLandscape ? '36px' : isMobile ? '48px' : '64px',
                height: isLandscape ? '36px' : isMobile ? '48px' : '64px',
                borderRadius: '50%',
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid var(--game-border-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {currentSlide.icon}
            </motion.div>
            <div>
              <div style={{ fontSize: isLandscape ? '8px' : isMobile ? '9px' : '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '2px' }}>
                {currentSlide.tagline}
              </div>
              <h2 style={{ margin: 0, fontSize: isLandscape ? '14px' : isMobile ? '17px' : '22px', fontWeight: 800, lineHeight: 1.2 }}>
                {currentSlide.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              margin: 0,
              fontSize: isLandscape ? '12px' : isMobile ? '13px' : '14px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--game-border)',
              borderRadius: '10px',
              padding: isLandscape ? '8px 12px' : isMobile ? '12px 14px' : '14px 16px',
            }}
          >
            {isFD ? currentSlide.descFD : currentSlide.desc}
          </motion.p>

          {/* FD: Dira hint bubble — hidden in landscape */}
          {isFD && !isLandscape && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                background: 'rgba(0,255,136,0.04)',
                border: '1px solid var(--game-border-accent)',
                borderRadius: '14px',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '28px', flexShrink: 0, lineHeight: 1 }}>🤖</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--accent)' }}>Dira:</strong>{' '}
                {slideIndex === 0 && 'Hei! Sebelum kita mulai investigasi, aku mau ajarin kamu beberapa hal penting dulu. Siap? 😊'}
                {slideIndex === 1 && 'Keren! Sekarang kamu udah tau apa itu data. Yuk lanjut ke langkah berikutnya — mengelompokkan data! 📦'}
                {slideIndex === 2 && 'Nah, distribusi frekuensi itu nanti kita visualisasikan jadi histogram. Ayo lihat bentuknya! 📈'}
                {slideIndex === 3 && 'Oke, sekarang kita hitung rata-ratanya. Perhatiin baik-baik ya, ini penting buat nge-buktiin klaim viral itu! 🔢'}
                {slideIndex === 4 && 'Hampir selesai! Ini yang paling penting — jangan percaya klaim tanpa cek datanya sendiri. Kamu siap investigasi? 🕵️'}
              </div>
            </motion.div>
          )}

          {/* Action button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isFD ? 0.7 : 0.3 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="game-btn game-btn-primary"
            onClick={handleConfirm}
            style={{
              width: '100%',
              padding: isLandscape ? '9px' : isMobile ? '12px' : '14px',
              fontSize: isLandscape ? '12px' : isMobile ? '13px' : '15px',
              letterSpacing: '0.5px',
              touchAction: 'manipulation',
            }}
          >
            {slideIndex < SLIDES.length - 1
              ? (isMobile || isLandscape)
                ? `Lanjut: ${SLIDES[slideIndex + 1].icon} →`
                : `Aku Mengerti — Lanjut ke ${SLIDES[slideIndex + 1].title} →`
              : '✅ Siap! Mulai Investigasi →'
            }
          </motion.button>
          </div>{/* end LEFT col */}

          {/* RIGHT column: visual — only in landscape, hidden in portrait via normal flow */}
          {isLandscape && (
            <div style={{
              width: '220px',
              flexShrink: 0,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
              overflowY: 'auto',
            }}>
              <SlideVisual step={slideIndex} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Slide dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIndex ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i < slideIndex
                ? 'rgba(0,255,136,0.5)'
                : i === slideIndex
                  ? 'var(--accent)'
                  : 'rgba(255,255,255,0.12)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
