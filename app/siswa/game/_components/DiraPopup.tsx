'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
export default function DiraPopup({ step, autoDismissMs = 7000, onDismiss }: DiraPopupProps) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0) // 0–100 for auto-dismiss bar
  const [typewriterDone, setTypewriterDone] = useState(false)

  const msg = DIRA_MESSAGES[step]

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 350) // wait for exit animation
  }, [onDismiss])

  // Mount with short delay so it feels like a notification "arriving"
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [step])

  // Auto-dismiss progress (starts only after typewriter finishes typing)
  useEffect(() => {
    if (!visible || autoDismissMs === 0 || !typewriterDone) return

    const interval = 50 // tick every 50ms
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

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Backdrop scrim ── */}
          <motion.div
            key="dira-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              borderRadius: '14px',
            }}
          />

          {/* ── Dialogue panel (Cutscene style) ── */}
          <motion.div
            key={`dira-popup-${step}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 501,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Name tag tab */}
            <div style={{
              alignSelf: 'flex-start',
              background: 'rgba(10, 20, 15, 0.95)',
              borderTop: '2px solid rgba(0, 255, 136, 0.3)',
              borderLeft: '2px solid rgba(0, 255, 136, 0.3)',
              borderRight: '2px solid rgba(0, 255, 136, 0.3)',
              borderBottom: 'none',
              borderRadius: '6px 14px 0 0',
              padding: '4px 16px',
              color: 'var(--accent)',
              fontSize: 'clamp(11px, 1.8vh, 13px)',
              fontWeight: 800,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
            }}>
              <span>👤</span>
              <span>ASISTEN DIRA</span>
              <span style={{
                fontSize: '8px',
                padding: '1px 6px',
                borderRadius: '50px',
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: '#4ade80',
                fontWeight: 700,
                marginLeft: '8px',
              }}>
                Langkah {step === 'rentang' ? 1 : step === 'banyak-kelas' ? 2 : 3} dari 3
              </span>
            </div>

            {/* Dialog text box */}
            <div style={{
              background: 'rgba(10, 20, 18, 0.95)',
              border: '2px solid rgba(0, 255, 136, 0.4)',
              borderRadius: '0px 14px 14px 14px',
              padding: 'clamp(14px, 2.5vh, 20px) clamp(16px, 3vw, 24px) clamp(12px, 2vh, 18px)',
              boxShadow: '0 10px 25px rgba(0, 255, 136, 0.1), inset 0 0 20px rgba(0, 255, 136, 0.03)',
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
                  background: 'rgba(255,255,255,0.06)',
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
                      background: 'rgba(0, 255, 136, 0.5)',
                      width: `${100 - progress}%`,
                      transition: 'width 0.05s linear',
                    }}
                  />
                </div>
              )}

              {/* ── Agent Image (Cutscene style) ── */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% - 2px)',
                right: 'clamp(12px, 3vw, 28px)',
                height: 'clamp(110px, 22vh, 190px)',
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
                    right: 'clamp(-28px, -4vw, -38px)',
                    background: 'rgba(10, 20, 15, 0.95)',
                    border: '2px solid var(--accent)',
                    borderRadius: '50%',
                    padding: 'clamp(4px, 0.8vh, 6px) clamp(8px, 1.5vw, 12px)',
                    fontWeight: 900,
                    fontSize: 'clamp(11px, 1.8vh, 15px)',
                    color: 'var(--accent)',
                    transform: 'rotate(12deg)',
                    boxShadow: '3px 3px 0px rgba(0, 255, 136, 0.3)',
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
                fontSize: 'clamp(12px, 2vh, 15px)',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                lineHeight: 1.65,
                paddingRight: 'clamp(95px, 18vw, 165px)',
              }}>
                <span style={{ marginRight: '6px' }}>{msg.emoji}</span>
                <DiraTypewriter text={msg.body} onDone={() => setTypewriterDone(true)} />
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '10px',
              }}>
                <span style={{ fontSize: 'clamp(10px, 1.6vh, 12px)', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                  Persiapan Statistik — {msg.title}
                </span>
                <motion.button
                  className="game-btn game-btn-primary"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: typewriterDone ? 1 : 0.4, x: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => typewriterDone && dismiss()}
                  style={{
                    fontSize: 'clamp(11px, 1.8vh, 13px)',
                    padding: 'clamp(6px, 1vh, 8px) clamp(16px, 2.5vw, 22px)',
                    borderRadius: '7px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: 'auto',
                    boxShadow: typewriterDone ? 'var(--accent-glow)' : 'none',
                    cursor: typewriterDone ? 'pointer' : 'not-allowed',
                    border: 'none',
                    background: typewriterDone ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    color: typewriterDone ? '#000' : 'rgba(255,255,255,0.3)',
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
    </AnimatePresence>
  )
}
