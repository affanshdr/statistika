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
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{
            maxWidth: 420,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: `2.5px solid ${door.color}66`,
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: door.color, marginBottom: 8 }}>🔐 {door.label} — Jawab untuk membuka!</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.6 }}>Di dalam pintu ini tersimpan data screen time. Jawab soal berikut untuk membuka pintu:</p>
          </div>

          {(door.image || CLASS_STUDENTS[door.id]?.image) && (
            <div style={{
              width: '100%',
              height: 130,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              border: `1.5px solid ${door.color}66`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
            }}>
              <img
                src={door.image || CLASS_STUDENTS[door.id]?.image}
                alt={door.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 20%, rgba(15, 35, 56, 0.9) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '8px 12px'
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🏫 Ruangan {door.label}
                </span>
              </div>
            </div>
          )}

          <div style={{ background: `${door.color}11`, border: `1.5px solid ${door.color}33`, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: door.quizQ.length > 50 ? 14 : 16, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.4 }}>{door.quizQ}</div>
          </div>

          {/* Choice Selection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {choices.map((c, idx) => (
              <button
                key={idx}
                onClick={() => handlePlaceAnswer(c)}
                style={{
                  padding: '12px 10px',
                  borderRadius: 12,
                  background: placedChoice === c
                    ? (isCorrect ? '#10B981' : '#EF4444')
                    : 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="game-btn game-btn-secondary" style={{ flex: 1 }} onClick={onClose}>Batal</button>
            <button className="game-btn game-btn-primary" style={{ flex: 1.5 }} disabled={!isCorrect} onClick={submit}>Masuk Ruangan →</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
