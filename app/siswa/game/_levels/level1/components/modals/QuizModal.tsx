'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuizDoor, CLASS_STUDENTS } from '@/app/siswa/game/_levels/level1/data/level1Data'

function generateAnswerPool(correctVal: number): number[] {
  const pool = new Set<number>([correctVal])
  let delta = 1
  while (pool.size < 4) {
    const candidateHigh = correctVal + delta
    const candidateLow = correctVal - delta
    if (candidateHigh > 0 && pool.size < 4) pool.add(candidateHigh)
    if (candidateLow > 0 && pool.size < 4) pool.add(candidateLow)
    delta++
  }
  return Array.from(pool).sort(() => Math.random() - 0.5)
}

interface QuizModalProps {
  door: QuizDoor
  isFD: boolean
  onCorrect: () => void
  onClose: () => void
}

export default function QuizModal({ door, isFD, onCorrect, onClose }: QuizModalProps) {
  const [shake, setShake] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [choices, setChoices] = useState<(number | string)[]>([])
  const [placedChoice, setPlacedChoice] = useState<number | string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    if (door.choices) {
      setChoices([...door.choices].sort(() => Math.random() - 0.5))
    } else {
      setChoices(generateAnswerPool(Number(door.quizA)))
    }
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setWrongCount(0)
  }, [door])

  const handlePlaceAnswer = (val: number | string) => {
    if (val === door.quizA) {
      setPlacedChoice(val)
      setIsCorrect(true)
      setIsWrong(false)
    } else {
      setPlacedChoice(val)
      setIsWrong(true)
      setIsCorrect(false)
      setShake(k => k + 1)
      setWrongCount(prev => prev + 1)
      setTimeout(() => {
        setPlacedChoice(null)
        setIsWrong(false)
      }, 800)
    }
  }

  const submit = () => {
    if (isCorrect) {
      onCorrect()
    }
  }

  const isTextQuestion = typeof door.quizA === 'string'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(8, 16, 26, 0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="astu-dialogue-card"
          style={{
            maxWidth: 440,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* ASTU Retro Speaker Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="astu-name-badge">
              <span>📍</span> {door.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--astu-gold-bright)', fontFamily: 'var(--font-data)' }}>
              AKSES TERKUNCI
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Di dalam pintu ini tersimpan sampel data investigasi. Jawab tantangan berikut untuk membuka kunci:
          </p>

          {(door.image || CLASS_STUDENTS[door.id]?.image) && (
            <div style={{
              width: '100%',
              height: 140,
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
              border: `2px solid var(--astu-gold)`,
              boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
            }}>
              <img
                src={door.image || CLASS_STUDENTS[door.id]?.image}
                alt={door.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 30%, rgba(8, 18, 30, 0.95) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '10px 14px'
              }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🏫 Ruangan {door.label}
                </span>
              </div>
            </div>
          )}

          {/* Question Box */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 12,
            padding: '16px 14px',
            textAlign: 'center',
            boxShadow: 'inset 0 0 15px rgba(245, 158, 11, 0.05)'
          }}>
            <div style={{ fontSize: door.quizQ.length > 50 ? 14 : 15, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.5 }}>
              &quot;{door.quizQ}&quot;
            </div>
          </div>

          {/* Choice Selection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {choices.map((c, idx) => {
              const selected = placedChoice === c
              return (
                <button
                  key={idx}
                  onClick={() => handlePlaceAnswer(c)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 10,
                    background: selected
                      ? (isCorrect ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)')
                      : 'rgba(20, 42, 66, 0.85)',
                    border: selected
                      ? (isCorrect ? '2px solid #6EE7B7' : '2px solid #FCA5A5')
                      : '1.5px solid rgba(0, 173, 181, 0.35)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 4px 14px rgba(0,0,0,0.5)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ color: 'var(--astu-gold-bright)', fontSize: 11 }}>►</span>
                  <span>{c}</span>
                </button>
              )
            })}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button className="astu-menu-btn" style={{ flex: 1 }} onClick={onClose}>
              ✕ Batal
            </button>
            <button className="astu-menu-btn astu-menu-btn-gold" style={{ flex: 1.5, opacity: isCorrect ? 1 : 0.5, cursor: isCorrect ? 'pointer' : 'not-allowed' }} disabled={!isCorrect} onClick={submit}>
              🚪 Masuk Ruangan ►
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
