'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuestionConfig } from '../data/level2StatData'
import { QUESTION_TIME_LIMIT, TOTAL_QUESTIONS } from '../config/level2Config'

interface QuizPanelProps {
  question: QuestionConfig
  questionIndex: number // 0-based
  dataValues: number[]
  onSubmitAnswer: (answer: string, isTimeout: boolean, timeSpent: number) => void
}

export default function QuizPanel({
  question,
  questionIndex,
  dataValues,
  onSubmitAnswer,
}: QuizPanelProps) {
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())
  const submittedRef = useRef(false)

  // Reset state when question changes
  useEffect(() => {
    setAnswer('')
    setTimeLeft(QUESTION_TIME_LIMIT)
    setIsSubmitted(false)
    submittedRef.current = false
    startTimeRef.current = Date.now()
  }, [question.id])

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timeout
          if (!submittedRef.current) {
            submittedRef.current = true
            setIsSubmitted(true)
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
            onSubmitAnswer('', true, elapsed)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [question.id, isSubmitted, onSubmitAnswer])

  const handleSubmit = useCallback(() => {
    if (submittedRef.current || isSubmitted) return
    if (answer.trim() === '') return

    submittedRef.current = true
    setIsSubmitted(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    onSubmitAnswer(answer, false, elapsed)
  }, [answer, isSubmitted, onSubmitAnswer])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Timer color
  const timerColor = timeLeft > 30 ? '#10B981' : timeLeft > 10 ? '#FBBF24' : '#EF4444'
  const timerPercent = (timeLeft / QUESTION_TIME_LIMIT) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      {/* Header: Question number + Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Question badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            padding: '4px 12px',
            background: 'rgba(14, 131, 136, 0.15)',
            border: '1px solid rgba(14, 131, 136, 0.3)',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#00ADB5',
            letterSpacing: '0.5px',
          }}>
            SOAL {questionIndex + 1}/{TOTAL_QUESTIONS}
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#94A3B8',
          }}>
            {question.topicLabel}
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: `${timerColor}12`,
          border: `1.5px solid ${timerColor}40`,
          borderRadius: '12px',
        }}>
          <span style={{ fontSize: '14px' }}>⏱️</span>
          <span style={{
            fontSize: '18px',
            fontWeight: 900,
            fontFamily: 'var(--font-data)',
            color: timerColor,
            minWidth: '36px',
            textAlign: 'center',
          }}>
            {timeLeft}
          </span>
          <span style={{ fontSize: '10px', color: timerColor, fontWeight: 700 }}>detik</span>
        </div>
      </div>

      {/* Timer progress bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{
            height: '100%',
            background: timerColor,
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
      }}>
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === questionIndex ? '24px' : '10px',
              height: '10px',
              borderRadius: '5px',
              background: i < questionIndex
                ? '#10B981'
                : i === questionIndex
                  ? '#00ADB5'
                  : 'rgba(255, 255, 255, 0.1)',
              border: i === questionIndex ? '1.5px solid #00ADB5' : '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="game-card" style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Data reference */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(251, 191, 36, 0.06)',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          borderRadius: '10px',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#FBBF24',
            letterSpacing: '1px',
            marginBottom: '6px',
          }}>
            📊 DATA AKTIF
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {dataValues.map((val, idx) => (
              <span
                key={idx}
                style={{
                  padding: '3px 8px',
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.15)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FCD34D',
                  fontFamily: 'var(--font-data)',
                }}
              >
                {val}
              </span>
            ))}
          </div>
        </div>

        {/* Question text */}
        <div>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: '#F8FAFC',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
          }}>
            {question.questionText}
          </p>
        </div>

        {/* Answer input */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Jawabanmu
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Masukkan angka..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitted}
              autoFocus
              style={{
                padding: '12px 16px',
                background: isSubmitted ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                border: `1.5px solid ${isSubmitted ? 'rgba(255, 255, 255, 0.1)' : 'var(--game-border)'}`,
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'var(--font-data)',
                textAlign: 'center',
                outline: 'none',
                opacity: isSubmitted ? 0.5 : 1,
              }}
            />
          </div>

          <motion.button
            className="game-btn game-btn-primary"
            whileHover={!isSubmitted ? { scale: 1.03 } : undefined}
            whileTap={!isSubmitted ? { scale: 0.97 } : undefined}
            onClick={handleSubmit}
            disabled={isSubmitted || answer.trim() === ''}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              background: isSubmitted ? 'rgba(255, 255, 255, 0.05)' : '#0E8388',
              color: isSubmitted ? '#64748B' : '#FFFFFF',
              border: 'none',
              cursor: isSubmitted || answer.trim() === '' ? 'not-allowed' : 'pointer',
              opacity: isSubmitted || answer.trim() === '' ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isSubmitted ? '✓ Terkirim' : 'Kirim Jawaban'}
          </motion.button>
        </div>

        {question.topic === 'stddev' && !isSubmitted && (
          <div style={{
            fontSize: '11px',
            color: '#64748B',
            fontStyle: 'italic',
          }}>
            💡 Tip: Bulatkan jawabanmu ke 2 angka di belakang koma (contoh: 7.23)
          </div>
        )}
      </div>
    </motion.div>
  )
}
