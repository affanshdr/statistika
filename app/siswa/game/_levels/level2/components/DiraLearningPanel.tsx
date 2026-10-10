'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LearningMaterial } from '../data/level2StatData'
import type { ComputedStats } from '../data/level2StatData'

interface DiraLearningPanelProps {
  material: LearningMaterial
  stats: ComputedStats
  questionNumber: number
  totalQuestions: number
  onComplete: () => void
}

export default function DiraLearningPanel({
  material,
  stats,
  questionNumber,
  totalQuestions,
  onComplete,
}: DiraLearningPanelProps) {
  const [step, setStep] = useState<'concept' | 'formula' | 'example'>('concept')

  const handleNext = () => {
    if (step === 'concept') setStep('formula')
    else if (step === 'formula') setStep('example')
    else onComplete()
  }

  const stepLabel = step === 'concept' ? 'Konsep' : step === 'formula' ? 'Rumus' : 'Contoh'
  const stepIdx = step === 'concept' ? 0 : step === 'formula' ? 1 : 2

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          maxWidth: '620px',
          width: '100%',
          background: 'linear-gradient(135deg, #0F2338 0%, #162C46 100%)',
          border: '2px solid rgba(14, 131, 136, 0.4)',
          borderRadius: '24px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(14, 131, 136, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(14, 131, 136, 0.12)',
          borderBottom: '1px solid rgba(14, 131, 136, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* DiRA Avatar */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #00ADB5',
            flexShrink: 0,
          }}>
            <img
              src="/dira-avatar.webp"
              alt="DiRA"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: '#00ADB5',
              textTransform: 'uppercase',
            }}>
              ASISTEN DiRA — MATERI {questionNumber}/{totalQuestions}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#F8FAFC',
              marginTop: '2px',
            }}>
              {material.title}
            </div>
          </div>

          {/* Step indicator pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['Konsep', 'Rumus', 'Contoh'].map((label, i) => (
              <div
                key={label}
                style={{
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '9px',
                  fontWeight: 800,
                  background: i === stepIdx ? '#00ADB5' : 'rgba(255, 255, 255, 0.06)',
                  color: i === stepIdx ? '#0A1420' : 'rgba(255, 255, 255, 0.3)',
                  border: i <= stepIdx ? '1px solid #00ADB5' : '1px solid rgba(255, 255, 255, 0.08)',
                  letterSpacing: '0.5px',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          padding: '24px',
          flex: 1,
          overflowY: 'auto',
        }}>
          {step === 'concept' && (
            <motion.div
              key="concept"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1px',
                color: '#38BDF8',
                textTransform: 'uppercase',
              }}>
                📖 PENJELASAN KONSEP
              </div>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#F8FAFC',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
              }}>
                {material.concept}
              </p>
            </motion.div>
          )}

          {step === 'formula' && (
            <motion.div
              key="formula"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1px',
                color: '#FBBF24',
                textTransform: 'uppercase',
              }}>
                📐 RUMUS
              </div>
              <div style={{
                padding: '16px 20px',
                background: 'rgba(251, 191, 36, 0.06)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '14px',
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#FCD34D',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-data)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {material.formula}
                </pre>
              </div>
            </motion.div>
          )}

          {step === 'example' && (
            <motion.div
              key="example"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1px',
                color: '#10B981',
                textTransform: 'uppercase',
              }}>
                💡 CONTOH PENERAPAN PADA DATA AKTIF
              </div>
              <div style={{
                padding: '16px 20px',
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '14px',
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6EE7B7',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-data)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {material.example(stats)}
                </pre>
              </div>

              <div style={{
                padding: '12px 16px',
                background: 'rgba(14, 131, 136, 0.08)',
                border: '1px dashed rgba(14, 131, 136, 0.3)',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#94A3B8',
                lineHeight: 1.6,
              }}>
                ⏱️ Setelah kamu menekan &quot;Mulai Menjawab&quot;, timer 60 detik akan dimulai. Pastikan kamu sudah memahami materinya!
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer / Button */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(14, 131, 136, 0.15)',
          background: 'rgba(0, 0, 0, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
            Langkah {stepIdx + 1} dari 3 — {stepLabel}
          </span>

          <motion.button
            className="game-btn game-btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            style={{
              fontSize: '13px',
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: 800,
              background: step === 'example' ? '#10B981' : '#0E8388',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              boxShadow: step === 'example'
                ? '0 4px 16px rgba(16, 185, 129, 0.4)'
                : '0 4px 16px rgba(14, 131, 136, 0.4)',
            }}
          >
            {step === 'example' ? '🚀 Mulai Menjawab →' : 'Lanjut →'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
