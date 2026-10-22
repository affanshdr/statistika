'use client'

import { useEffect, useState } from 'react'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'

export default function NetworkStatusBanner() {
  const status = useNetworkStatus()
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'offline') {
      setVisible(true)
    } else if (status === 'reconnected') {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 4000)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [status])

  if (!mounted || !visible) return null

  const isOffline = status === 'offline'

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 18px',
        maxWidth: '92vw',
        borderRadius: '50px',
        backdropFilter: 'blur(16px)',
        border: isOffline
          ? '1.5px solid #EF4444'
          : '1.5px solid #10B981',
        background: isOffline
          ? 'linear-gradient(135deg, rgba(35, 15, 12, 0.96) 0%, rgba(20, 8, 6, 0.96) 100%)'
          : 'linear-gradient(135deg, rgba(12, 35, 20, 0.96) 0%, rgba(6, 20, 12, 0.96) 100%)',
        boxShadow: isOffline
          ? '0 8px 32px rgba(0, 0, 0, 0.55), 0 0 16px rgba(239, 68, 68, 0.35)'
          : '0 8px 32px rgba(0, 0, 0, 0.55), 0 0 16px rgba(16, 185, 129, 0.35)',
        color: '#FFFFFF',
        fontSize: '12.5px',
        fontWeight: 700,
        fontFamily: 'var(--font-ui, sans-serif)',
        whiteSpace: 'nowrap',
        animation: 'networkBannerIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Status indicator dot */}
      <div
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          background: isOffline ? '#EF4444' : '#10B981',
          flexShrink: 0,
          boxShadow: isOffline
            ? '0 0 8px #EF4444'
            : '0 0 8px #10B981',
          animation: isOffline ? 'networkPulse 1.4s infinite' : 'none',
        }}
      />

      {/* Icon + Text Notification */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {isOffline ? (
          <>
            <span>📡</span>
            <span style={{ color: '#FCA5A5', fontWeight: 800 }}>Koneksi Terputus (Mode Offline)</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
              — Progres tetap aman tersimpan di browser
            </span>
          </>
        ) : (
          <>
            <span>✅</span>
            <span style={{ color: '#6EE7B7', fontWeight: 800 }}>Koneksi Pulih!</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
              — Data progres otomatis disinkronkan ke cloud
            </span>
          </>
        )}
      </span>

      <style>{`
        @keyframes networkBannerIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes networkPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
