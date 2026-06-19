'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GameReadyOverlayProps {
  onComplete: () => void
  cognitiveStyle: 'FI' | 'FD'
}

export default function GameReadyOverlay({ onComplete, cognitiveStyle }: GameReadyOverlayProps) {
  const isFI = cognitiveStyle === 'FI'
  const accent  = isFI ? '#6366f1' : '#10b981'
  const accent2 = isFI ? '#818cf8' : '#34d399'
  const glow    = isFI ? 'rgba(99,102,241,0.6)' : 'rgba(16,185,129,0.6)'
  const glow2   = isFI ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.12)'

  // Phase: 'closed' → 'opening' → 'question' → '3' → '2' → '1' → 'go' → done
  type Phase = 'closed' | 'opening' | 'question' | '3' | '2' | '1' | 'go'
  const [phase, setPhase] = useState<Phase>('closed')

  useEffect(() => {
    // 0ms   → start opening panels
    // 800ms → panels fully open, show question
    // 2200ms→ show 3
    // 3000ms→ show 2
    // 3800ms→ show 1
    // 4600ms→ show GO!
    // 5600ms→ call onComplete

    const t0 = setTimeout(() => { setPhase('opening') }, 100)
    const t1 = setTimeout(() => { setPhase('question') }, 900)
    const t2 = setTimeout(() => { setPhase('3') }, 2300)
    const t3 = setTimeout(() => { setPhase('2') }, 3100)
    const t4 = setTimeout(() => { setPhase('1') }, 3900)
    const t5 = setTimeout(() => { setPhase('go') }, 4700)
    const t6 = setTimeout(() => { onComplete() }, 5800)

    // Speech: Speak "Apakah kamu sudah siap untuk pembuktian?" exactly when question starts with a female voice
    const tSpeech = setTimeout(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()

        const speak = () => {
          const voices = window.speechSynthesis.getVoices()
          const u = new SpeechSynthesisUtterance('Apakah kamu sudah siap untuk pembuktian?')
          u.lang = 'id-ID'
          u.rate = 0.88
          u.pitch = 1.25 // Slightly higher pitch to make it sound feminine if default voice is fallback

          const idVoices = voices.filter(v => v.lang.toLowerCase().startsWith('id'))
          let selectedVoice = null

          // Priority 1: Indonesian female voice names
          selectedVoice = idVoices.find(v => {
            const nameLower = v.name.toLowerCase()
            return nameLower.includes('gadis') || 
                   nameLower.includes('female') || 
                   nameLower.includes('wanita') ||
                   nameLower.includes('zira') ||
                   nameLower.includes('sana') ||
                   nameLower.includes('anri')
          })

          // Priority 2: Chrome's Google Bahasa Indonesia (typically female)
          if (!selectedVoice) {
            selectedVoice = idVoices.find(v => v.name.toLowerCase().includes('google'))
          }

          // Priority 3: Edge online natural voice
          if (!selectedVoice) {
            selectedVoice = idVoices.find(v => v.name.toLowerCase().includes('online'))
          }

          // Priority 4: Any Indonesian voice
          if (!selectedVoice && idVoices.length > 0) {
            selectedVoice = idVoices[0]
          }

          // Priority 5: Any female voice in general
          if (!selectedVoice) {
            selectedVoice = voices.find(v => {
              const nameLower = v.name.toLowerCase()
              return nameLower.includes('female') || nameLower.includes('wanita')
            })
          }

          if (selectedVoice) {
            u.voice = selectedVoice
          }

          window.speechSynthesis.speak(u)
        }

        const voices = window.speechSynthesis.getVoices()
        if (voices && voices.length > 0) {
          speak()
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            speak()
            window.speechSynthesis.onvoiceschanged = null
          }
        }
      }
    }, 900)

    return () => {
      [t0, t1, t2, t3, t4, t5, t6, tSpeech].forEach(clearTimeout)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const panelVariants = {
    closed: { x: 0 },
    open:   { x: '100%' },
  }
  const panelVariantsLeft = {
    closed: { x: 0 },
    open:   { x: '-100%' },
  }

  const isPanelOpen = phase !== 'closed'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* ── Background: game bg showing underneath ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #0d0221 0%, #0a0f2e 40%, #07091c 100%)',
      }} />
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />
      {/* Center glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${glow2} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ─────────────────────────────────────────
          The two sliding panels (left & right)
      ───────────────────────────────────────── */}

      {/* LEFT PANEL */}
      <motion.div
        variants={panelVariantsLeft}
        initial="closed"
        animate={isPanelOpen ? 'open' : 'closed'}
        transition={{ duration: 0.75, ease: [0.7, 0, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '50%', height: '100%',
          background: `linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          borderRight: `3px solid ${accent}`,
          boxShadow: `4px 0 30px ${glow}, inset -20px 0 40px rgba(0,0,0,0.5)`,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '32px',
          overflow: 'hidden',
        }}
      >
        {/* Panel texture lines */}
        {[20,35,50,65,80].map(p => (
          <div key={p} style={{
            position: 'absolute', left: 0, top: `${p}%`, width: '100%', height: '1px',
            background: 'rgba(255,255,255,0.04)',
          }} />
        ))}
        {/* Rivets */}
        {[15,50,85].map((t,i) => (
          <div key={i} style={{
            position: 'absolute', right: '12px', top: `${t}%`,
            width: '8px', height: '8px', borderRadius: '50%',
            background: `radial-gradient(circle, #aaa 0%, #555 100%)`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }} />
        ))}
        {/* Panel label */}
        <div style={{
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)',
          fontSize: '10px', letterSpacing: '3px',
          color: `${accent}`, fontWeight: 700,
          fontFamily: 'monospace', opacity: 0.7,
        }}>SKEPTIKOS SYSTEM</div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        variants={panelVariants}
        initial="closed"
        animate={isPanelOpen ? 'open' : 'closed'}
        transition={{ duration: 0.75, ease: [0.7, 0, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '50%', height: '100%',
          background: `linear-gradient(200deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          borderLeft: `3px solid ${accent}`,
          boxShadow: `-4px 0 30px ${glow}, inset 20px 0 40px rgba(0,0,0,0.5)`,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '32px',
          overflow: 'hidden',
        }}
      >
        {[20,35,50,65,80].map(p => (
          <div key={p} style={{
            position: 'absolute', left: 0, top: `${p}%`, width: '100%', height: '1px',
            background: 'rgba(255,255,255,0.04)',
          }} />
        ))}
        {[15,50,85].map((t,i) => (
          <div key={i} style={{
            position: 'absolute', left: '12px', top: `${t}%`,
            width: '8px', height: '8px', borderRadius: '50%',
            background: `radial-gradient(circle, #aaa 0%, #555 100%)`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }} />
        ))}
        <div style={{
          writingMode: 'vertical-rl',
          fontSize: '10px', letterSpacing: '3px',
          color: `${accent}`, fontWeight: 700,
          fontFamily: 'monospace', opacity: 0.7,
        }}>INVESTIGASI AKTIF</div>
      </motion.div>

      {/* ──────────────────────────────────────
          CENTER CONTENT (revealed after open)
      ────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── QUESTION PHASE ── */}
        {phase === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'relative', zIndex: 30,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '24px', textAlign: 'center', padding: '0 24px',
              maxWidth: '520px',
            }}
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '52px', filter: `drop-shadow(0 0 16px ${accent})` }}
            >🔍</motion.div>

            {/* Badge */}
            <div style={{
              background: `linear-gradient(90deg, ${accent}, ${accent2})`,
              color: '#fff', fontSize: '11px', fontWeight: 900,
              letterSpacing: '3px', padding: '5px 18px', borderRadius: '20px',
              textTransform: 'uppercase', boxShadow: `0 0 20px ${glow}`,
            }}>MISI TERBUKA</div>

            {/* Main question */}
            <div style={{
              fontSize: 'clamp(22px, 4.5vw, 34px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.25,
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              textShadow: `0 0 30px ${glow}`,
              letterSpacing: '-0.5px',
            }}>
              Apakah Kamu Sudah Siap
              <br />
              <span style={{ color: accent2 }}>untuk Pembuktian?</span>
            </div>

            {/* Sub text */}
            <div style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.55)',
              fontFamily: 'monospace', letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
              Bersiaplah — hitungan mundur dimulai
            </div>

            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: '80px', height: '80px',
                top: '-14px',
                borderRadius: '50%',
                border: `2px solid ${accent}`,
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}

        {/* ── COUNTDOWN 3, 2, 1 ── */}
        {(phase === '3' || phase === '2' || phase === '1') && (
          <motion.div
            key={phase}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1.4, 0.36, 1] }}
            style={{
              position: 'relative', zIndex: 30,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px',
            }}
          >
            {/* Outer ring */}
            <div style={{
              position: 'relative',
              width: '160px', height: '160px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  border: `3px solid transparent`,
                  borderTopColor: accent,
                  borderRightColor: accent2,
                  boxShadow: `0 0 20px ${glow}`,
                }}
              />
              {/* Static ring */}
              <div style={{
                position: 'absolute', inset: '8px',
                borderRadius: '50%',
                border: `1px solid rgba(255,255,255,0.08)`,
              }} />
              {/* Number */}
              <div style={{
                fontSize: '88px', fontWeight: 900, lineHeight: 1,
                color: accent2,
                textShadow: `0 0 40px ${glow}, 0 0 80px ${glow}`,
                fontFamily: 'monospace',
              }}>{phase}</div>
            </div>
            <div style={{
              fontSize: '12px', letterSpacing: '4px', fontWeight: 700,
              color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}>Bersiap...</div>
          </motion.div>
        )}

        {/* ── GO! ── */}
        {phase === 'go' && (
          <motion.div
            key="go"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.18, 1.5, 0.38, 1] }}
            style={{
              position: 'relative', zIndex: 30,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '16px',
            }}
          >
            {/* Burst rings */}
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 3.5, opacity: 0 }}
                transition={{ duration: 0.9, delay, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: '120px', height: '120px',
                  borderRadius: '50%',
                  border: `2px solid ${accent}`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: 'clamp(44px, 8vw, 68px)',
                fontWeight: 900,
                letterSpacing: '3px',
                fontFamily: '"Impact", "Arial Black", monospace',
                color: '#fff',
                textShadow: `0 0 30px ${glow}, 0 0 60px ${glow}`,
              }}
            >MULAI!</motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '14px', color: accent2,
                fontFamily: 'monospace', letterSpacing: '2px',
                textTransform: 'uppercase', fontWeight: 700,
              }}
            >Penyelidikan Dimulai...</motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Progress bar at bottom ── */}
      {phase !== 'closed' && (
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(380px, 80vw)', zIndex: 30,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px',
            color: 'rgba(255,255,255,0.35)', marginBottom: '6px',
          }}>
            <span>MEMUAT PENYELIDIKAN</span>
            <span style={{ color: accent }}>SKEPTIKOS v1.0</span>
          </div>
          <div style={{
            width: '100%', height: '3px',
            background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4.9, ease: 'linear' }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${accent}, ${accent2})`,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Neon seam line at center ── */}
      <motion.div
        initial={{ opacity: 1, scaleY: 1 }}
        animate={{ opacity: isPanelOpen ? 0 : 1, scaleY: isPanelOpen ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          position: 'absolute', top: 0, left: '50%',
          width: '3px', height: '100%',
          background: `linear-gradient(to bottom, transparent 0%, ${accent} 20%, ${accent} 80%, transparent 100%)`,
          boxShadow: `0 0 12px ${glow}`,
          transform: 'translateX(-50%)',
          zIndex: 25, pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes scanLine {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}
