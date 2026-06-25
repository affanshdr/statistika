'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * OrientationGuard
 *
 * Strategy:
 *   Layer 1 (Android Chrome): requestFullscreen() + screen.orientation.lock('landscape')
 *              → screen rotates automatically. Only attempted when lockScreen={true}.
 *   Layer 2 (iOS / denied): show an animated overlay that disappears as soon
 *              as the user rotates the device themselves.
 *
 * On desktop (non-touch device) → does nothing.
 * 
 * Props:
 *   lockScreen  — set to true only on game-level pages (default: false).
 *                 On dashboard pages, leave false so requestFullscreen is never
 *                 called, preventing the browser from intercepting user events.
 */
export default function OrientationGuard({
  children,
  lockScreen = false,
}: {
  children: React.ReactNode
  lockScreen?: boolean
}) {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false)
  const [lockAttempted, setLockAttempted] = useState(false)

  // Only true for actual touch devices — avoids false positives on small desktop windows
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false
    return (
      ('ontouchstart' in window) ||
      navigator.maxTouchPoints > 0
    )
  }

  const isPortrait = () => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  }

  // Attempt Layer 1: Fullscreen + Orientation Lock (works on Android Chrome)
  // Only invoked when lockScreen prop is true
  const tryOrientationLock = useCallback(async () => {
    if (!lockScreen) return
    if (!isMobileDevice()) return
    if (lockAttempted) return
    setLockAttempted(true)

    try {
      // Request fullscreen on the root element
      const el = document.documentElement
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: 'hide' })
      } else if ((el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (el as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
      }

      // Lock orientation to landscape
      const orientationAny = screen.orientation as unknown as { lock?: (type: string) => Promise<void> }
      if (orientationAny?.lock) {
        await orientationAny.lock('landscape')
      }
    } catch {
      // Silently fail — Layer 2 overlay will handle iOS / denied cases
    }
  }, [lockScreen, lockAttempted])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkOrientation = () => {
      if (!isMobileDevice()) {
        setIsPortraitMobile(false)
        return
      }
      setIsPortraitMobile(isPortrait())
    }

    // Initial check
    checkOrientation()

    // Attempt orientation lock on mount (Layer 1) — only when lockScreen=true
    tryOrientationLock()

    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation)
    screen.orientation?.addEventListener?.('change', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      screen.orientation?.removeEventListener?.('change', checkOrientation)
    }
  }, [tryOrientationLock])

  return (
    <>
      {children}

      {/* Layer 2: Portrait Overlay — animated guide to rotate device */}
      <AnimatePresence>
        {isPortraitMobile && (
          <motion.div
            key="orientation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'linear-gradient(135deg, #FAF6EE 0%, #FFF1DC 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            {/* Animated Phone Rotation Icon */}
            <motion.div
              animate={{ rotate: [0, 90, 90, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.4, 0.6, 1],
                repeatDelay: 0.5,
              }}
              style={{ fontSize: '72px', lineHeight: 1 }}
            >
              📱
            </motion.div>

            {/* Arrow animation */}
            <motion.div
              animate={{ x: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '28px', color: '#D97706' }}
            >
              ↻
            </motion.div>

            <div style={{ color: '#1C1917' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  color: '#D97706',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Detektif, siap-siap!
              </div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  margin: '0 0 10px',
                  lineHeight: 1.3,
                }}
              >
                Putar HP-mu ke Posisi<br />
                <span style={{ color: '#D97706' }}>Mendatar (Landscape)</span>
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: '#78716C',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '260px',
                  marginInline: 'auto',
                }}
              >
                Untuk pengalaman investigasi data yang lebih leluasa dan menyenangkan, putar HP-mu ke mode horizontal 🕵️
              </p>
            </div>

            {/* Pulsing border hint */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(217,119,6, 0)',
                  '0 0 0 12px rgba(217,119,6, 0.15)',
                  '0 0 0 0 rgba(217,119,6, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid rgba(217,119,6, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              🔄
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
