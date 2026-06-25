'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────────────────
export type DiraPopupStep = 'intro' | 'rentang' | 'banyak-kelas' | 'panjang-kelas'

interface DiraPopupProps {
  step: DiraPopupStep
  /** auto-dismiss setelah N ms (default 6000). Set 0 untuk tidak auto-dismiss */
  autoDismissMs?: number
  onDismiss?: () => void
}

// ── Pesan kontekstual per langkah ─────────────────────────────────────────────
const DIRA_MESSAGES: Record<DiraPopupStep, { emoji: string; title: string; body: string; cta: string }> = {
  intro: {
    emoji: '👋',
    title: 'Halo! Aku DiRA!',
    body: 'Sebelum kamu bisa membuat tabel frekuensi, kita perlu menghitung 3 nilai kunci dulu — Rentang, Banyak Kelas, dan Panjang Kelas. Aku akan menemanimu tiap langkah! 🧮',
    cta: 'Siap, DiRA!',
  },
  rentang: {
    emoji: '📏',
    title: 'Langkah 1: Rentang (R)',
    body: 'Rentang = data terbesar − data terkecil. Cari kedua nilai itu dari kumpulan data screen time, lalu seret atau ketuk ke kotak formula ya! 💡',
    cta: 'Paham, lanjut!',
  },
  'banyak-kelas': {
    emoji: '📊',
    title: 'Langkah 2: Banyak Kelas (K)',
    body: 'Gunakan rumus Sturges: K = 1 + 3,3 × log n. Di sini, n adalah jumlah seluruh data yang kamu punya. Hitung dulu berapa banyak datanya! 🔢',
    cta: 'Oke, aku coba!',
  },
  'panjang-kelas': {
    emoji: '📐',
    title: 'Langkah 3: Panjang Kelas (P)',
    body: 'Tinggal satu langkah lagi! P = R ÷ K. Masukkan nilai R dan K yang sudah kamu hitung sebelumnya. Hampir selesai! 🎯',
    cta: 'Yuk selesaikan!',
  },
}

// ── Keyword Highlights mapping ──────────────────────────────────────────────────
const HIGHLIGHTS: Record<string, string> = {
  'Rentang = data terbesar − data terkecil': 'var(--accent)',
  'K = 1 + 3,3 × log n': 'var(--accent)',
  'P = R ÷ K': 'var(--accent)',
  'Rentang': 'var(--accent)',
  'Banyak Kelas': 'var(--accent)',
  'Panjang Kelas': 'var(--accent)',
  'data terbesar': 'var(--accent)',
  'data terkecil': 'var(--accent)',
  'screen time': 'var(--accent)',
  'rumus Sturges': 'var(--accent)',
  'n': 'var(--accent)',
  'R': 'var(--accent)',
  'K': 'var(--accent)',
}

