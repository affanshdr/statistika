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
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.96)',
          border: `2px solid ${door.color}`,
          borderRadius: 24,
          padding: '24px 20px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: `${door.color}22`, border: `2px solid ${door.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            👩‍🏫
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>{info.teacher}</div>
            <div style={{ fontSize: 12, color: door.color, fontWeight: 700 }}>{door.label}</div>
          </div>
        </div>

        {/* Comment Bubble */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, color: '#E2E8F0', fontSize: 13, lineHeight: 1.5 }}>
          💬 &quot;{info.comment}&quot;
        </div>

        {/* Data Sample Preview Grid */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            📊 Sampel Data Screen Time (7 Siswa):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {info.students.map((st, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#CBD5E1' }}>{st.name}</span>
                <span style={{ fontWeight: 800, color: '#6EE7B7' }}>{st.time} jam</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="game-btn game-btn-secondary" style={{ flex: 1 }} onClick={onClose}>Kembali</button>
          <button className="game-btn game-btn-primary" style={{ flex: 1.5 }} onClick={() => { onCollectData(); onClose(); }}>
            📥 Simpan Data ke Jurnal
          </button>
        </div>
      </motion.div>
    </div>
  )
}
