'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { STAGE_TUTORIALS } from './corkboardData'

export interface StageTutorialModalProps {
  stage: 'sort' | 'modus' | 'median' | 'mean'
  onClose: () => void
}

export default function StageTutorialModal({ stage, onClose }: StageTutorialModalProps) {
  const tutorial = STAGE_TUTORIALS[stage]
  if (!tutorial) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 800,
        background: 'rgba(15, 8, 4, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 14 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        data-testid="stage-tutorial-modal"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 500,
          maxHeight: 'min(88vh, 680px)',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF3E6 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: 18,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          color: '#1E1B18',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Push Pin Hiasan */}
        <div style={{ position: 'absolute', top: '10px', left: '14px', zIndex: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.5 10.5 17 12 18.5C13.5 17 18 11.5 18 8C18 4.68629 15.3137 2 12 2Z" fill="#B45309" />
            <circle cx="12" cy="8" r="3" fill="#FDE68A" />
            <line x1="12" y1="18.5" x2="12" y2="23" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Header Modal */}
        <div style={{
          padding: '12px 18px 10px 42px',
          borderBottom: '1.5px solid rgba(140, 98, 57, 0.25)',
          background: 'rgba(140, 98, 57, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 900,
                color: '#FFFFFF',
                background: '#362014',
                padding: '1.5px 7px',
                borderRadius: '999px',
                letterSpacing: '0.4px',
              }}>
                TAHAP {tutorial.stepNum} / 4
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: 900,
                color: tutorial.badgeColor,
                background: 'rgba(255, 255, 255, 0.9)',
                border: `1.5px solid ${tutorial.badgeColor}`,
                padding: '1px 7px',
                borderRadius: '999px',
              }}>
                {tutorial.tag.toUpperCase()}
              </span>
            </div>
            <h3 style={{
              margin: '3px 0 0',
              fontSize: '15px',
              fontWeight: 900,
              color: '#27150B',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>{tutorial.icon}</span>
              <span>{tutorial.title}</span>
            </h3>
          </div>

          {/* Close button */}
          <button
            data-testid="btn-close-tutorial"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1.5px solid rgba(140, 98, 57, 0.35)',
              background: '#FFFDF7',
              color: '#78350F',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Modal (Scrollable, Responsive) */}
        <div
          data-testid="stage-tutorial-body"
          style={{
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxSizing: 'border-box',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Card 1: Konsep Inti */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(140, 98, 57, 0.25)',
            borderRadius: '10px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#362014', marginBottom: '3px' }}>
              🎯 {tutorial.conceptHeading}:
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: 1.45 }}>
              {tutorial.conceptText}
            </p>
          </div>

          {/* Card 2: Rumus / Prinsip Kunci */}
          {tutorial.formula && (
            <div style={{
              background: 'linear-gradient(180deg, #1E1B18 0%, #2A2420 100%)',
              border: '1.5px solid #B48C50',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#FEF3C7',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 900, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
                {tutorial.formula.title}
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: 900,
                color: '#34D399',
                textAlign: 'center',
                letterSpacing: '0.3px',
              }}>
                {tutorial.formula.equation}
              </div>
              <p style={{ margin: '5px 0 0', fontSize: '10.5px', color: '#E2E8F0', lineHeight: 1.4 }}>
                {tutorial.formula.explanation}
              </p>
            </div>
          )}

          {/* Card 3: Contoh Soal (hanya untuk mean - array examples) */}
          {tutorial.examples && tutorial.examples.map((ex, exIdx) => (
            <div key={exIdx} style={{
              background: '#F0FDF4',
              border: '1.5px solid rgba(5,150,105,0.25)',
              borderRadius: '10px',
              padding: '9px 12px',
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#065F46', marginBottom: '4px' }}>
                {ex.title}
              </div>
              <div style={{ fontSize: '10px', color: '#475569', marginBottom: '5px', fontStyle: 'italic' }}>
                {ex.sampleData}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '5px' }}>
                {ex.steps.map((s, i) => (
                  <div key={i} style={{ fontSize: '10.5px', color: '#1C1917', lineHeight: 1.4 }}>{s}</div>
                ))}
              </div>
              <div style={{
                background: 'rgba(5,150,105,0.1)',
                border: '1px solid rgba(5,150,105,0.3)',
                borderRadius: '5px',
                padding: '4px 8px',
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#065F46',
              }}>
                ✓ {ex.resultHighlight}
              </div>
            </div>
          ))}

          {/* Card 3: Cara Mengerjakan (Singkat 2 Langkah) */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(140, 98, 57, 0.25)',
            borderRadius: '10px',
            padding: '8px 12px',
          }}>
            <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#362014', marginBottom: '4px' }}>
              ⚡ Cara Mengerjakan:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tutorial.howToSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#362014',
                    color: '#FEF3C7',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4 }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Modal: Tombol Mulai */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1.5px solid rgba(140, 98, 57, 0.25)',
          background: 'rgba(140, 98, 57, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button
            data-testid="btn-confirm-tutorial"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: '1.5px solid #34D399',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>🚀 Paham, Mulai Mengerjakan!</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
