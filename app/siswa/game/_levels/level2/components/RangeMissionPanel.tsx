'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ComputedStats, StudentThrowData, formatDistance, validateAnswer } from '../data/level2StatData'

interface RangeMissionPanelProps {
  stats: ComputedStats
  students?: StudentThrowData[]
  selectedMinFlag: number | null
  selectedMaxFlag: number | null
  ribbonPlaced: boolean
  onSelectFlag: (studentId: number, type: 'min' | 'max') => void
  onClearMin?: () => void
  onClearMax?: () => void
  onConfirmRibbon: () => void
  onComplete: (answer: string) => void
  onMistake: () => void
  playSound: (type: 'chime' | 'error' | 'pop') => void
}

export default function RangeMissionPanel({
  stats,
  students = [],
  selectedMinFlag,
  selectedMaxFlag,
  ribbonPlaced,
  onSelectFlag,
  onClearMin,
  onClearMax,
  onConfirmRibbon,
  onComplete,
  onMistake,
  playSound,
}: RangeMissionPanelProps) {
  const [rangeInput, setRangeInput] = useState('')
  const [rangeError, setRangeError] = useState('')
  const [activeSelectSlot, setActiveSelectSlot] = useState<'min' | 'max'>(() => {
    return selectedMinFlag === null ? 'min' : 'max'
  })

  const minStudent = students.find(s => s.studentId === selectedMinFlag)
  const maxStudent = students.find(s => s.studentId === selectedMaxFlag)

  const handleStudentPillClick = (studentId: number) => {
    playSound('pop')
    if (activeSelectSlot === 'min') {
      onSelectFlag(studentId, 'min')
      if (selectedMaxFlag === null && studentId !== selectedMaxFlag) {
        setActiveSelectSlot('max')
      }
    } else {
      if (studentId === selectedMinFlag) {
        // Switch slot if same
        onSelectFlag(studentId, 'min')
      } else {
        onSelectFlag(studentId, 'max')
      }
    }
  }

  const handleCalculate = () => {
    if (validateAnswer(rangeInput, stats.range, 0.05)) {
      playSound('chime')
      setRangeError('')
      onComplete(rangeInput)
    } else {
      playSound('error')
      onMistake()
      setRangeError(`Jawaban belum tepat. Hitung: Nilai Terbesar (${formatDistance(stats.max)}) − Nilai Terkecil (${formatDistance(stats.min)})`)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '64px',
        right: '16px',
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        borderRadius: '18px',
        border: '2px solid #EF4444',
        padding: '16px 18px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(239, 68, 68, 0.35)',
        color: '#FFFFFF',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>🎯</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#EF4444' }}>
            Misi 1: Jangkauan (Range)
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>
            Langkah 1: Tentukan nilai lemparan terdekat dan terjauh
          </p>
        </div>
      </div>

      <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#CBD5E1', lineHeight: 1.45 }}>
        {!ribbonPlaced
          ? 'Klik bendera di lapangan atau pilih siswa di bawah untuk menentukan Bendera Terdekat (Min) dan Terjauh (Max)!'
          : 'Pita merah telah membentang! Hitung selisih jarak jangkauan antara nilai maksimum dan minimum.'}
      </p>

      {/* Flag Selection Phase */}
      {!ribbonPlaced ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Target Selection Slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Min Slot */}
            <div
              onClick={() => setActiveSelectSlot('min')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '10px',
                background: activeSelectSlot === 'min' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1.5px solid ${activeSelectSlot === 'min' ? '#38BDF8' : 'rgba(255, 255, 255, 0.12)'}`,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
                  🚩 Bendera Terdekat (Min) {activeSelectSlot === 'min' ? '← Aktif' : ''}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#FFFFFF' }}>
                  {minStudent ? `${minStudent.studentLabel} (${formatDistance(minStudent.distance)}m)` : 'Belum dipilih (Klik bendera)'}
                </div>
              </div>
              {selectedMinFlag !== null && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onClearMin?.()
                    setActiveSelectSlot('min')
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#94A3B8',
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Ubah
                </button>
              )}
            </div>

            {/* Max Slot */}
            <div
              onClick={() => setActiveSelectSlot('max')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '10px',
                background: activeSelectSlot === 'max' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1.5px solid ${activeSelectSlot === 'max' ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>
                  🚩 Bendera Terjauh (Max) {activeSelectSlot === 'max' ? '← Aktif' : ''}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#FFFFFF' }}>
                  {maxStudent ? `${maxStudent.studentLabel} (${formatDistance(maxStudent.distance)}m)` : 'Belum dipilih (Klik bendera)'}
                </div>
              </div>
              {selectedMaxFlag !== null && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onClearMax?.()
                    setActiveSelectSlot('max')
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#94A3B8',
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Ubah
                </button>
              )}
            </div>
          </div>

          {/* 10 Students Quick Select Grid */}
          {students.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '8px' }}>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', marginBottom: '6px', fontWeight: 700 }}>
                Pilih bendera siswa untuk slot <b>{activeSelectSlot === 'min' ? 'Terdekat (Min)' : 'Terjauh (Max)'}</b>:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {students.map(s => {
                  const isMin = selectedMinFlag === s.studentId
                  const isMax = selectedMaxFlag === s.studentId
                  return (
                    <button
                      key={`student-pick-${s.studentId}`}
                      onClick={() => handleStudentPillClick(s.studentId)}
                      style={{
                        padding: '5px 2px',
                        borderRadius: '6px',
                        border: isMin ? '1.5px solid #38BDF8' : isMax ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.15)',
                        background: isMin ? '#38BDF8' : isMax ? '#EF4444' : 'rgba(255,255,255,0.06)',
                        color: isMin ? '#000' : '#FFF',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      <div>{s.studentLabel.replace('Siswa ', 'S')}</div>
                      <div style={{ fontWeight: 900 }}>{Math.round(s.distance)}m</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirmRibbon}
            disabled={selectedMinFlag === null || selectedMaxFlag === null}
            style={{
              padding: '11px',
              borderRadius: '12px',
              background: selectedMinFlag && selectedMaxFlag ? 'linear-gradient(135deg, #EF4444, #DC2626)' : '#475569',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '12px',
              cursor: selectedMinFlag && selectedMaxFlag ? 'pointer' : 'not-allowed',
              boxShadow: selectedMinFlag && selectedMaxFlag ? '0 6px 20px rgba(239, 68, 68, 0.4)' : 'none',
            }}
          >
            BENTANGKAN PITA JANGKAUAN ▶
          </motion.button>
        </div>
      ) : (
        /* Calculation Phase */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px',
              fontSize: '12px',
              color: '#FCA5A5',
            }}
          >
            <div>Rumus: <b>Jangkauan (R) = Nilai Terbesar − Nilai Terkecil</b></div>
            <div style={{ marginTop: '4px', color: '#FFFFFF', fontWeight: 800 }}>
              R = {formatDistance(stats.max)} m − {formatDistance(stats.min)} m
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
              Masukkan Hasil Jangkauan (R):
            </label>
            <input
              type="number"
              placeholder="Masukkan nilai jangkauan..."
              value={rangeInput}
              onChange={e => {
                setRangeInput(e.target.value)
                setRangeError('')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCalculate()
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #EF4444',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 900,
                outline: 'none',
              }}
            />
          </div>

          {rangeError && (
            <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
              {rangeError}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCalculate}
            disabled={!rangeInput.trim()}
            style={{
              padding: '11px',
              borderRadius: '12px',
              background: rangeInput.trim() ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : '#475569',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '12.5px',
              cursor: rangeInput.trim() ? 'pointer' : 'not-allowed',
              boxShadow: rangeInput.trim() ? '0 6px 20px rgba(239, 68, 68, 0.4)' : 'none',
            }}
          >
            VERIFIKASI JAWABAN JANGKAUAN ▶
          </motion.button>
        </div>
      )}
    </div>
  )
}
