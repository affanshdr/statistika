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
      const t = setTimeout(() => setVisible(false), 3500)
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
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '14px',
        backdropFilter: 'blur(16px)',
        border: isOffline
          ? '1px solid rgba(239, 68, 68, 0.35)'
          : '1px solid rgba(0, 255, 136, 0.35)',
        background: isOffline
          ? 'rgba(20, 8, 8, 0.92)'
          : 'rgba(8, 20, 12, 0.92)',
        boxShadow: isOffline
          ? '0 8px 32px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239,68,68,0.1)'
          : '0 8px 32px rgba(0, 255, 136, 0.2), 0 0 0 1px rgba(0,255,136,0.08)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 700,
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        animation: 'networkBannerIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isOffline ? '#ef4444' : '#00FF88',
          flexShrink: 0,
          boxShadow: isOffline
            ? '0 0 6px rgba(239,68,68,0.8)'
            : '0 0 6px rgba(0,255,136,0.8)',
          animation: isOffline ? 'networkPulse 1.4s infinite' : 'none',
        }}
      />

      {/* Icon + Text */}
      <span>
        {isOffline ? (
          <>
            <span style={{ marginRight: '6px' }}>📡</span>
            <span style={{ color: '#fca5a5' }}>Koneksi terputus</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginLeft: '6px' }}>
              — Sesi tersimpan di browser
            </span>
          </>
        ) : (
          <>
            <span style={{ marginRight: '6px' }}>✅</span>
            <span style={{ color: '#00FF88' }}>Terhubung kembali!</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginLeft: '6px' }}>
              — Kamu bisa melanjutkan
            </span>
          </>
        )}
      </span>

      <style>{`
        @keyframes networkBannerIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);   }
        }
        @keyframes networkPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
