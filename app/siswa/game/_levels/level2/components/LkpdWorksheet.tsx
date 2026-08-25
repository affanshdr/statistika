'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../../game.css'

interface LkpdWorksheetProps {
  initialAnswers?: any
  readOnly?: boolean
  onSubmit?: (answers: any) => void
  studentName?: string
  studentClass?: string
}

export default function LkpdWorksheet({
  initialAnswers,
  readOnly = false,
  onSubmit,
  studentName = '',
  studentClass = '',
}: LkpdWorksheetProps) {
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3 | 4>(1)

  // Form State
  const [nama, setNama] = useState(studentName)
  const [kelas, setKelas] = useState(studentClass)

  // Aktivitas 1 State
  const [valMax, setValMax] = useState('')
  const [valMin, setValMin] = useState('')
  const [valR1, setValR1] = useState('')
  const [valR2, setValR2] = useState('')
  const [valRResult, setValRResult] = useState('')
  
  const [valN, setValN] = useState('')
  const [valLogN, setValLogN] = useState('')
  const [valKTerm, setValKTerm] = useState('')
  const [valKFloat, setValKFloat] = useState('')
  const [valKRound, setValKRound] = useState('')

  const [valP, setValP] = useState('')

  // Intervals: d
  const [intervals, setIntervals] = useState({
    k1Min: '', k1Max: '',
    k2Min: '', k2Max: '',
    k3Min: '', k3Max: '',
    k4Min: '', k4Max: '',
    k5Min: '', k5Max: '',
    k6Min: '', k6Max: '',
  })

  // Frequencies: e
  const [frequencies, setFrequencies] = useState({
    f1: '', f2: '', f3: '', f4: '', f5: '', f6: '',
  })

  // Aktivitas 2 State
  // Table b: Interval, Freq, Tepi Bawah, Tepi Atas
  const [tableA2, setTableA2] = useState({
    row1Int: '', row1Freq: '', row1Tb: '', row1Ta: '',
    row2Int: '', row2Freq: '', row2Tb: '', row2Ta: '',
    row3Int: '', row3Freq: '', row3Tb: '', row3Ta: '',
    row4Int: '', row4Freq: '', row4Tb: '', row4Ta: '',
    row5Int: '', row5Freq: '', row5Tb: '', row5Ta: '',
    row6Int: '', row6Freq: '', row6Tb: '', row6Ta: '',
  })

  // Histogram heights (0 to 12)
  const [histogramHeights, setHistogramHeights] = useState<number[]>([0, 0, 0, 0, 0, 0])

  // Essay Answers
  const [essay2, setEssay2] = useState('')
  const [essay3, setEssay3] = useState('')
  const [essay4, setEssay4] = useState('')

  // Validation State (Green check or Red cross)
  const [showValidation, setShowValidation] = useState(false)
  const [isValidated, setIsValidated] = useState(false)

  // Populate initial answers if in readOnly mode or reviewing
  useEffect(() => {
    if (initialAnswers) {
      setNama(initialAnswers.nama || '')
      setKelas(initialAnswers.kelas || '')
      
      setValMax(initialAnswers.valMax || '')
      setValMin(initialAnswers.valMin || '')
      setValR1(initialAnswers.valR1 || '')
      setValR2(initialAnswers.valR2 || '')
      setValRResult(initialAnswers.valRResult || '')

      setValN(initialAnswers.valN || '')
      setValLogN(initialAnswers.valLogN || '')
      setValKTerm(initialAnswers.valKTerm || '')
      setValKFloat(initialAnswers.valKFloat || '')
      setValKRound(initialAnswers.valKRound || '')

      setValP(initialAnswers.valP || '')

      if (initialAnswers.intervals) setIntervals(initialAnswers.intervals)
      if (initialAnswers.frequencies) setFrequencies(initialAnswers.frequencies)
      if (initialAnswers.tableA2) setTableA2(initialAnswers.tableA2)
      if (initialAnswers.histogramHeights) setHistogramHeights(initialAnswers.histogramHeights)

      setEssay2(initialAnswers.essay2 || '')
      setEssay3(initialAnswers.essay3 || '')
      setEssay4(initialAnswers.essay4 || '')
      
      setShowValidation(true)
      setIsValidated(true)
    }
  }, [initialAnswers])

  // Auto-fill student name and class if available
  useEffect(() => {
    if (!readOnly && !initialAnswers) {
      if (studentName) setNama(studentName)
      if (studentClass) setKelas(studentClass)
    }
  }, [studentName, studentClass, readOnly, initialAnswers])

  // Real Answers for Validation
  const CORRECT_ANSWERS = {
    valMax: '18',
    valMin: '1',
    valRResult: '17',
    valN: '36',
    valKRound: '6',
    valP: '3',
    intervals: {
      k1Min: '1', k1Max: '3',
      k2Min: '4', k2Max: '6',
      k3Min: '7', k3Max: '9',
      k4Min: '10', k4Max: '12',
      k5Min: '13', k5Max: '15',
      k6Min: '16', k6Max: '18',
    },
    frequencies: {
      f1: '10', f2: '11', f3: '6', f4: '3', f5: '3', f6: '3',
    },
    tableA2: {
      row1Int: '1-3', row1Freq: '10', row1Tb: '0.5', row1Ta: '3.5',
      row2Int: '4-6', row2Freq: '11', row2Tb: '3.5', row2Ta: '6.5',
      row3Int: '7-9', row3Freq: '6', row3Tb: '6.5', row3Ta: '9.5',
      row4Int: '10-12', row4Freq: '3', row4Tb: '9.5', row4Ta: '12.5',
      row5Int: '13-15', row5Freq: '3', row5Tb: '12.5', row5Ta: '15.5',
      row6Int: '16-18', row6Freq: '3', row6Tb: '15.5', row6Ta: '18.5',
    },
    histogramHeights: [10, 11, 6, 3, 3, 3]
  }

  const isFieldCorrect = (field: string, userVal: string, correctVal: string) => {
    if (!showValidation) return null
    return userVal.trim() === correctVal.trim()
  }

  const isIntervalCorrect = (key: keyof typeof intervals) => {
    if (!showValidation) return null
    return intervals[key].trim() === CORRECT_ANSWERS.intervals[key]
  }

  const isFrequencyCorrect = (key: keyof typeof frequencies) => {
    if (!showValidation) return null
    return frequencies[key].trim() === CORRECT_ANSWERS.frequencies[key]
  }

  const isTableA2Correct = (key: keyof typeof tableA2) => {
    if (!showValidation) return null
    // Allow spaces in interval text like "1-3" or "1 - 3"
    const userVal = tableA2[key].trim().replace(/\s+/g, '')
    const correctVal = CORRECT_ANSWERS.tableA2[key].replace(/\s+/g, '')
    return userVal === correctVal
  }

  const isHistogramCorrect = () => {
    return histogramHeights.every((h, idx) => h === CORRECT_ANSWERS.histogramHeights[idx])
  }

  const handleVerify = () => {
    setShowValidation(true)
    // Check if everything on the current page is correct
    let pageValid = true
    
    if (currentPage === 2) {
      if (valMax !== '18' || valMin !== '1' || valRResult !== '17' || valN !== '36' || valKRound !== '6' || valP !== '3') {
        pageValid = false
      }
      Object.keys(intervals).forEach((k) => {
        if (intervals[k as keyof typeof intervals] !== CORRECT_ANSWERS.intervals[k as keyof typeof intervals]) {
          pageValid = false
        }
      })
      Object.keys(frequencies).forEach((k) => {
        if (frequencies[k as keyof typeof frequencies] !== CORRECT_ANSWERS.frequencies[k as keyof typeof frequencies]) {
          pageValid = false
        }
      })
    } else if (currentPage === 3) {
      Object.keys(tableA2).forEach((k) => {
        const u = tableA2[k as keyof typeof tableA2].trim().replace(/\s+/g, '')
        const c = CORRECT_ANSWERS.tableA2[k as keyof typeof tableA2].replace(/\s+/g, '')
        if (u !== c) pageValid = false
      })
      if (!isHistogramCorrect()) pageValid = false
    }

    setIsValidated(pageValid)
  }

  const handleNextPage = () => {
    if (currentPage < 4) {
      setCurrentPage((currentPage + 1) as any)
      setShowValidation(false)
      setIsValidated(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((currentPage - 1) as any)
      setShowValidation(false)
      setIsValidated(false)
    }
  }

  const handleSubmit = () => {
    if (readOnly) return

    const payload = {
      nama,
      kelas,
      valMax,
      valMin,
      valR1,
      valR2,
      valRResult,
      valN,
      valLogN,
      valKTerm,
      valKFloat,
      valKRound,
      valP,
      intervals,
      frequencies,
      tableA2,
      histogramHeights,
      essay2,
      essay3,
      essay4,
    }
    onSubmit?.(payload)
  }

  // Styles matching the aesthetic
  const creamTheme = {
    background: '#FAF5E4',
    cardBackground: '#FFFFFF',
    textMain: '#0F172A',
    textSecondary: '#475569',
    accentBlue: '#1E3A8A',
    accentYellow: '#FCD34D',
    borderDark: '#1E293B',
    successColor: '#10B981',
    errorColor: '#EF4444',
  }

  const getInputStyle = (isCorrect: boolean | null) => {
    const base = {
      background: '#FFFFFF',
      border: `2px solid ${creamTheme.borderDark}`,
      borderRadius: '4px',
      padding: '4px 8px',
      color: creamTheme.textMain,
      fontFamily: 'monospace',
      fontSize: '14px',
      outline: 'none',
      width: '100%',
      transition: 'all 0.2s',
    }
    if (readOnly) {
      return { ...base, border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'default' }
    }
    if (isCorrect === true) {
      return { ...base, borderColor: creamTheme.successColor, background: '#ECFDF5' }
    }
    if (isCorrect === false) {
      return { ...base, borderColor: creamTheme.errorColor, background: '#FEF2F2' }
    }
    return base
  }

  const getTextareaStyle = () => {
    return {
      background: '#FFFFFF',
      border: `2px solid ${creamTheme.borderDark}`,
      borderRadius: '8px',
      padding: '12px',
      color: creamTheme.textMain,
      fontSize: '14px',
      lineHeight: '1.6',
      width: '100%',
      minHeight: '120px',
      outline: 'none',
      resize: 'vertical' as const,
      fontFamily: 'inherit',
    }
  }

  return (
    <div
      style={{
        background: creamTheme.background,
        color: creamTheme.textMain,
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        padding: '24px 16px',
        borderRadius: '24px',
        border: `3px solid ${creamTheme.borderDark}`,
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '12px 12px 0px rgba(15, 23, 42, 0.9)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="lkpd-container"
    >
      {/* Decorative patterns */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', opacity: 0.1, backgroundImage: 'radial-gradient(#1E3A8A 20%, transparent 20%)', backgroundSize: '10px 10px' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', opacity: 0.08, backgroundImage: 'radial-gradient(#1E3A8A 20%, transparent 20%)', backgroundSize: '12px 12px' }} />

      {/* Pages */}
      <AnimatePresence mode="wait">
        
        {/* PAGE 1: COVER */}
        {currentPage === 1 && (
          <motion.div
            key="page1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '30px', paddingBottom: '30px', textAlign: 'center', minHeight: '520px', justifyContent: 'center' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: creamTheme.accentBlue, letterSpacing: '2px', marginBottom: '8px' }}>
              LKPD SKEPTIKOS
            </div>
            
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: creamTheme.accentBlue, margin: '12px 0', lineHeight: 1.2 }}>
              Tabel Distribusi<br />Frekuensi dan Histogram
            </h1>

            <div style={{ background: creamTheme.accentYellow, color: '#000', fontSize: '13px', fontWeight: 800, padding: '6px 18px', borderRadius: '4px', border: `2px solid ${creamTheme.borderDark}`, margin: '14px 0 32px', boxShadow: '3px 3px 0px #000' }}>
              Matematika Kelas 10
            </div>

            {/* Nama & Kelas Box */}
            <div
              style={{
                background: '#FFF',
                border: `3px solid ${creamTheme.borderDark}`,
                borderRadius: '8px',
                padding: '24px',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'left',
                boxShadow: '6px 6px 0px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, minWidth: '60px', fontSize: '14px' }}>Nama:</span>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    disabled={readOnly}
                    style={{
                      border: 'none',
                      borderBottom: `2px solid ${creamTheme.borderDark}`,
                      outline: 'none',
                      fontSize: '14px',
                      padding: '4px',
                      flex: 1,
                      fontWeight: 700,
                    }}
                    placeholder="Tulis namamu..."
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, minWidth: '60px', fontSize: '14px' }}>Kelas:</span>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    disabled={readOnly}
                    style={{
                      border: 'none',
                      borderBottom: `2px solid ${creamTheme.borderDark}`,
                      outline: 'none',
                      fontSize: '14px',
                      padding: '4px',
                      flex: 1,
                      fontWeight: 700,
                    }}
                    placeholder="Tulis kelasmu..."
                  />
                </div>
              </div>
            </div>

            {/* Character Illustration (DiRA Silhouette or similar) */}
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <img
                src="/avatarbaru.png"
                alt="Detective DiRA"
                style={{ height: '140px', objectFit: 'contain', borderRadius: '12px' }}
              />
              <span style={{ fontSize: '11px', color: creamTheme.textSecondary, fontWeight: 700 }}>E-LKPD Pembelajaran Statistika</span>
            </div>
          </motion.div>
        )}

        {/* PAGE 2: AKTIVITAS 1 */}
        {currentPage === 2 && (
          <motion.div
            key="page2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Header */}
            <div style={{ borderBottom: `2px solid ${creamTheme.borderDark}`, paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: '#000', color: '#FFF', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>AKTIVITAS 1</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 0', color: creamTheme.accentBlue }}>Merepresentasikan Data (Distribusi Frekuensi)</h2>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: creamTheme.textSecondary }}>Hal 2 dari 4</span>
            </div>

            {/* Data Source Box */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: creamTheme.accentBlue, marginBottom: '6px' }}>
                1. Diberikan data acak screen time harian siswa (jam/hari):
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', background: '#F8FAFC', padding: '10px', borderRadius: '6px', wordBreak: 'break-all' }}>
                [ 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 ]
              </div>
            </div>

            {/* Section A: Jangkauan */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px', color: creamTheme.accentBlue }}>a. Jangkauan / Rentang (R)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '100px' }}>Nilai terbesar:</span>
                  <div style={{ width: '60px' }}>
                    <input
                      type="text"
                      maxLength={3}
                      value={valMax}
                      onChange={(e) => setValMax(e.target.value)}
                      disabled={readOnly}
                      style={getInputStyle(isFieldCorrect('valMax', valMax, CORRECT_ANSWERS.valMax))}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '100px' }}>Nilai terkecil:</span>
                  <div style={{ width: '60px' }}>
                    <input
                      type="text"
                      maxLength={3}
                      value={valMin}
                      onChange={(e) => setValMin(e.target.value)}
                      disabled={readOnly}
                      style={getInputStyle(isFieldCorrect('valMin', valMin, CORRECT_ANSWERS.valMin))}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, flexWrap: 'wrap' }}>
                <span>(R) = Nilai terbesar - Nilai terkecil =</span>
                <input
                  type="text"
                  maxLength={3}
                  value={valR1}
                  onChange={(e) => setValR1(e.target.value)}
                  disabled={readOnly}
                  style={{ ...getInputStyle(null), width: '45px', textAlign: 'center' }}
                  placeholder="Max"
                />
                <span>-</span>
                <input
                  type="text"
                  maxLength={3}
                  value={valR2}
                  onChange={(e) => setValR2(e.target.value)}
                  disabled={readOnly}
                  style={{ ...getInputStyle(null), width: '45px', textAlign: 'center' }}
                  placeholder="Min"
                />
                <span>=</span>
                <input
                  type="text"
                  maxLength={3}
                  value={valRResult}
                  onChange={(e) => setValRResult(e.target.value)}
                  disabled={readOnly}
                  style={{ ...getInputStyle(isFieldCorrect('valRResult', valRResult, CORRECT_ANSWERS.valRResult)), width: '50px', textAlign: 'center' }}
                  placeholder="R"
                />
              </div>
            </div>

            {/* Section B: Banyak kelas */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px', color: creamTheme.accentBlue }}>b. Banyak kelas interval (K)</h3>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                Rumus Sturges: K = 1 + 3.3 log n
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>= 1 + 3.3 log</span>
                  <input
                    type="text"
                    maxLength={3}
                    value={valN}
                    onChange={(e) => setValN(e.target.value)}
                    disabled={readOnly}
                    style={{ ...getInputStyle(isFieldCorrect('valN', valN, CORRECT_ANSWERS.valN)), width: '50px', textAlign: 'center' }}
                    placeholder="n"
                  />
                  <span style={{ fontSize: '11px', color: creamTheme.textSecondary }}>(petunjuk: hitung jumlah data)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>= 1 + 3.3 *</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={valLogN}
                    onChange={(e) => setValLogN(e.target.value)}
                    disabled={readOnly}
                    style={{ ...getInputStyle(null), width: '75px', textAlign: 'center' }}
                    placeholder="log n"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>= 1 +</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={valKTerm}
                    onChange={(e) => setValKTerm(e.target.value)}
                    disabled={readOnly}
                    style={{ ...getInputStyle(null), width: '75px', textAlign: 'center' }}
                    placeholder="3.3*log n"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>=</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={valKFloat}
                    onChange={(e) => setValKFloat(e.target.value)}
                    disabled={readOnly}
                    style={{ ...getInputStyle(null), width: '75px', textAlign: 'center' }}
                    placeholder="K desimal"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                  <span>=</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={valKRound}
                    onChange={(e) => setValKRound(e.target.value)}
                    disabled={readOnly}
                    style={{ ...getInputStyle(isFieldCorrect('valKRound', valKRound, CORRECT_ANSWERS.valKRound)), width: '40px', textAlign: 'center' }}
                    placeholder="K"
                  />
                  <span>dibulatkan</span>
                </div>
              </div>
            </div>

            {/* Section C: Panjang Kelas */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px', color: creamTheme.accentBlue }}>c. Panjang interval kelas (P)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                <span>P = R / K =</span>
                <input
                  type="text"
                  maxLength={3}
                  value={valP}
                  onChange={(e) => setValP(e.target.value)}
                  disabled={readOnly}
                  style={{ ...getInputStyle(isFieldCorrect('valP', valP, CORRECT_ANSWERS.valP)), width: '50px', textAlign: 'center' }}
                  placeholder="P"
                />
              </div>
            </div>

            {/* Section D & E Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-d-e">
              
              {/* Section D: Kelas-kelas */}
              <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 12px', color: creamTheme.accentBlue }}>d. Batas-batas kelas interval</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => {
                    const minKey = `k${i}Min` as keyof typeof intervals
                    const maxKey = `k${i}Max` as keyof typeof intervals
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 700, minWidth: '80px' }}>Kelas ke-{i}:</span>
                        <input
                          type="text"
                          maxLength={3}
                          value={intervals[minKey]}
                          onChange={(e) => setIntervals({ ...intervals, [minKey]: e.target.value })}
                          disabled={readOnly}
                          style={{ ...getInputStyle(isIntervalCorrect(minKey)), width: '40px', textAlign: 'center', padding: '2px 4px' }}
                        />
                        <span>-</span>
                        <input
                          type="text"
                          maxLength={3}
                          value={intervals[maxKey]}
                          onChange={(e) => setIntervals({ ...intervals, [maxKey]: e.target.value })}
                          disabled={readOnly}
                          style={{ ...getInputStyle(isIntervalCorrect(maxKey)), width: '40px', textAlign: 'center', padding: '2px 4px' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Section E: Tabel Frekuensi */}
              <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 12px', color: creamTheme.accentBlue }}>e. Tabel distribusi frekuensi</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${creamTheme.borderDark}` }}>
                      <th style={{ padding: '6px', fontWeight: 800 }}>Kelas Interval</th>
                      <th style={{ padding: '6px', fontWeight: 800 }}>Frekuensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6].map((i) => {
                      const minKey = `k${i}Min` as keyof typeof intervals
                      const maxKey = `k${i}Max` as keyof typeof intervals
                      const fKey = `f${i}` as keyof typeof frequencies
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '6px', fontWeight: 700, fontFamily: 'monospace' }}>
                            {intervals[minKey] || '...'} - {intervals[maxKey] || '...'}
                          </td>
                          <td style={{ padding: '6px', display: 'flex', justifyContent: 'center' }}>
                            <input
                              type="text"
                              maxLength={3}
                              value={frequencies[fKey]}
                              onChange={(e) => setFrequencies({ ...frequencies, [fKey]: e.target.value })}
                              disabled={readOnly}
                              style={{ ...getInputStyle(isFrequencyCorrect(fKey)), width: '50px', textAlign: 'center', padding: '2px 4px' }}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Feedback & Action */}
            {!readOnly && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="game-btn game-btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Periksa Jawaban
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* PAGE 3: AKTIVITAS 2 (TABLE & HISTOGRAM DRAWING) */}
        {currentPage === 3 && (
          <motion.div
            key="page3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Header */}
            <div style={{ borderBottom: `2px solid ${creamTheme.borderDark}`, paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: '#000', color: '#FFF', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>AKTIVITAS 2</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 0', color: creamTheme.accentBlue }}>Menggambar Histogram Berdasarkan Tepi Kelas</h2>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: creamTheme.textSecondary }}>Hal 3 dari 4</span>
            </div>

            {/* Tepi Kelas Explanation */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '12px', fontSize: '11px', lineHeight: '1.5' }}>
              <strong style={{ color: creamTheme.accentBlue }}>a. Rumus Tepi Kelas:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                <li>Tepi bawah = Batas bawah - 0.5 &nbsp;&nbsp;&nbsp;&nbsp;(Ex: 100 - 0.5 = 99.5)</li>
                <li>Tepi atas = Batas atas + 0.5 &nbsp;&nbsp;&nbsp;&nbsp;(Ex: 199 + 0.5 = 199.5)</li>
              </ul>
            </div>

            {/* Table b: Salin Tabel */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 10px', color: creamTheme.accentBlue }}>b. Salin tabel distribusi frekuensi dan tentukan tepi kelas</h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${creamTheme.borderDark}`, background: '#F8FAFC' }}>
                    <th style={{ padding: '6px', fontWeight: 800 }}>Kelas Interval</th>
                    <th style={{ padding: '6px', fontWeight: 800 }}>Frekuensi</th>
                    <th style={{ padding: '6px', fontWeight: 800 }}>Tepi Bawah</th>
                    <th style={{ padding: '6px', fontWeight: 800 }}>Tepi Atas</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((i) => {
                    const rowKeyInt = `row${i}Int` as keyof typeof tableA2
                    const rowKeyFreq = `row${i}Freq` as keyof typeof tableA2
                    const rowKeyTb = `row${i}Tb` as keyof typeof tableA2
                    const rowKeyTa = `row${i}Ta` as keyof typeof tableA2
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '4px' }}>
                          <input
                            type="text"
                            value={tableA2[rowKeyInt]}
                            onChange={(e) => setTableA2({ ...tableA2, [rowKeyInt]: e.target.value })}
                            disabled={readOnly}
                            style={{ ...getInputStyle(isTableA2Correct(rowKeyInt)), textAlign: 'center', padding: '2px' }}
                            placeholder="e.g. 1-3"
                          />
                        </td>
                        <td style={{ padding: '4px' }}>
                          <input
                            type="text"
                            value={tableA2[rowKeyFreq]}
                            onChange={(e) => setTableA2({ ...tableA2, [rowKeyFreq]: e.target.value })}
                            disabled={readOnly}
                            style={{ ...getInputStyle(isTableA2Correct(rowKeyFreq)), textAlign: 'center', padding: '2px' }}
                            placeholder="f"
                          />
                        </td>
                        <td style={{ padding: '4px' }}>
                          <input
                            type="text"
                            value={tableA2[rowKeyTb]}
                            onChange={(e) => setTableA2({ ...tableA2, [rowKeyTb]: e.target.value })}
                            disabled={readOnly}
                            style={{ ...getInputStyle(isTableA2Correct(rowKeyTb)), textAlign: 'center', padding: '2px' }}
                            placeholder="TB"
                          />
                        </td>
                        <td style={{ padding: '4px' }}>
                          <input
                            type="text"
                            value={tableA2[rowKeyTa]}
                            onChange={(e) => setTableA2({ ...tableA2, [rowKeyTa]: e.target.value })}
                            disabled={readOnly}
                            style={{ ...getInputStyle(isTableA2Correct(rowKeyTa)), textAlign: 'center', padding: '2px' }}
                            placeholder="TA"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Histogram Graph */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 4px', color: creamTheme.accentBlue }}>
                c. Membuat grafik histogram dari data pada tabel distribusi frekuensi
              </h3>
              <p style={{ fontSize: '11px', color: creamTheme.textSecondary, margin: '0 0 14px' }}>
                {readOnly ? 'Tinggi batang histogram yang digambar siswa:' : 'Klik tombol +/- di bawah batang untuk mengatur frekuensi/tinggi batang (sesuaikan dengan tabel):'}
              </p>

              {/* Coordinates Frame */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px', margin: '0 auto', background: '#FAFAF9', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                
                {/* Visual Chart */}
                <div style={{ display: 'flex', height: '180px', position: 'relative', borderLeft: '2.5px solid #1E293B', borderBottom: '2.5px solid #1E293B' }}>
                  
                  {/* Grid Lines (horizontal) */}
                  {[0, 2, 4, 6, 8, 10, 12].map((val) => (
                    <div
                      key={val}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(val / 12) * 100}%`,
                        borderBottom: '1px dashed rgba(30, 41, 59, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ position: 'absolute', left: '-18px', fontSize: '9px', fontWeight: 800, color: '#64748B' }}>{val}</span>
                    </div>
                  ))}

                  {/* Bars Container */}
                  <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', paddingLeft: '4px' }}>
                    {histogramHeights.map((h, i) => {
                      const colColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']
                      const isCorrect = showValidation ? h === CORRECT_ANSWERS.histogramHeights[i] : null
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            position: 'relative',
                            padding: '0 2px',
                          }}
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(h / 12) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            style={{
                              background: isCorrect === false
                                ? 'rgba(239, 68, 68, 0.45)'
                                : isCorrect === true
                                  ? 'rgba(16, 185, 129, 0.55)'
                                  : `linear-gradient(180deg, ${colColors[i]}CC 0%, ${colColors[i]}44 100%)`,
                              border: `1.5px solid ${isCorrect === false ? '#EF4444' : isCorrect === true ? '#10B981' : colColors[i]}`,
                              borderBottom: 'none',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              paddingTop: '4px',
                            }}
                          >
                            {h > 0 && (
                              <span style={{ fontSize: '9px', fontWeight: 900, color: '#000', background: 'rgba(255,255,255,0.7)', padding: '1px 3px', borderRadius: '3px' }}>
                                f={h}
                              </span>
                            )}
                          </motion.div>
                        </div>
                      )
                    })}
                  </div>

                </div>

                {/* X-axis labels (Tepi Kelas ticks) */}
                <div style={{ display: 'flex', width: '100%', height: '14px', position: 'relative', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  {['0.5', '3.5', '6.5', '9.5', '12.5', '15.5', '18.5'].map((tick, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '9px',
                        color: '#64748B',
                        fontWeight: 800,
                        transform: 'translateX(-50%)',
                        position: 'absolute',
                        left: `${(idx / 6) * 100}%`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tick}
                    </span>
                  ))}
                </div>

                <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', marginTop: '4px' }}>
                  SCREEN TIME (JAM/HARI)
                </div>

                {/* Controls (hidden in readOnly) */}
                {!readOnly && (
                  <div style={{ display: 'flex', width: '100%', marginTop: '8px', gap: '4px' }}>
                    {histogramHeights.map((h, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (h < 12) {
                              const newH = [...histogramHeights]
                              newH[i] = h + 1
                              setHistogramHeights(newH)
                            }
                          }}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #1E293B', background: '#FFF', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          +
                        </button>
                        <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'monospace' }}>{h}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (h > 0) {
                              const newH = [...histogramHeights]
                              newH[i] = h - 1
                              setHistogramHeights(newH)
                            }
                          }}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #1E293B', background: '#FFF', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          -
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Validation & Action */}
            {!readOnly && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="game-btn game-btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Periksa Jawaban
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* PAGE 4: ESSAY QUESTIONS */}
        {currentPage === 4 && (
          <motion.div
            key="page4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Header */}
            <div style={{ borderBottom: `2px solid ${creamTheme.borderDark}`, paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: '#000', color: '#FFF', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>PERTANYAAN REFLEKSI</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 0', color: creamTheme.accentBlue }}>Menganalisis &amp; Menarik Kesimpulan</h2>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: creamTheme.textSecondary }}>Hal 4 dari 4</span>
            </div>

            {/* Question 2 */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: creamTheme.accentBlue, marginBottom: '10px' }}>
                2) Kamu telah bermain level satu pada platform SKEPTIKOS. Menurutmu, apakah benar postingan di Instagram tersebut, bahwasanya remaja Indonesia rata-rata menghabiskan &gt; 8 jam sehari di medsos! Tuliskan pendapatmu setelah membuat tabel distribusi frekuensi data histogram:
              </div>
              <textarea
                value={essay2}
                onChange={(e) => setEssay2(e.target.value)}
                disabled={readOnly}
                style={getTextareaStyle()}
                placeholder="Tuliskan pendapatmu di sini..."
              />
            </div>

            {/* Question 3 */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: creamTheme.accentBlue, marginBottom: '10px' }}>
                3) Menurutmu apakah ada hubungan memahami materi tabel distribusi frekuensi dan histogram dengan literasi digital? Berikan alasannya:
              </div>
              <textarea
                value={essay3}
                onChange={(e) => setEssay3(e.target.value)}
                disabled={readOnly}
                style={getTextareaStyle()}
                placeholder="Tuliskan alasanmu di sini..."
              />
            </div>

            {/* Question 4 */}
            <div style={{ background: '#FFF', border: `2px solid ${creamTheme.borderDark}`, borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: creamTheme.accentBlue, marginBottom: '10px' }}>
                4) Pada game level 1 yang telah kamu selesaikan sebelumnya. Pada postingan tersebut terdapat komentar-komentar negative dan langsung mempercayai postingan tersebut tanpa divalidasi lebih lanjut. Menurutmu sebagai seorang siswa apakah boleh memberikan komentar yang demikian? Berikan alasannya!
              </div>
              <textarea
                value={essay4}
                onChange={(e) => setEssay4(e.target.value)}
                disabled={readOnly}
                style={getTextareaStyle()}
                placeholder="Tuliskan analisis dan alasannya di sini..."
              />
            </div>

            {/* Submit Action */}
            {!readOnly && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!nama.trim() || !kelas.trim() || !essay2.trim() || !essay3.trim() || !essay4.trim()}
                  className="game-btn game-btn-primary"
                  style={{
                    padding: '12px 30px',
                    fontSize: '14px',
                    fontWeight: 800,
                    boxShadow: '4px 4px 0px #000',
                    background: (!nama.trim() || !kelas.trim() || !essay2.trim() || !essay3.trim() || !essay4.trim()) ? '#CBD5E1' : 'linear-gradient(90deg, #D97706, #EA580C)',
                    cursor: (!nama.trim() || !kelas.trim() || !essay2.trim() || !essay3.trim() || !essay4.trim()) ? 'not-allowed' : 'pointer',
                  }}
                >
                  Kirim LKPD Sekarang
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Navigation Buttons for paging (always visible at bottom) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', borderTop: `2px solid ${creamTheme.borderDark}`, marginTop: '20px', paddingTop: '16px' }}>
        
        {/* Dots on top, nicely centered */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
          {[1, 2, 3, 4].map((p) => (
            <div
              key={p}
              onClick={() => setCurrentPage(p as any)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentPage === p ? creamTheme.accentBlue : '#CBD5E1',
                cursor: 'pointer',
                border: `1.5px solid ${creamTheme.borderDark}`,
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        {/* Buttons below, side by side with plenty of padding */}
        <div style={{ display: 'flex', width: '100%', gap: '12px', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="game-btn game-btn-secondary"
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '13px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === 1 ? 0.4 : 1,
              border: `2px solid ${creamTheme.borderDark}`,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Halaman Sebelumnya
          </button>
          
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === 4}
            className="game-btn game-btn-secondary"
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '13px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === 4 ? 0.4 : 1,
              border: `2px solid ${creamTheme.borderDark}`,
              cursor: currentPage === 4 ? 'not-allowed' : 'pointer',
            }}
          >
            Halaman Berikutnya
          </button>
        </div>

      </div>

    </div>
  )
}
