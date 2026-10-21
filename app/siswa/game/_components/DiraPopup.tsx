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
    emoji: '👨‍🏫',
    title: 'Petunjuk Pak Sutrisno',
    body: 'Stevunt, sebelum menyusun tabel frekuensi dan histogram di papan tulis, kita perlu menghitung 3 komponen penting terlebih dahulu: Rentang (R), Banyak Kelas (k), dan Panjang Kelas (p). Ayo kita kerjakan!',
    cta: 'Siap, Pak!',
  },
  rentang: {
    emoji: '📏',
    title: 'Langkah 1: Rentang (R)',
    body: 'Rumusnya: Rentang (R) = data terbesar − data terkecil. Temukan dua nilai ekstrem tersebut dari 24 data screen time yang telah kamu kumpulkan, lalu masukkan ke dalam rumus!',
    cta: 'Siap, Pak!',
  },
  'banyak-kelas': {
    emoji: '📊',
    title: 'Langkah 2: Banyak Kelas (k)',
    body: 'Gunakan Aturan Sturges: k = 1 + 3,3 × log n. Nilai n adalah total sampel data kita (n = 24). Hitung dengan teliti!',
    cta: 'Saya hitung, Pak!',
  },
  'panjang-kelas': {
    emoji: '📐',
    title: 'Langkah 3: Panjang Kelas (p)',
    body: 'Langkah terakhir sebelum membuat interval: p = R ÷ k. Masukkan nilai Rentang (R) dan Banyak Kelas (k) yang sudah kamu peroleh tadi!',
    cta: 'Laksanakan, Pak!',
  },
}

// ── Keyword Highlights mapping ──────────────────────────────────────────────────
const HIGHLIGHTS: Record<string, string> = {
  'Rentang = data terbesar − data terkecil': '#9A3412',
  'k = 1 + 3,3 × log n': '#9A3412',
  'p = R ÷ k': '#9A3412',
  'Rentang': '#9A3412',
  'Banyak Kelas': '#9A3412',
  'Panjang Kelas': '#9A3412',
  'data terbesar': '#0E8388',
  'data terkecil': '#0E8388',
  'screen time': '#0E8388',
  'rumus Sturges': '#9A3412',
  'n': '#9A3412',
  'R': '#9A3412',
  'k': '#9A3412',
  'K': '#9A3412',
  'P': '#9A3412',
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
              background: 'rgba(20, 10, 5, 0.65)',
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
              background: 'linear-gradient(135deg, #8C6239 0%, #6E4720 100%)',
              borderTop: '2px solid #B48C50',
              borderLeft: '2px solid #B48C50',
              borderRight: '2px solid #B48C50',
              borderBottom: 'none',
              borderRadius: '8px 16px 0 0',
              padding: '5px 18px',
              color: '#FFFDF7',
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
              <span style={{ fontSize: '13px' }}>👨‍🏫</span>
              <span>PAK SUTRISNO</span>
              <span style={{
                fontSize: '9px',
                padding: '2px 8px',
                borderRadius: '50px',
                background: '#FEF3C7',
                border: '1px solid #D97706',
                color: '#9A3412',
                fontWeight: 800,
                marginLeft: '8px',
              }}>
                Langkah {step === 'banyak-kelas' ? 1 : step === 'rentang' ? 2 : 3} dari 3
              </span>
            </div>

            {/* Dialog text box - Light parchment board */}
            <div style={{
              background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
              border: '2.5px solid #8C6239',
              borderRadius: '0px 18px 18px 18px',
              padding: 'clamp(14px, 2.5vh, 20px) clamp(16px, 3vw, 24px) clamp(12px, 2vh, 18px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 0 25px rgba(180, 140, 80, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              position: 'relative',
              minHeight: 'clamp(95px, 18vh, 130px)',
            }}>
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

              {/* Progress bar (auto-dismiss countdown) */}
              {autoDismissMs > 0 && typewriterDone && (
                <div style={{
                  height: '4px',
                  background: 'rgba(140, 98, 57, 0.15)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  borderRadius: '0px 16px 0 0',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      background: 'linear-gradient(90deg, #D97706, #B45309)',
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
                  src="/Assets/Character/pak-sutrisno-portrait.png"
                  alt="Pak Sutrisno"
                  style={{ height: '100%', objectFit: 'contain', imageRendering: 'pixelated', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' }}
                />
              </div>

              {/* Dialog text */}
              <p style={{
                margin: 0,
                fontSize: isMobile ? '13px' : '15px',
                color: '#362014',
                fontWeight: 650,
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
                borderTop: '1.5px solid rgba(140, 98, 57, 0.2)',
                paddingTop: '10px',
                marginTop: '12px',
              }}>
                <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#78350F', fontWeight: 700 }}>
                  Persiapan Statistik — {msg.title}
                </span>
                <motion.button
                  className="game-btn"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: typewriterDone ? 1 : 0.5, x: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => typewriterDone && dismiss()}
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                    padding: isMobile ? '6px 16px' : '8px 22px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: 'auto',
                    boxShadow: typewriterDone ? '0 4px 14px rgba(14, 131, 136, 0.35)' : 'none',
                    cursor: typewriterDone ? 'pointer' : 'not-allowed',
                    border: typewriterDone ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1px solid #B48C50',
                    background: typewriterDone ? 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)' : 'rgba(140, 98, 57, 0.15)',
                    color: typewriterDone ? '#FFFFFF' : '#8C6239',
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
