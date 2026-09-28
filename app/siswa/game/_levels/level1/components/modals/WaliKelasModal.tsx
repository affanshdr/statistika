'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CLASS_STUDENTS, QuizDoor } from '@/app/siswa/game/_levels/level1/data/level1Data'

interface WaliKelasModalProps {
  door: QuizDoor
  onCollectData: () => void
  onClose: () => void
}

function TeacherTypewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayedText('')
    indexRef.current = 0
    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(timer)
        onDone?.()
      }
    }, 25)
    return () => clearInterval(timer)
  }, [text, onDone])

  return (
    <span>
      {displayedText}
      {displayedText.length < text.length && (
        <span style={{ animation: 'blink 0.8s infinite', color: 'var(--astu-gold-bright)', marginLeft: 2 }}>|</span>
      )}
    </span>
  )
}

export default function WaliKelasModal({ door, onCollectData, onClose }: WaliKelasModalProps) {
  const [isTypingDone, setIsTypingDone] = useState(false)
  const info = CLASS_STUDENTS[door.id]
  if (!info) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(8, 16, 26, 0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
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
          <motion.span
            className="astu-name-badge"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.span
              animate={{ rotate: isTypingDone ? 0 : [-5, 5, -5] }}
              transition={{ duration: 0.4, repeat: isTypingDone ? 0 : Infinity }}
            >
              👩‍🏫
            </motion.span>{' '}
            {info.teacher}
          </motion.span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--astu-cyan-bright)', fontFamily: 'var(--font-data)' }}>
            {door.label}
          </span>
        </div>

        {/* Comment Dialogue Box with Speech Pointer Tail */}
        <div style={{ position: 'relative' }}>
          {/* Top pointer tail */}
          <div style={{
            position: 'absolute',
            top: -7,
            left: 24,
            width: 12,
            height: 12,
            background: 'rgba(12, 26, 42, 0.98)',
            borderTop: '1.5px solid rgba(0, 173, 181, 0.35)',
            borderLeft: '1.5px solid rgba(0, 173, 181, 0.35)',
            transform: 'rotate(45deg)',
            zIndex: 2,
          }} />

          <div style={{
            background: 'rgba(0, 173, 181, 0.08)',
            border: '1.5px solid rgba(0, 173, 181, 0.35)',
            borderRadius: 12,
            padding: '16px 14px',
            color: '#F8FAFC',
            fontSize: 14,
            lineHeight: 1.6,
            boxShadow: 'inset 0 0 15px rgba(0, 173, 181, 0.05)',
            position: 'relative',
            zIndex: 1,
            minHeight: 60,
          }}>
            💬 &quot;
            <TeacherTypewriter
              text={info.comment}
              onDone={() => setIsTypingDone(true)}
            />
            &quot;
          </div>
        </div>

        {/* Data Sample Preview Grid */}
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--astu-gold-bright)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📊</span> Sampel Data Screen Time (7 Siswa):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {info.students.map((st, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.1 + idx * 0.04 }}
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <button className="astu-menu-btn" style={{ flex: 1 }} onClick={onClose}>
            ← Kembali
          </button>
          <button className="astu-menu-btn astu-menu-btn-gold" style={{ flex: 1.6 }} onClick={() => { onCollectData(); onClose(); }}>
            📥 Simpan Data ke Misi ►
          </button>
        </div>
      </motion.div>
    </div>
  )
}

