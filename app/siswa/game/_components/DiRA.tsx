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
              background: 'rgba(20, 10, 5, 0.65)',
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
            </div>

            {/* Dialog text box - Light parchment board */}
            <div style={{
              background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
              border: '2.5px solid #8C6239',
              borderRadius: '0px 18px 18px 18px',
              padding: isMobile ? '14px 18px' : '20px 24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 0 25px rgba(180, 140, 80, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? '95px' : '115px',
              boxSizing: 'border-box',
              position: 'relative',
            }}>
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

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
                <TypewriterText text={message} onDone={() => setTypewriterDone(true)} />
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                borderTop: '1.5px solid rgba(140, 98, 57, 0.2)',
                paddingTop: '10px',
              }}>
                <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#78350F', fontWeight: 700 }}>
                  Level 1 — Analisis Berita
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
