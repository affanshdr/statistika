'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

interface StudentQueueChallengeProps {
  onSuccess: () => void
  isSolved: boolean
}

interface StudentInQueue {
  id: number
  name: string
  gender: 'm' | 'f' | 'hijab'
  heightLabel: string
  exactHeight: number
  barHeight: number // visual height in px
  skinTone: string
  hairColor: string
}

const INITIAL_QUEUE: StudentInQueue[] = [
  { id: 1, name: 'Siswa 1 (Tertinggi)', gender: 'm', heightLabel: '> 160 cm', exactHeight: 172, barHeight: 96, skinTone: '#FCD34D', hairColor: '#1F2937' },
  { id: 2, name: 'Siswa 2', gender: 'f', heightLabel: '> 160 cm', exactHeight: 166, barHeight: 88, skinTone: '#FDE68A', hairColor: '#374151' },
  { id: 3, name: 'Siswa 3 (Tengah)', gender: 'm', heightLabel: '160 cm', exactHeight: 160, barHeight: 80, skinTone: '#FCD34D', hairColor: '#111827' },
  { id: 4, name: 'Siswa 4', gender: 'hijab', heightLabel: '< 160 cm', exactHeight: 154, barHeight: 72, skinTone: '#FDE68A', hairColor: '#FFFFFF' },
  { id: 5, name: 'Siswa 5 (Terpendek)', gender: 'm', heightLabel: '< 160 cm', exactHeight: 148, barHeight: 64, skinTone: '#FCD34D', hairColor: '#1F2937' },
]

const QUIZ_OPTIONS = [
  { id: 'A', label: 'A. Lebih dari 160 cm', isCorrect: false },
  { id: 'B', label: 'B. Kurang dari 160 cm', isCorrect: true },
  { id: 'C', label: 'C. Tetap 160 cm', isCorrect: false },
  { id: 'D', label: 'D. Tidak dapat ditentukan karena data kurang', isCorrect: false },
]

