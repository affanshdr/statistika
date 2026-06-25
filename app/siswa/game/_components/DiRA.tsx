'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [typewriterDone, setTypewriterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Portal target: prefer .game-root (fills full viewport without position:fixed issues)
  // Falls back to document.body if game-root not found.
  const [portalTarget, setPortalTarget] = useState<Element | null>(null)

  useEffect(() => {
    const target = document.querySelector('.game-root') ?? document.body
    setPortalTarget(target)
    setMounted(true)
  }, [])

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

  if (!mounted || !portalTarget) return null

  const overlay = (
    <AnimatePresence>
      {visible && (
        <>
          {/* Full-game backdrop — position:absolute fills .game-root which spans full viewport */}
          <motion.div
            key="dira-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Dialogue panel — anchored to bottom of game-root */}
          <motion.div
            key="dira-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
              <span style={{ fontSize: '13px' }}>👤</span>
              <span>ASISTEN DIRA</span>
            </div>

            {/* Dialog text box */}
            <div style={{
              background: 'rgba(10, 20, 18, 0.95)',
              border: '2px solid rgba(217,119,6, 0.4)',
              borderRadius: '0px 14px 14px 14px',
              padding: isMobile ? '14px 18px' : '20px 24px',
              boxShadow: '0 10px 25px rgba(217,119,6, 0.1), inset 0 0 20px rgba(217,119,6, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? '95px' : '115px',
              boxSizing: 'border-box',
              position: 'relative',
            }}>
              {/* Agent Sprite Character — floats above the text box */}
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
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
                  onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
                  alt="Agent DIRA"
                  style={{ height: '100%', objectFit: 'contain' }}
                />

                {/* "Go!" speech bubble */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
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
                    animation: 'dira-pulse-go 1s infinite alternate',
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
                <TypewriterText text={message} onDone={() => setTypewriterDone(true)} />
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                borderTop: '1px solid rgba(180,140,80,0.12)',
                paddingTop: '10px',
              }}>
                <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#A8A29E', fontWeight: 600 }}>
                  Level 1 — Analisis Berita
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
                  Paham, lanjut! →
                </motion.button>
              </div>
            </div>
          </motion.div>

          <style>{`
            @keyframes dira-pulse-go {
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

  // Portal ke .game-root agar position:absolute mengisi seluruh game viewport
  // (termasuk GameHeader), tanpa perlu position:fixed yang bermasalah di Android fullscreen.
  return createPortal(overlay, portalTarget)
}
