'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'
import { useGameStore } from '@/lib/store/gameStore'

interface StudentQueueChallengeProps {
  onSuccess: () => void
  isSolved: boolean
  isCompact?: boolean
}

interface StudentInQueue {
  id: number
  name: string
  gender: 'm' | 'f' | 'hijab'
  barHeight: number
  skinTone: string
  hairColor: string
}

const INITIAL_QUEUE: StudentInQueue[] = [
  { id: 1, name: 'Siswa 1', gender: 'm', barHeight: 88, skinTone: '#FCD34D', hairColor: '#1F2937' },
  { id: 2, name: 'Siswa 2', gender: 'f', barHeight: 78, skinTone: '#FDE68A', hairColor: '#374151' },
  { id: 3, name: 'Siswa 3', gender: 'm', barHeight: 68, skinTone: '#FCD34D', hairColor: '#111827' },
  { id: 4, name: 'Siswa 4', gender: 'hijab', barHeight: 58, skinTone: '#FDE68A', hairColor: '#FFFFFF' },
  { id: 5, name: 'Siswa 5', gender: 'm', barHeight: 48, skinTone: '#FCD34D', hairColor: '#1F2937' },
]

const QUIZ_OPTIONS = [
  { id: 'A', label: 'A. Lebih dari 160 cm', isCorrect: false },
  { id: 'B', label: 'B. Kurang dari 160 cm', isCorrect: true },
  { id: 'C', label: 'C. Tetap 160 cm', isCorrect: false },
  { id: 'D', label: 'D. Tidak dapat ditentukan karena data kurang', isCorrect: false },
]

