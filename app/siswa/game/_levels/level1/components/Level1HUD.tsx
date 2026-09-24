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
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 100, display: 'flex', alignItems: 'center', gap: 10 }}>
        {insideRoom && onExitRoom && (
          <button
            onClick={onExitRoom}
            className="astu-menu-btn"
            style={{ padding: '6px 12px', fontSize: 11.5 }}
          >
            ← Keluar {insideRoom.label}
          </button>
        )}

        <div className="astu-dialogue-card" style={{ padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="astu-name-badge" style={{ fontSize: 10, padding: '2px 8px' }}>
            {insideRoom ? `🏫 ${insideRoom.label}` : '🗺️ LORONG'}
          </span>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--astu-gold-bright)', fontFamily: 'var(--font-data)' }}>
            DATA: {collectedDataCount} / {totalTarget}
          </span>
        </div>
      </div>

      {/* Top Right Journal Button */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onOpenJournal}
          className="astu-menu-btn astu-menu-btn-gold"
          style={{ padding: '6px 14px', fontSize: 11.5 }}
        >
          📖 Jurnal Bukti ({collectedDataCount}) ►
        </button>
      </div>
    </>
  )
}