export default function StudentQueueChallenge({ onSuccess, isSolved }: StudentQueueChallengeProps) {
  const [isStudent1Out, setIsStudent1Out] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(isSolved ? 'B' : null)
  const [shake, setShake] = useState<number>(0)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const handleToggleStudent1 = () => {
    setIsStudent1Out(prev => !prev)
    gameAudio.playClick()
  }

  const handleSelectOption = (optionId: string) => {
    if (isSolved) return
    setSelectedOption(optionId)

    if (optionId === 'B') {
      setWrongFeedback(null)
      gameAudio.playSuccess()
      onSuccess()
    } else {
      setShake(prev => prev + 1)
      gameAudio.playError()
      if (optionId === 'A') {
        setWrongFeedback('❌ Kurang tepat. Siswa tertinggi keluar, sehingga yang tersisa adalah siswa-siswa yang lebih pendek!')
      } else if (optionId === 'C') {
        setWrongFeedback('❌ Kurang tepat. Karena jumlah siswa kini genap (4 orang), posisi tengah bergeser ke antara orang ke-2 dan ke-3.')
      } else {
        setWrongFeedback('❌ Kurang tepat. Data urutan tinggi dari yang tertinggi ke terpendek sudah cukup untuk menentukan arah nilai tengah!')
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vh, 14px)', width: '100%' }}>
      {/* 1. Header Soal & Narasi Masalah */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1.5px solid #F59E0B',
        borderRadius: '12px',
        padding: 'clamp(10px, 1.3vh, 13px) clamp(12px, 1.5vw, 16px)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            fontSize: 'clamp(9px, 1vw, 10.5px)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
            border: '1px solid #F59E0B',
            color: '#FFFFFF',
            padding: '2px 9px',
            borderRadius: '999px',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
          }}>
            🎯 PRE-PEMBELAJARAN 2: Konsep Pergeseran Nilai Tengah (Median)
          </span>
          <span style={{ fontSize: 'clamp(9.5px, 1vw, 11px)', color: '#38BDF8', fontWeight: 800 }}>
            Antrean 5 Siswa
          </span>
        </div>

        <p style={{
          margin: 0,
          fontSize: 'clamp(11px, 1.25vw, 12.8px)',
          fontWeight: 700,
          color: '#FEF3C7',
          lineHeight: 1.55,
        }}>
          Dalam suatu antrean <strong>5 orang siswa</strong> yang diurutkan dari yang <strong>paling tinggi ke yang paling pendek</strong>, siswa yang berada tepat di tengah (posisi ke-3) memiliki tinggi badan <strong style={{ color: '#FCD34D', textDecoration: 'underline' }}>160 cm</strong>.
        </p>

        <p style={{
          margin: '6px 0 0 0',
          fontSize: 'clamp(11.5px, 1.3vw, 13px)',
          fontWeight: 900,
          color: '#FFFFFF',
          lineHeight: 1.5,
          background: 'rgba(245, 158, 11, 0.15)',
          padding: '6px 10px',
          borderRadius: '8px',
          borderLeft: '3px solid #F59E0B',
        }}>
          ❓ Jika siswa yang paling tinggi (posisi ke-1) keluar dari antrean, bagaimana posisi tinggi badan siswa yang berada di tengah antrean sekarang jika dibandingkan dengan 160 cm?
        </p>
      </div>

      {/* 2. Visual Interaktif Antrean Siswa (Interactive Height Queue) */}
      <div style={{
        background: 'linear-gradient(180deg, #1A0F0A 0%, #110804 100%)',
        border: '1.8px solid #8C6239',
        borderRadius: '14px',
        padding: 'clamp(10px, 1.3vh, 14px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0,0,0,0.6)',
      }}>
        {/* Header Visual Bar: Arah Urutan & Tombol Simulasi */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px',
          borderBottom: '1px solid rgba(140, 98, 57, 0.35)',
          paddingBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>📏</span>
            <span style={{
              fontSize: 'clamp(10px, 1.1vw, 11.5px)',
              fontWeight: 800,
              color: '#FDE68A',
            }}>
              Urutan: Kiri (Paling Tinggi) ➔ Kanan (Paling Pendek)
            </span>
          </div>

          {/* Tombol Simulasi Interaktif Siswa #1 Keluar */}
          <button
            onClick={handleToggleStudent1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: 'clamp(3px, 0.5vh, 5px) clamp(8px, 1vw, 12px)',
              borderRadius: '999px',
              border: isStudent1Out ? '1.5px solid #10B981' : '1.5px solid #F59E0B',
              background: isStudent1Out
                ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(4, 47, 46, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(146, 64, 14, 0.9) 0%, rgba(120, 53, 15, 0.95) 100%)',
              color: isStudent1Out ? '#6EE7B7' : '#FDE68A',
              fontSize: 'clamp(9.5px, 1vw, 11px)',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}
            title="Klik untuk melihat animasi saat siswa tertinggi keluar dari antrean"
          >
            <span>{isStudent1Out ? '↩️ Kembalikan Siswa #1' : '🚶‍♂️ Simulasi: Siswa #1 Keluar'}</span>
          </button>
        </div>

        {/* Height Benchmark Grid Lines */}
        <div style={{
          position: 'relative',
          height: '135px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          padding: '20px 8px 6px 8px',
        }}>
          {/* Garis Patokan 160 cm (Benchmark Median - tepat di puncak kepala Siswa #3) */}
          <div style={{
            position: 'absolute',
            bottom: '108px', // aligned with top of Siswa 3 (160 cm)
            left: '10px',
            right: '10px',
            height: '1.5px',
            background: 'repeating-linear-gradient(90deg, #F59E0B 0, #F59E0B 8px, transparent 8px, transparent 14px)',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <span style={{
              position: 'absolute',
              right: 0,
              top: '-16px',
              fontSize: '8.5px',
              fontWeight: 900,
              color: '#FDE047',
              background: 'rgba(26, 15, 10, 0.95)',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid #F59E0B',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              Patokan: 160 cm
            </span>
          </div>

          {/* 5 Siswa Berbaris */}
          {INITIAL_QUEUE.map((st, idx) => {
            const isRemoved = isStudent1Out && st.id === 1
            const isOriginalMedian = st.id === 3
            // In new 4-student queue (st.id 2, 3, 4, 5), the center is between st.id 3 and 4!
            const isNewMedianMember = isStudent1Out && (st.id === 3 || st.id === 4)

            return (
              <motion.div
                key={st.id}
                animate={{
                  opacity: isRemoved ? 0.35 : 1,
                  y: isRemoved ? -14 : 0,
                  scale: isRemoved ? 0.92 : 1,
                }}
                transition={{ duration: 0.35 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  width: 'clamp(52px, 12vw, 84px)',
                  cursor: st.id === 1 ? 'pointer' : 'default',
                }}
                onClick={st.id === 1 ? handleToggleStudent1 : undefined}
              >
                {/* Status Pin / Badge di atas kepala */}
                <div style={{
                  minHeight: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                }}>
                  {isRemoved ? (
                    <span style={{
                      fontSize: '8.5px',
                      fontWeight: 900,
                      color: '#EF4444',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #EF4444',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}>
                      🚶 Keluar
                    </span>
                  ) : isOriginalMedian && !isStudent1Out ? (
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#000000',
                        background: '#FDE047',
                        border: '1.5px solid #FFFFFF',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        boxShadow: '0 0 10px rgba(253, 224, 71, 0.8)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      📍 TENGAH (160 cm)
                    </motion.div>
                  ) : isNewMedianMember ? (
                    <span style={{
                      fontSize: '8px',
                      fontWeight: 900,
                      color: '#34D399',
                      background: 'rgba(5, 150, 105, 0.35)',
                      border: '1px solid #34D399',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}>
                      {st.id === 3 ? '160 cm' : '< 160 cm'}
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '8.5px',
                      fontWeight: 800,
                      color: '#A8A29E',
                    }}>
                      Posisi #{st.id}
                    </span>
                  )}
                </div>

                {/* Karakter Siswa (Ilustrasi Seragam SMP dengan Skala Tinggi) */}
                <div style={{
                  height: `${st.barHeight}px`,
                  width: 'clamp(28px, 6vw, 40px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  filter: isOriginalMedian && !isStudent1Out
                    ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))'
                    : 'none',
                }}>
                  {/* Kepala Siswa */}
                  <div style={{
                    width: 'clamp(18px, 4vw, 24px)',
                    height: 'clamp(18px, 4vw, 24px)',
                    borderRadius: '50%',
                    background: st.gender === 'hijab' ? '#FFFFFF' : st.skinTone,
                    border: `1.5px solid ${isOriginalMedian && !isStudent1Out ? '#F59E0B' : '#8C6239'}`,
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {/* Rambut / Wajah */}
                    {st.gender !== 'hijab' && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: st.hairColor,
                      }} />
                    )}
                    {st.gender === 'hijab' && (
                      <div style={{
                        position: 'absolute',
                        top: '25%',
                        left: '20%',
                        right: '20%',
                        bottom: '20%',
                        borderRadius: '50%',
                        background: '#FDE68A',
                      }} />
                    )}
                  </div>

                  {/* Kemeja Seragam Putih SMP */}
                  <div style={{
                    flex: 1.2,
                    width: '100%',
                    background: '#FFFFFF',
                    borderLeft: '1.5px solid #94A3B8',
                    borderRight: '1.5px solid #94A3B8',
                    borderTop: '1px solid #CBD5E1',
                    borderRadius: '3px 3px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  }}>
                    {/* Dasi / Logo Biru SMP */}
                    <div style={{ width: '4px', height: '60%', background: '#1E3A8A', borderRadius: '1px' }} />
                  </div>

                  {/* Celana / Rok Biru Dongker SMP */}
                  <div style={{
                    flex: 1.5,
                    width: '100%',
                    background: '#1E3A8A',
                    borderLeft: '1.5px solid #0F172A',
                    borderRight: '1.5px solid #0F172A',
                    borderBottom: '2px solid #0F172A',
                    borderRadius: '0 0 2px 2px',
                  }} />
                </div>

                {/* Label Kaki & Keterangan Tinggi */}
                <div style={{
                  marginTop: '5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}>
                  <span style={{
                    fontSize: 'clamp(9px, 1.05vw, 11px)',
                    fontWeight: 900,
                    color: isOriginalMedian && !isStudent1Out ? '#FDE047' : '#FEF3C7',
                  }}>
                    {st.id === 3 ? '160 cm' : st.heightLabel}
                  </span>
                  <span style={{
                    fontSize: 'clamp(7.5px, 0.9vw, 9px)',
                    fontWeight: 700,
                    color: isRemoved ? '#EF4444' : '#94A3B8',
                  }}>
                    {isRemoved ? 'Keluar' : `Siswa #${st.id}`}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Dynamic State Callout Panel */}
        <div style={{
          marginTop: '8px',
          background: isStudent1Out ? 'rgba(5, 150, 105, 0.15)' : 'rgba(245, 158, 11, 0.12)',
          border: isStudent1Out ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'clamp(9.5px, 1.1vw, 11.5px)',
          color: isStudent1Out ? '#A7F3D0' : '#FDE68A',
          fontWeight: 800,
        }}>
          {isStudent1Out ? (
            <span>
              💡 <strong>Kondisi Baru (4 Siswa):</strong> Siswa #1 keluar. Posisi tengah sekarang diapit oleh <strong>Siswa #3 (160 cm)</strong> dan <strong>Siswa #4 (&lt; 160 cm)</strong>.
            </span>
          ) : (
            <span>
              ℹ️ <strong>Kondisi Awal (5 Siswa):</strong> Siswa berposisi ganjil di tengah adalah <strong>Siswa #3 = 160 cm</strong>. Klik tombol simulasi di atas untuk mengeluarkan siswa #1!
            </span>
          )}
        </div>
      </div>

      {/* 3. Pilihan Ganda (A, B, C, D) */}
      <div>
        <div style={{
          fontSize: 'clamp(10px, 1.1vw, 11.5px)',
          fontWeight: 900,
          color: '#FEF3C7',
          marginBottom: '6px',
        }}>
          Pilih Jawaban yang Tepat:
        </div>

        <motion.div
          key={shake}
          animate={wrongFeedback ? { x: [-6, 6, -5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(6px, 1vw, 10px)',
          }}
        >
          {QUIZ_OPTIONS.map(opt => {
            const isSelected = selectedOption === opt.id
            const isThisCorrect = isSolved && opt.isCorrect
            const isThisWrong = isSelected && !opt.isCorrect

            let bg = 'rgba(255, 255, 255, 0.06)'
            let border = '1.5px solid rgba(245, 158, 11, 0.4)'
            let color = '#FEF3C7'

            if (isThisCorrect) {
              bg = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              border = '1.5px solid #34D399'
              color = '#FFFFFF'
            } else if (isThisWrong) {
              bg = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
              border = '1.5px solid #F87171'
              color = '#FFFFFF'
            } else if (isSelected) {
              bg = '#D97706'
              border = '1.5px solid #FDE68A'
              color = '#FFFFFF'
            }

            return (
              <motion.button
                key={opt.id}
                whileHover={!isSolved ? { scale: 1.02 } : {}}
                whileTap={!isSolved ? { scale: 0.98 } : {}}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isSolved}
                style={{
                  padding: 'clamp(8px, 1.2vh, 12px) clamp(10px, 1.2vw, 14px)',
                  borderRadius: '10px',
                  background: bg,
                  border: border,
                  color: color,
                  fontSize: 'clamp(10.5px, 1.15vw, 12px)',
                  fontWeight: 800,
                  cursor: isSolved ? 'default' : 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isThisCorrect ? '0 4px 15px rgba(5, 150, 105, 0.4)' : '0 2px 6px rgba(0,0,0,0.2)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  background: isThisCorrect ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  color: isThisCorrect ? '#FFFFFF' : '#FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '11px',
                  flexShrink: 0,
                }}>
                  {isThisCorrect ? '✓' : opt.id}
                </span>
                <span style={{ flex: 1, lineHeight: 1.35 }}>
                  {opt.label.substring(3)}
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* 4. Feedback & Explanation Banner */}
      <AnimatePresence>
        {wrongFeedback && !isSolved && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1.5px solid #EF4444',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: 'clamp(10px, 1.1vw, 11.5px)',
              color: '#FCA5A5',
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            {wrongFeedback}
          </motion.div>
        )}

        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(4, 47, 46, 0.98) 100%)',
              border: '1.5px solid #34D399',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: 'clamp(10.5px, 1.15vw, 12px)',
              color: '#ECFDF5',
              fontWeight: 700,
              lineHeight: 1.5,
              boxShadow: '0 4px 15px rgba(5, 150, 105, 0.35)',
            }}
          >
            <div style={{ fontWeight: 900, color: '#6EE7B7', marginBottom: '3px', fontSize: 'clamp(11px, 1.2vw, 12.5px)' }}>
              🎉 Jawaban Benar: B. Kurang dari 160 cm!
            </div>
            <div>
              Ketika siswa tertinggi (posisi 1) keluar, tersisa 4 orang siswa (Siswa #2, #3, #4, dan #5). Karena urutannya dari yang tertinggi ke terpendek, maka Siswa #4 dan #5 pasti memiliki tinggi <strong>lebih pendek dari 160 cm</strong>.
              <br />
              Titik tengah 4 siswa berada di antara Siswa #3 (160 cm) dan Siswa #4 (&lt; 160 cm), sehingga nilai tengah barunya pasti <strong>Kurang dari 160 cm</strong>!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
