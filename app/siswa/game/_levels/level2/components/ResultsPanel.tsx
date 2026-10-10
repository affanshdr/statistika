'use client'

import { motion } from 'framer-motion'
import type { QuestionResult } from '../config/level2Config'
import { TOTAL_QUESTIONS } from '../config/level2Config'
import { CandidateStatus } from './ClassroomUI'

interface ResultsPanelProps {
  results: QuestionResult[]
  playerScore: number
  candidate1Score: number
  candidate2Score: number
  isPassed: boolean
  onRetry: () => void
  onContinue: () => void
}

export default function ResultsPanel({
  results,
  playerScore,
  candidate1Score,
  candidate2Score,
  isPassed,
  onRetry,
  onContinue,
}: ResultsPanelProps) {
  const correctCount = results.filter(r => r.isCorrect).length
  const wrongCount = results.filter(r => !r.isCorrect && !r.isTimeout).length
  const timeoutCount = results.filter(r => r.isTimeout).length

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '700px',
        width: '100%',
        margin: '0 auto',
        padding: '16px',
      }}
    >
      {/* Status Banner */}
      <div className="game-card" style={{
        textAlign: 'center',
        padding: '28px 24px',
        border: isPassed
          ? '2px solid rgba(16, 185, 129, 0.4)'
          : '2px solid rgba(239, 68, 68, 0.3)',
        background: isPassed
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, #0F2338 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, #0F2338 100%)',
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ fontSize: '64px', marginBottom: '8px' }}
        >
          {isPassed ? '🏆' : '📋'}
        </motion.div>

        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: 900,
          color: isPassed ? '#10B981' : '#EF4444',
        }}>
          {isPassed ? 'Selamat! Kamu Terpilih!' : 'Belum Berhasil'}
        </h2>

        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#94A3B8',
          lineHeight: 1.6,
          maxWidth: '480px',
          marginInline: 'auto',
        }}>
          {isPassed
            ? 'Kamu berhasil menjawab semua pertanyaan dengan benar! Kamu terpilih menjadi perwakilan sekolah dalam olimpiade matematika!'
            : 'Kamu belum berhasil menjawab seluruh pertanyaan dengan benar. Jangan menyerah, coba lagi dan perhatikan setiap langkah perhitungannya!'
          }
        </p>
      </div>

      {/* Score Summary */}
      <div className="game-card" style={{ padding: '20px 24px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: '#00ADB5',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          📊 RINGKASAN HASIL
        </div>

        {/* Score big number */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            padding: '16px 32px',
            background: isPassed
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(239, 68, 68, 0.08)',
            border: `2px solid ${isPassed ? '#10B981' : '#EF4444'}40`,
            borderRadius: '20px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '40px',
              fontWeight: 900,
              fontFamily: 'var(--font-data)',
              color: isPassed ? '#10B981' : '#EF4444',
            }}>
              {playerScore}/{TOTAL_QUESTIONS}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#94A3B8',
              marginTop: '4px',
            }}>
              Jawaban Benar
            </div>
          </div>
        </div>

        {/* Detail Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-data)' }}>
              {correctCount}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', letterSpacing: '0.5px' }}>
              ✅ BENAR
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-data)' }}>
              {wrongCount}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.5px' }}>
              ❌ SALAH
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'rgba(251, 191, 36, 0.06)',
            border: '1px solid rgba(251, 191, 36, 0.15)',
            borderRadius: '10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-data)' }}>
              {timeoutCount}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#FBBF24', letterSpacing: '0.5px' }}>
              ⏱️ TIMEOUT
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: '#64748B',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            DETAIL PER SOAL
          </div>
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.15)',
                borderRadius: '10px',
                border: `1px solid ${r.isCorrect ? 'rgba(16, 185, 129, 0.2)' : r.isTimeout ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: r.isCorrect ? 'rgba(16, 185, 129, 0.15)' : r.isTimeout ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}>
                {r.isCorrect ? '✅' : r.isTimeout ? '⏱️' : '❌'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC' }}>
                  Soal {i + 1}: {r.topic}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                  {r.isTimeout
                    ? 'Waktu habis'
                    : `Jawaban: ${r.playerAnswer} • Waktu: ${r.timeSpent}s`
                  }
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: r.isCorrect ? '#10B981' : '#EF4444',
              }}>
                {r.isCorrect ? 'BENAR' : 'SALAH'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Scores */}
      <div className="game-card" style={{ padding: '20px 24px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: '#00ADB5',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          👥 HASIL SELURUH KANDIDAT
        </div>
        <CandidateStatus
          playerScore={playerScore}
          candidate1Score={candidate1Score}
          candidate2Score={candidate2Score}
          showScores={true}
        />
      </div>

      {/* DiRA message */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(14, 131, 136, 0.08)',
        border: '1px solid rgba(14, 131, 136, 0.2)',
        borderRadius: '14px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid #00ADB5',
          flexShrink: 0,
        }}>
          <img
            src="/dira-avatar.webp"
            alt="DiRA"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#CBD5E1',
          lineHeight: 1.6,
        }}>
          {isPassed
            ? 'Luar biasa! 🎉 Kamu berhasil menjawab semua pertanyaan dengan benar dan terpilih menjadi perwakilan sekolah! Persiapkan dirimu untuk olimpiade matematika!'
            : 'Jangan menyerah! Kamu sudah mendapatkan pengalaman dari percobaan ini. Mari coba lagi dengan data yang berbeda dan perhatikan setiap langkah perhitungannya.'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        {isPassed ? (
          <motion.button
            className="game-btn game-btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10B981 0%, #0E8388 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            🏆 Lanjutkan →
          </motion.button>
        ) : (
          <motion.button
            className="game-btn game-btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
            }}
          >
            🔄 Ulangi Level 2
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
