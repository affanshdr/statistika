'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  const lockAttempted = useRef(false)

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
    if (lockAttempted.current) return
    lockAttempted.current = true

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
  }, [lockScreen])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkOrientation = () => {
      if (!isMobileDevice()) {
        setIsPortraitMobile(prev => (prev ? false : prev))
        return
      }
      const portrait = isPortrait()
      setIsPortraitMobile(prev => (prev === portrait ? prev : portrait))
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
              background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
              border: '6px solid #F59E0B',
              boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            {/* Corner Viewfinder Brackets */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', width: '24px', height: '24px', borderTop: '4px solid #F59E0B', borderLeft: '4px solid #F59E0B', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '16px', right: '16px', width: '24px', height: '24px', borderTop: '4px solid #F59E0B', borderRight: '4px solid #F59E0B', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '24px', height: '24px', borderBottom: '4px solid #F59E0B', borderLeft: '4px solid #F59E0B', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '24px', height: '24px', borderBottom: '4px solid #F59E0B', borderRight: '4px solid #F59E0B', pointerEvents: 'none' }} />

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
              animate={{ x: [0, 12, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '28px', color: '#FBBF24' }}
            >
              ↻
            </motion.div>

            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '3px',
                  color: '#FBBF24',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Papan Petunjuk Detektif
              </div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FDE047',
                  margin: '0 0 10px',
                  lineHeight: 1.3,
                }}
              >
                Putar HP-mu ke Posisi<br />
                <span style={{ color: '#38BDF8' }}>Mendatar (Landscape)</span>
              </h2>
              <p
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#FEF3C7',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '280px',
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
                  '0 0 0 0 rgba(140, 98, 57, 0)',
                  '0 0 0 14px rgba(140, 98, 57, 0.25)',
                  '0 0 0 0 rgba(140, 98, 57, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2.5px solid #8C6239',
                background: '#FFFDF7',
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
