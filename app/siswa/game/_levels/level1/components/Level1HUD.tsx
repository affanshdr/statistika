'use client'

import React from 'react'

interface Level1HUDProps {
  collectedDataCount: number
  totalTarget: number
  insideRoom: { label: string; color: string } | null
  onExitRoom?: () => void
  onOpenJournal: () => void
}

export default function Level1HUD({
  collectedDataCount,
  totalTarget = 35,
  insideRoom,
  onExitRoom,
  onOpenJournal
}: Level1HUDProps) {
  return (
    <>
      {/* Top Left Header Bar */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12 }}>
        {insideRoom && onExitRoom && (
          <button
            onClick={onExitRoom}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.88)',
              border: `1.5px solid ${insideRoom.color}`,
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            ← Keluar dari {insideRoom.label}
          </button>
        )}

        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
            {insideRoom ? `🏫 ${insideRoom.label}` : '🗺️ Lorong Eksplorasi'}
          </span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#6EE7B7' }}>
            DATA: {collectedDataCount} / {totalTarget}
          </span>
        </div>
      </div>

      {/* Top Right Step Counter & Journal Quick Button */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onOpenJournal}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00ADB5 0%, #008891 100%)',
            border: '1.5px solid #FFFFFF',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(0, 173, 181, 0.4)'
          }}
        >
          📖 Jurnal Bukti ({collectedDataCount})
        </button>
      </div>
    </>
  )
}
