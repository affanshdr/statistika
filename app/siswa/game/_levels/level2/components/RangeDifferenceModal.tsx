'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistance, validateAnswer, extractNumber } from '../data/level2StatData'

interface RangeDifferenceModalProps {
  minVal: number
  maxVal: number
  rangeVal: number
  onSuccess: (answer: number) => void
  onMistake: () => void
  playSound: (type: 'chime' | 'error' | 'pop') => void
}

export default function RangeDifferenceModal({
  minVal,
  maxVal,
  rangeVal,
  onSuccess,
  onMistake,
  playSound,
}: RangeDifferenceModalProps) {
  const [inputVal, setInputVal] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [wrongAttempts, setWrongAttempts] = useState(0)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputVal.trim()) return

    const parsed = extractNumber(inputVal)
    if (parsed === null) {
      setErrorMsg('Masukkan angka hasil selisih yang valid (contoh: 55)!')
      playSound('error')
      return
    }

    const displayedMin = Math.round(minVal)
    const displayedMax = Math.round(maxVal)
    const expectedDisplayedRange = displayedMax - displayedMin
    const expectedRawRange = Math.round(rangeVal)

    // Accept if matches displayed difference, raw rangeVal, or float difference
    const isCorrect =
      Math.abs(parsed - expectedDisplayedRange) <= 0.75 ||
      Math.abs(parsed - expectedRawRange) <= 0.75 ||
      Math.abs(parsed - (maxVal - minVal)) <= 0.75

    if (isCorrect) {
      playSound('chime')
      setErrorMsg('')
      onSuccess(parsed)
    } else {
      playSound('error')
      onMistake()
      setWrongAttempts(prev => prev + 1)
      setErrorMsg('Jawaban belum tepat. Coba perhatikan petunjuk yang muncul di atas!')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 800,
        background: 'rgba(5, 12, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 26, 0.99) 100%)',
          border: '2px solid #F59E0B',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(245, 158, 11, 0.35)',
          padding: '24px 28px',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1.5px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            🎉
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#FCD34D' }}>
              Bendera Min & Max Berhasil Dipilih!
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
              Sekarang masukkan selisih keduanya untuk menentukan Jangkauan (Range)
            </p>
          </div>
        </div>

        {/* 2 Found Cards: Min and Max */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {/* Max Card */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid #EF4444',
              borderRadius: '14px',
              padding: '12px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', marginBottom: '4px' }}>
              🚩 Nilai Terbesar (X_max)
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>
              {formatDistance(maxVal)} <span style={{ fontSize: '14px', color: '#FCA5A5' }}>m</span>
            </div>
          </div>

          {/* Min Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1.5px solid #38BDF8',
              borderRadius: '14px',
              padding: '12px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '4px' }}>
              🚩 Nilai Terkecil (X_min)
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>
              {formatDistance(minVal)} <span style={{ fontSize: '14px', color: '#BAE6FD' }}>m</span>
            </div>
          </div>
        </div>

        {/* Question Prompt (Neutral when no mistakes yet) */}
        {wrongAttempts === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 16px',
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0', fontWeight: 600 }}>
              Hitunglah nilai <b>Jangkauan (Range)</b> dari kedua bendera yang telah kamu tempatkan!
            </p>
          </div>
        ) : (
          /* Progressive Tips Banner when wrong */
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1.5px solid #F59E0B',
              borderRadius: '14px',
              padding: '12px 16px',
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: 800, marginBottom: '4px' }}>
              💡 Petunjuk {wrongAttempts === 1 ? 'Tahap 1' : 'Tahap 2'}:
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#FDE68A', letterSpacing: '0.4px' }}>
              Jangkauan (R) = Nilai Terbesar − Nilai Terkecil
            </div>
            {wrongAttempts >= 2 && (
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                R = {formatDistance(maxVal)} − {formatDistance(minVal)} = ?
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#E2E8F0', marginBottom: '6px' }}>
              Berapa selisihnya (dalam meter)?
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="Masukkan hasil selisih..."
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value)
                  setErrorMsg('')
                }}
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: `2px solid ${errorMsg ? '#EF4444' : '#F59E0B'}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 900,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#FCD34D' }}>meter</span>
            </div>
            {errorMsg && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#F87171', fontWeight: 700 }}>
                {errorMsg}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            style={{
              marginTop: '8px',
              padding: '13px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>✅ Cek & Kunci Nilai Jangkauan</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
