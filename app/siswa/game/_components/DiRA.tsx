'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DiRAProps {
  message: string
  onDismiss?: () => void
  showAvatar?: boolean
}

function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
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

  return (
    <span>
      {displayed}
      <span style={{ animation: 'blink-cursor 1s infinite', color: 'var(--accent)' }}>|</span>
    </span>
  )
}

export default function DiRA({ message, onDismiss, showAvatar = true }: DiRAProps) {
  const [visible, setVisible] = useState(false)
  const [typewriterDone, setTypewriterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Track viewport size for mobile scaling
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Mount with short delay for smoother entry transition
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 350)
  }, [onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop scrim - absolute relative to parent */}
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

          {/* Dialogue Panel Overlay - absolute bottom relative to parent card */}
          <motion.div
            key="dira-panel"
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
              marginBottom: '-2px',
              position: 'relative',
              zIndex: 2,
            }}>
              <span>👤</span>
              <span>ASISTEN DIRA</span>
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
              {/* Agent Sprite Character */}
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
                <TypewriterText text={message} onDone={() => setTypewriterDone(true)} />
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
                  Level 1 — Analisis Berita
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
                  Paham, lanjut! →
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