// ── Typewriter component ────────────────────────────────────────────────────────
function DiraTypewriter({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const id = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(id)
        setTimeout(() => onDoneRef.current(), 200)
      }
    }, 15)
    return () => clearInterval(id)
  }, [text])

  // Highlight keywords
  const parts: React.ReactNode[] = []
  let remaining = displayed
  let key = 0

  const isWordChar = (char: string | undefined) => !!char && /[a-zA-Z0-9_]/.test(char);

  const findValidIndex = (str: string, word: string) => {
    let startPos = 0;
    const isFormula = word.includes('=') || word.includes('+') || word.includes('÷') || word.includes('−');
    const isMultiWord = word.includes(' ');

    while (true) {
      const idx = str.indexOf(word, startPos);
      if (idx === -1) return -1;

      const charBefore = idx > 0 ? str[idx - 1] : undefined;
      const charAfter = idx + word.length < str.length ? str[idx + word.length] : undefined;

      const isValidStart = !isWordChar(charBefore);
      const isValidEnd = !isWordChar(charAfter);

      if (isFormula || isMultiWord || (isValidStart && isValidEnd)) {
        return idx;
      }
      startPos = idx + 1;
    }
  };

  while (remaining.length > 0) {
    let foundAt = -1
    let foundWord = ''
    for (const word of Object.keys(HIGHLIGHTS)) {
      const idx = findValidIndex(remaining, word)
      if (idx !== -1) {
        if (foundAt === -1 || idx < foundAt || (idx === foundAt && word.length > foundWord.length)) {
          foundAt = idx
          foundWord = word
        }
      }
    }
    if (foundAt === -1) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }
    if (foundAt > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, foundAt)}</span>)
    }
    parts.push(
      <strong key={key++} style={{ color: HIGHLIGHTS[foundWord] }}>
        {foundWord}
      </strong>
    )
    remaining = remaining.slice(foundAt + foundWord.length)
  }

  return (
    <span>
      {parts}
      <span style={{ animation: 'blink-cursor 1s infinite', color: 'var(--accent)' }}>|</span>
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
// Renders via portal to .game-root — covers full game viewport (incl. GameHeader)
// without needing position:fixed (which breaks in Android fullscreen mode).
export default function DiraPopup({ step, autoDismissMs = 7000, onDismiss }: DiraPopupProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [typewriterDone, setTypewriterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Portal to .game-root so position:absolute fills the full game viewport
  const [portalTarget, setPortalTarget] = useState<Element | null>(null)

  const msg = DIRA_MESSAGES[step]

  useEffect(() => {
    const target = document.querySelector('.game-root') ?? document.body
    setPortalTarget(target)
    setMounted(true)
  }, [])

  // Responsive check
  useEffect(() => {
    if (!mounted || !portalTarget) return
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [mounted, portalTarget])

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 350)
  }, [onDismiss])

  // Mount with short delay
  useEffect(() => {
    setVisible(false)
    setProgress(0)
    setTypewriterDone(false)
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [step])

  // Auto-dismiss progress (starts only after typewriter finishes typing)
  useEffect(() => {
    if (!visible || autoDismissMs === 0 || !typewriterDone) return

    const interval = 50
    const totalTicks = autoDismissMs / interval
    let tick = 0

    const id = setInterval(() => {
      tick++
      setProgress(Math.min(100, (tick / totalTicks) * 100))
      if (tick >= totalTicks) {
        clearInterval(id)
        dismiss()
      }
    }, interval)

    return () => clearInterval(id)
  }, [visible, autoDismissMs, dismiss, typewriterDone])

  if (!mounted || !portalTarget) return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — position:absolute fills .game-root = full game viewport */}
          <motion.div
            key="dira-popup-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* ── Dialogue panel — anchored to bottom of game-root ── */}
          <motion.div
            key={`dira-popup-${step}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? '12px' : '24px',
              left: isMobile ? '12px' : '24px',
              right: isMobile ? '12px' : '24px',
              zIndex: 501,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Name tag tab */}
            <div style={{
              alignSelf: 'flex-start',
              background: 'rgba(10, 20, 15, 0.95)',
              borderTop: '2px solid rgba(217,119,6, 0.3)',
              borderLeft: '2px solid rgba(217,119,6, 0.3)',
              borderRight: '2px solid rgba(217,119,6, 0.3)',
              borderBottom: 'none',
              borderRadius: '6px 14px 0 0',
              padding: '4px 16px',
              color: 'var(--accent)',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: 800,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
              marginBottom: '-2px',
              position: 'relative',
              zIndex: 2,
            }}>
              <span>👤</span>
              <span>ASISTEN DIRA</span>
              <span style={{
                fontSize: '8px',
                padding: '1px 6px',
                borderRadius: '50px',
                background: 'rgba(217,119,6, 0.1)',
                border: '1px solid rgba(217,119,6, 0.3)',
                color: '#D97706',
                fontWeight: 700,
                marginLeft: '8px',
              }}>
                Langkah {step === 'rentang' ? 1 : step === 'banyak-kelas' ? 2 : 3} dari 3
              </span>
            </div>

            {/* Dialog text box */}
            <div style={{
              background: 'rgba(10, 20, 18, 0.95)',
              border: '2px solid rgba(217,119,6, 0.4)',
              borderRadius: '0px 14px 14px 14px',
              padding: 'clamp(14px, 2.5vh, 20px) clamp(16px, 3vw, 24px) clamp(12px, 2vh, 18px)',
              boxShadow: '0 10px 25px rgba(217,119,6, 0.1), inset 0 0 20px rgba(217,119,6, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              position: 'relative',
              minHeight: 'clamp(95px, 18vh, 130px)',
            }}>
              {/* Progress bar (auto-dismiss countdown) */}
              {autoDismissMs > 0 && typewriterDone && (
                <div style={{
                  height: '3px',
                  background: 'rgba(180,140,80,0.12)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  borderRadius: '0px 14px 0 0',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      background: 'rgba(217,119,6, 0.5)',
                      width: `${100 - progress}%`,
                      transition: 'width 0.05s linear',
                    }}
                  />
                </div>
              )}

              {/* ── Agent Image ── */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% - 2px)',
                right: isMobile ? '8px' : '24px',
                height: isMobile ? '120px' : '190px',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <motion.img
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
                  src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
                  onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
                  alt="Agent DIRA"
                  style={{ height: '100%', objectFit: 'contain' }}
                />
                {/* "Go!" speech bubble */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  style={{
                    position: 'absolute',
                    top: '8%',
                    right: isMobile ? '-22px' : '-32px',
                    background: 'rgba(10, 20, 15, 0.95)',
                    border: '2px solid var(--accent)',
                    borderRadius: '50%',
                    padding: isMobile ? '3px 8px' : '5px 11px',
                    fontWeight: 900,
                    fontSize: isMobile ? '11px' : '14px',
                    color: 'var(--accent)',
                    transform: 'rotate(12deg)',
                    boxShadow: '3px 3px 0px rgba(217,119,6, 0.3)',
                    fontFamily: '"Impact", "Arial Black", sans-serif',
                    letterSpacing: '0.5px',
                    zIndex: 6,
                    animation: 'pulse-go-pregame 1s infinite alternate',
                  }}
                >
                  Go!
                </motion.div>
              </div>

              {/* Dialog text */}
              <p style={{
                margin: 0,
                fontSize: isMobile ? '13px' : '15px',
                color: '#1C1917',
                fontWeight: 600,
                lineHeight: 1.65,
                paddingRight: isMobile ? '110px' : '160px',
              }}>
                <span style={{ marginRight: '6px' }}>{msg.emoji}</span>
                <DiraTypewriter text={msg.body} onDone={() => setTypewriterDone(true)} />
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(180,140,80,0.12)',
                paddingTop: '10px',
                marginTop: '12px',
              }}>
                <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#A8A29E', fontWeight: 600 }}>
                  Persiapan Statistik — {msg.title}
                </span>
                <motion.button
                  className="game-btn game-btn-primary"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: typewriterDone ? 1 : 0.4, x: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => typewriterDone && dismiss()}
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                    padding: isMobile ? '6px 16px' : '8px 22px',
                    borderRadius: '7px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: 'auto',
                    boxShadow: typewriterDone ? 'var(--accent-glow)' : 'none',
                    cursor: typewriterDone ? 'pointer' : 'not-allowed',
                    border: 'none',
                    background: typewriterDone ? 'var(--accent)' : 'rgba(217,119,6,0.1)',
                    color: typewriterDone ? '#000' : '#A8A29E',
                  }}
                >
                  {msg.cta} →
                </motion.button>
              </div>
            </div>
          </motion.div>

          <style>{`
            @keyframes pulse-go-pregame {
              0%, 100% { transform: rotate(12deg) scale(1); }
              50% { transform: rotate(12deg) scale(1.12); }
            }
            @keyframes blink-cursor {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>,
    portalTarget
  )
}