export default function StudentQueueChallenge({ onSuccess, isSolved, isCompact: propIsCompact }: StudentQueueChallengeProps) {
  const incrementMistake = useGameStore(s => s.incrementMistake)
  const [isStudent1Out, setIsStudent1Out] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(isSolved ? 'B' : null)
  const [shake, setShake] = useState<number>(0)
  const [penaltyNotice, setPenaltyNotice] = useState<boolean>(false)
  const [isCompactState, setIsCompactState] = useState<boolean>(false)

  React.useEffect(() => {
    const check = () => setIsCompactState(typeof window !== 'undefined' && window.innerHeight <= 520)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isCompact = propIsCompact !== undefined ? propIsCompact : isCompactState

  const handleToggleStudent1 = () => {
    setIsStudent1Out(prev => !prev)
    gameAudio.playClick()
  }

  const handleSelectOption = (optionId: string) => {
    if (isSolved) return
    setSelectedOption(optionId)

    if (optionId === 'B') {
      gameAudio.playSuccess()
      setPenaltyNotice(false)
      onSuccess()
    } else {
      setShake(prev => prev + 1)
      gameAudio.playError()
      incrementMistake()
      setPenaltyNotice(true)
      setTimeout(() => setPenaltyNotice(false), 2200)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isCompact ? '5px' : '10px', width: '100%' }}>
      {/* 1. PERTANYAAN */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1.5px solid #F59E0B',
        borderRadius: isCompact ? '8px' : '12px',
        padding: isCompact ? '5px 10px' : '10px 14px',
        color: '#FEF3C7',
        fontSize: isCompact ? '10px' : '12.5px',
        lineHeight: isCompact ? 1.25 : 1.5,
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          Dalam suatu antrean 5 orang siswa yang diurutkan dari yang paling tinggi ke yang paling pendek, siswa yang berada tepat di tengah (posisi ke-3) memiliki tinggi badan <strong style={{ color: '#FCD34D' }}>160 cm</strong>.
        </p>
        <p style={{ margin: isCompact ? '3px 0 0 0' : '6px 0 0 0', fontWeight: 800, color: '#FFFFFF' }}>
          Jika siswa yang paling tinggi (posisi ke-1) keluar dari antrean, bagaimana posisi tinggi badan siswa yang berada di tengah antrean sekarang jika dibandingkan dengan 160 cm?
        </p>
      </div>

      {/* 2. VISUAL */}
      <div style={{
        background: 'linear-gradient(180deg, #1A0F0A 0%, #110804 100%)',
        border: '1.5px solid #8C6239',
        borderRadius: isCompact ? '8px' : '12px',
        padding: isCompact ? '4px 8px 3px' : '10px 12px 8px',
        position: 'relative',
        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
      }}>
        {/* Toggle Button Siswa 1 Keluar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: isCompact ? '2px' : '6px' }}>
          <button
            data-testid="btn-simulasi-antrean"
            onClick={handleToggleStudent1}
            style={{
              padding: isCompact ? '1px 8px' : '3px 10px',
              borderRadius: '999px',
              border: isStudent1Out ? '1.5px solid #10B981' : '1.5px solid #F59E0B',
              background: isStudent1Out ? 'rgba(6, 78, 59, 0.9)' : 'rgba(146, 64, 14, 0.9)',
              color: isStudent1Out ? '#6EE7B7' : '#FDE68A',
              fontSize: isCompact ? '9px' : '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: isCompact ? '3px' : '5px',
            }}
          >
            <span>{isStudent1Out ? '↩️ Kembalikan Siswa #1' : '🚶 Siswa #1 Keluar'}</span>
          </button>
        </div>

        {/* Barisan Siswa & Garis */}
        <div style={{ position: 'relative', width: '100%', marginBottom: isCompact ? '2px' : '4px' }}>
          {/* Garis Patokan 160 cm (Tepat di puncak kepala Siswa 3) */}
          <div style={{
            position: 'absolute',
            bottom: isCompact ? `${Math.round(68 * 0.48)}px` : '68px',
            left: '4px',
            right: '4px',
            height: '1.5px',
            background: 'repeating-linear-gradient(90deg, #F59E0B 0, #F59E0B 6px, transparent 6px, transparent 12px)',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <span style={{
              position: 'absolute',
              left: '4px',
              top: isCompact ? '-11px' : '-14px',
              fontSize: isCompact ? '7.5px' : '9px',
              fontWeight: 800,
              color: '#FDE047',
              background: 'rgba(26, 15, 10, 0.95)',
              padding: isCompact ? '0 3px' : '0 4px',
              borderRadius: '3px',
              border: '1px solid #F59E0B',
            }}>
              160 cm
            </span>
          </div>

          {/* Karakter Siswa Flex Row */}
          <div style={{
            height: isCompact ? '48px' : '95px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            padding: '0 4px',
          }}>
            {INITIAL_QUEUE.map(st => {
              const isRemoved = isStudent1Out && st.id === 1
              const charHeight = isCompact ? Math.round(st.barHeight * 0.48) : st.barHeight

              return (
                <motion.div
                  key={st.id}
                  animate={{
                    opacity: isRemoved ? 0.3 : 1,
                    scale: isRemoved ? 0.9 : 1,
                    filter: isRemoved ? 'grayscale(80%)' : 'none',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: isCompact ? '50px' : '64px',
                  }}
                >
                  {/* Karakter Siswa */}
                  <div style={{
                    height: `${charHeight}px`,
                    width: isCompact ? '20px' : '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    {/* Kepala */}
                    <div style={{
                      width: isCompact ? '13px' : '20px',
                      height: isCompact ? '13px' : '20px',
                      borderRadius: '50%',
                      background: st.gender === 'hijab' ? '#FFFFFF' : st.skinTone,
                      border: isCompact ? '1px solid #8C6239' : '1.5px solid #8C6239',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
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
                      borderLeft: isCompact ? '1px solid #94A3B8' : '1.5px solid #94A3B8',
                      borderRight: isCompact ? '1px solid #94A3B8' : '1.5px solid #94A3B8',
                      borderTop: '1px solid #CBD5E1',
                      borderRadius: '2px 2px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{ width: isCompact ? '2px' : '3px', height: '60%', background: '#1E3A8A' }} />
                    </div>

                    {/* Celana / Rok Biru Dongker SMP */}
                    <div style={{
                      flex: 1.5,
                      width: '100%',
                      background: '#1E3A8A',
                      borderLeft: isCompact ? '1px solid #0F172A' : '1.5px solid #0F172A',
                      borderRight: isCompact ? '1px solid #0F172A' : '1.5px solid #0F172A',
                      borderBottom: isCompact ? '1.5px solid #0F172A' : '2px solid #0F172A',
                      borderRadius: '0 0 2px 2px',
                    }} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Barisan Label Nama Siswa */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '0 4px',
            marginTop: isCompact ? '2px' : '4px',
          }}>
            {INITIAL_QUEUE.map(st => {
              const isRemoved = isStudent1Out && st.id === 1
              return (
                <div
                  key={st.id}
                  style={{
                    width: isCompact ? '50px' : '64px',
                    textAlign: 'center',
                    fontSize: isCompact ? '8.5px' : '10.5px',
                    fontWeight: 800,
                    color: isRemoved ? '#EF4444' : st.id === 3 ? '#FDE047' : '#FEF3C7',
                    whiteSpace: 'nowrap',
                    opacity: isRemoved ? 0.35 : 1,
                  }}
                >
                  {isRemoved ? 'Keluar' : st.name}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. PILIHAN JAWABAN */}
      {penaltyNotice && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            borderRadius: '6px',
            padding: isCompact ? '2px 6px' : '4px 10px',
            fontSize: isCompact ? '9.5px' : '11px',
            fontWeight: 800,
            color: '#FCA5A5',
            textAlign: 'center',
          }}
        >
          ⚠️ Jawaban Kurang Tepat! (+30 Detik Penalti Waktu)
        </motion.div>
      )}
      <motion.div
        key={shake}
        animate={shake > 0 ? { x: [-6, 6, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: isCompact ? '5px' : '8px',
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
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={isSolved}
              style={{
                padding: isCompact ? '4px 8px' : '10px 14px',
                borderRadius: isCompact ? '7px' : '10px',
                background: bg,
                border: border,
                color: color,
                fontSize: isCompact ? '9.5px' : '12px',
                fontWeight: 800,
                cursor: isSolved ? 'default' : 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{opt.label}</span>
              {isThisCorrect && <span>✓</span>}
              {isThisWrong && <span>✕</span>}
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
