'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DetektivBookletProps {
  mode: 'FI' | 'FD'
  onComplete: () => void
  unlockedLevelIds: number[]
}

// ─── Booklet image configuration per level ────────────────────────────────────
// To add more pages for a level, add more entries with the same levelId.
// Place images in /public/booklet/ directory.
const ALL_IMAGE_PAGES: {
  levelId: number
  image: string      // path relative to /public
  alt: string
  caption: string
}[] = [
  {
    levelId: 1,
    image: '/booklet/level1.png',
    alt: 'Rangkuman & Lembar Rumus – Level 1 Investigasi Data',
    caption: 'Rangkuman & Lembar Rumus — Investigasi Data Statistika',
  },
  // Tambahkan halaman lain untuk Level 1 di sini jika diperlukan:
  // { levelId: 1, image: '/booklet/level1-page2.png', alt: '...', caption: '...' },
]

// ─── Level metadata for locked placeholder ────────────────────────────────────
const LEVEL_META: Record<number, { title: string; icon: string; hint: string }> = {
  2: {
    title: 'Kasus: Polling Pilkada',
    icon: '🗳️',
    hint: 'Selesaikan Level 1 untuk membuka materi ini',
  },
  3: {
    title: 'Kasus: Anomali Cuaca',
    icon: '🌡️',
    hint: 'Selesaikan Level 2 untuk membuka materi ini',
  },
}

const ALL_LEVEL_IDS = [1, 2, 3]

