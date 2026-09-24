'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CLASS_STUDENTS, QuizDoor } from '@/app/siswa/game/_levels/level1/data/level1Data'

interface WaliKelasModalProps {
  door: QuizDoor
  onCollectData: () => void
  onClose: () => void
}

export default function WaliKelasModal({ door, onCollectData, onClose }: WaliKelasModalProps) {
  const info = CLASS_STUDENTS[door.id]
  if (!info) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(8, 16, 26, 0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="astu-dialogue-card"
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        {/* ASTU Retro Speaker Badge & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="astu-name-badge">
            <span>👩‍🏫</span> {info.teacher}
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--astu-cyan-bright)', fontFamily: 'var(--font-data)' }}>
            {door.label}
          </span>
        </div>

        {/* Comment Dialogue Box */}
        <div style={{
          background: 'rgba(0, 173, 181, 0.08)',
          border: '1.5px solid rgba(0, 173, 181, 0.35)',
          borderRadius: 12,
          padding: '16px 14px',
          color: '#F8FAFC',
          fontSize: 14,
          lineHeight: 1.6,
          boxShadow: 'inset 0 0 15px rgba(0, 173, 181, 0.05)'
        }}>
          💬 &quot;{info.comment}&quot;
        </div>

        {/* Data Sample Preview Grid */}
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--astu-gold-bright)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📊</span> Sampel Data Screen Time (7 Siswa):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {info.students.map((st, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(12, 26, 42, 0.85)',
                  border: '1.5px solid rgba(0, 173, 181, 0.25)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12.5
                }}
              >
                <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{st.name}</span>
                <span style={{ fontWeight: 900, color: 'var(--astu-gold-bright)', fontFamily: 'var(--font-data)' }}>{st.time} jam</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <button className="astu-menu-btn" style={{ flex: 1 }} onClick={onClose}>
            ← Kembali
          </button>
          <button className="astu-menu-btn astu-menu-btn-gold" style={{ flex: 1.6 }} onClick={() => { onCollectData(); onClose(); }}>
            📥 Simpan Data ke Jurnal ►
          </button>
        </div>
      </motion.div>
    </div>
  )
}
