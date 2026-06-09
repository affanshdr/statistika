'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CORRECT_VERDICT, VERDICT_EXPLANATION } from '../_data/level1'

type VerdictType = 'VALID' | 'MISLEADING' | 'HOAKS'

interface VerdictScreenProps {
  onSubmit: (verdict: VerdictType, isCorrect: boolean) => void
  guidedMode?: boolean // FD: show Dira hint on wrong
  onDiraHint?: (msg: string) => void
}

const OPTIONS: { value: VerdictType; icon: string; label: string; color: string }[] = [
  { value: 'VALID',      icon: '✅', label: 'VALID',      color: '#00FF88' },
  { value: 'MISLEADING', icon: '⚠️', label: 'MISLEADING', color: '#FF6B35' },
  { value: 'HOAKS',      icon: '❌', label: 'HOAKS',      color: '#FF3366' },
]

export default function VerdictScreen({ onSubmit, guidedMode, onDiraHint }: VerdictScreenProps) {
  const [selected, setSelected] = useState<VerdictType | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleSubmit = () => {
    if (!selected) return
    const isCorrect = selected === CORRECT_VERDICT
    setSubmitted(true)
    setResult(isCorrect ? 'correct' : 'wrong')

    if (!isCorrect && guidedMode && onDiraHint) {
      onDiraHint('Hampir! Coba pikirin lagi — data share ≠ data survei opini. Apakah data ini cukup untuk membuktikan "95% setuju"? 🤔')
    }

    if (isCorrect) {
      setTimeout(() => setShowExplanation(true), 800)
      onSubmit(selected, true)
    } else {
      onSubmit(selected, false)
    }
  }

  const handleRetry = () => {
    setSelected(null)
    setSubmitted(false)
    setResult(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
          KEPUTUSAN AKHIR
        </div>
        <h3 style={{ margin: 0, fontSize: '18px' }}>
          Berdasarkan analisismu — klaim ini...
        </h3>
      </div>

      {/* Options */}
      <div className="verdict-options">
        {OPTIONS.map(opt => (
          <motion.button
            key={opt.value}
            className={`verdict-option ${
              submitted && selected === opt.value
                ? result === 'correct' ? 'selected-correct' : 'selected-wrong'
                : ''
            }`}
            whileHover={!submitted ? { scale: 1.02 } : {}}
            whileTap={!submitted ? { scale: 0.98 } : {}}
            onClick={() => !submitted && setSelected(opt.value)}
            disabled={submitted}
            style={{
              outline: selected === opt.value && !submitted ? `2px solid ${opt.color}` : undefined,
              background: selected === opt.value && !submitted ? `rgba(${
                opt.color === '#00FF88' ? '0,255,136' : opt.color === '#FF6B35' ? '255,107,53' : '255,51,102'
              },0.08)` : undefined,
            }}
          >
            <span style={{ fontSize: '32px' }}>{opt.icon}</span>
            <span style={{ fontWeight: 800, fontSize: '14px', color: selected === opt.value && !submitted ? opt.color : undefined }}>
              {opt.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          className="game-btn game-btn-primary"
          onClick={handleSubmit}
          disabled={!selected}
          style={{ opacity: selected ? 1 : 0.5 }}
        >
          Tetapkan Verdict →
        </button>
      )}

      {/* Result feedback */}
      <AnimatePresence>
        {submitted && result === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--danger-dim)', border: '1px solid rgba(255,51,102,0.3)',
              borderRadius: '14px', padding: '16px 20px', color: 'var(--danger)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>
              {guidedMode 
                ? 'Hampir! Coba pikirin lagi 🤔'
                : '❌ Kurang tepat. Coba lagi!'}
            </div>
            {!guidedMode && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                Petunjuk: Perhatikan <em>jenis data</em> yang kamu analisis — apakah ini data opini?
              </div>
            )}
            <button className="game-btn game-btn-secondary" onClick={handleRetry} style={{ fontSize: '13px', padding: '8px 20px' }}>
              Coba Lagi
            </button>
          </motion.div>
        )}

        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(0,255,136,0.05)', border: '1px solid var(--game-border-accent)',
              borderRadius: '16px', padding: '20px 24px'
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--accent)', marginBottom: '12px', fontSize: '16px' }}>
              ✅ Benar! Klaim ini MISLEADING
            </div>
            <p 
              style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', margin: 0 }}
              dangerouslySetInnerHTML={{ __html: VERDICT_EXPLANATION }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