export default function DetektivBooklet({ mode, onComplete, unlockedLevelIds }: DetektivBookletProps) {
  const isFD = mode === 'FD'
  const accentColor = isFD ? '#D97706' : '#2563EB'

  // Content pages from unlocked levels only
  const contentPages = ALL_IMAGE_PAGES.filter(p => unlockedLevelIds.includes(p.levelId))
  // Locked levels (show one placeholder per locked level)
  const lockedLevelIds = ALL_LEVEL_IDS.filter(
    id => !unlockedLevelIds.includes(id) && LEVEL_META[id]
  )

  const totalPages = contentPages.length + lockedLevelIds.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [isZoomed, setIsZoomed] = useState(false)

  const isContentPage = currentIndex < contentPages.length
  const page = isContentPage ? contentPages[currentIndex] : null
  const lockedMeta = !isContentPage
    ? LEVEL_META[lockedLevelIds[currentIndex - contentPages.length]]
    : null
  const isLastPage = currentIndex === totalPages - 1

  const navigate = (delta: 1 | -1) => {
    const next = currentIndex + delta
    if (next < 0 || next >= totalPages) return
    setDirection(delta)
    setIsZoomed(false)
    setCurrentIndex(next)
  }

  const jumpTo = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1)
    setIsZoomed(false)
    setCurrentIndex(idx)
  }

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: `${accentColor}18`, border: `1px solid ${accentColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>
          📖
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', color: accentColor, fontWeight: 800, letterSpacing: '1.5px' }}>
            BUKU SAKU DETEKTIF
          </div>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>
            {page?.caption ?? (lockedMeta ? lockedMeta.title : 'Buku Saku')}
          </h2>
        </div>
        {/* Page counter */}
        <div style={{
          flexShrink: 0, padding: '4px 12px', borderRadius: '20px',
          background: 'rgba(180,140,80,0.1)', border: '1px solid rgba(180,140,80,0.1)',
          fontSize: '12px', fontWeight: 700, color: '#78716C',
          fontFamily: 'monospace',
        }}>
          {currentIndex + 1} / {totalPages}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        width: '100%', height: '3px', borderRadius: '2px',
        background: 'rgba(180,140,80,0.1)', marginBottom: '16px', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${((currentIndex + 1) / totalPages) * 100}%` }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}77)` }}
        />
      </div>

      {/* ── Main Image Area ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: '380px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflow: 'auto' }}
            className="modal-scrollbar"
          >
            {isContentPage && page ? (
              /* ── Image Page ── */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                {/* Image container */}
                <div
                  onClick={() => setIsZoomed(z => !z)}
                  title={isZoomed ? 'Klik untuk perkecil' : 'Klik untuk perbesar'}
                  style={{
                    width: '100%',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: `1px solid ${accentColor}25`,
                    boxShadow: `0 4px 30px rgba(0,0,0,0.5), 0 0 20px ${accentColor}10`,
                    cursor: 'zoom-in',
                    transition: 'box-shadow 0.3s',
                    background: '#fff',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 40px rgba(0,0,0,0.6), 0 0 30px ${accentColor}25` }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 30px rgba(0,0,0,0.5), 0 0 20px ${accentColor}10` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.image}
                    alt={page.alt}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                    onError={e => {
                      // fallback if image not found
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.innerHTML =
                        '<div style="padding:40px;text-align:center;color:#888;font-size:13px;">⚠️ Gambar tidak ditemukan.<br/>Pastikan file ada di <code>/public/booklet/level1.png</code></div>'
                    }}
                  />
                </div>

                {/* Hint */}
                <div style={{ fontSize: '11px', color: '#A8A29E', textAlign: 'center' }}>
                  🔍 Klik gambar untuk memperbesar / memperkecil
                </div>

                {/* FD DiRA tip */}
                {isFD && (
                  <div style={{
                    width: '100%', display: 'flex', gap: '10px', alignItems: 'flex-start',
                    padding: '10px 14px', borderRadius: '12px',
                    background: `${accentColor}08`, border: `1px solid ${accentColor}25`,
                  }}>
                    <img src="/dira-avatar.png" alt="DiRA" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                      <strong style={{ color: accentColor }}>DiRA: </strong>
                      Pelajari gambar rangkuman ini dengan seksama sebelum memulai game ya! Semua rumus yang kamu butuhkan ada di sini. Kalau ada yang kurang paham, tanya aku lewat menu Tanya DiRA! 😊
                    </div>
                  </div>
                )}
              </div>
            ) : lockedMeta ? (
              /* ── Locked Level Page ── */
              <div style={{
                width: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: '360px', gap: '20px', padding: '20px',
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(217,119,6,0.04)', border: '1.5px solid rgba(180,140,80,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
                }}>
                  🔒
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', letterSpacing: '1.5px', marginBottom: '8px' }}>
                    MATERI TERKUNCI
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#78716C' }}>
                    {lockedMeta.icon} {lockedMeta.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#A8A29E', lineHeight: 1.6 }}>
                    {lockedMeta.hint}
                  </p>
                </div>
                <div style={{
                  padding: '14px 20px', borderRadius: '14px',
                  background: 'rgba(217,119,6,0.03)', border: '1px solid rgba(180,140,80,0.08)',
                  fontSize: '12px', color: '#A8A29E', textAlign: 'center', lineHeight: 1.6,
                }}>
                  🗝️ Buku saku untuk level ini akan terbuka secara otomatis<br />
                  setelah kamu menyelesaikan level sebelumnya.
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* ── Fullscreen Zoom Overlay ── */}
        <AnimatePresence>
          {isZoomed && page && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', cursor: 'zoom-out',
              }}
            >
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={page.image}
                alt={page.alt}
                onClick={e => e.stopPropagation()}
                style={{
                  maxWidth: '100%', maxHeight: '100%',
                  borderRadius: '12px', objectFit: 'contain',
                  boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                  cursor: 'default',
                }}
              />
              <button
                onClick={() => setIsZoomed(false)}
                style={{
                  position: 'fixed', top: '20px', right: '20px',
                  background: 'rgba(217,119,6,0.1)', border: '1px solid #A8A29E',
                  borderRadius: '50%', width: '40px', height: '40px',
                  color: '#1C1917', fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation Footer ── */}
      <div style={{
        display: 'flex', gap: '10px', alignItems: 'center',
        marginTop: '16px', paddingTop: '14px',
        borderTop: '1px solid rgba(180,140,80,0.1)',
      }}>
        {/* Prev */}
        <button
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
          style={{
            padding: '10px 16px', borderRadius: '12px',
            border: '1px solid rgba(180,140,80,0.1)',
            background: currentIndex === 0 ? 'rgba(217,119,6,0.03)' : 'rgba(180,140,80,0.12)',
            color: currentIndex === 0 ? '#A8A29E' : 'rgba(255,255,255,0.7)',
            fontSize: '13px', fontWeight: 700,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { if (currentIndex > 0) e.currentTarget.style.background = 'rgba(217,119,6,0.1)' }}
          onMouseLeave={e => { if (currentIndex > 0) e.currentTarget.style.background = 'rgba(180,140,80,0.12)' }}
        >
          ← Kembali
        </button>

        {/* Page dots */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '7px' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              style={{
                width: currentIndex === i ? '22px' : '8px',
                height: '8px', borderRadius: '4px', border: 'none',
                background: currentIndex === i ? accentColor : '#A8A29E',
                cursor: 'pointer', padding: 0, transition: 'all 0.25s', flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Next / Done */}
        {isLastPage ? (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={onComplete}
            style={{
              padding: '10px 18px', borderRadius: '12px', border: 'none',
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor === '#D97706' ? '#EA580C' : '#8B5CF6'})`,
              color: accentColor === '#D97706' ? '#000' : '#fff',
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
            onClick={() => navigate(1)}
            style={{
              padding: '10px 18px', borderRadius: '12px', border: 'none',
              background: `${accentColor}cc`,
              color: accentColor === '#D97706' ? '#000' : '#fff',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              flexShrink: 0, transition: 'all 0.2s',
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
