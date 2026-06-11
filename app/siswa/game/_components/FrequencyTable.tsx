'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CORRECT_TABLE } from '../_data/level1'

export type FreqRow = {
  kelas: string
  f: string
  fRel: string
  fKum: string
}

// Which cells are pre-filled for FD mode (indices: 0=first row, etc.)
const FD_FILLED: Record<number, Partial<FreqRow>> = {
  0: { kelas: '3.5 – 4.4', f: '8', fRel: '20.0', fKum: '8' },
  1: { kelas: '4.5 – 5.4' },
  2: { kelas: '5.5 – 6.4', f: '12' },
  3: { kelas: '6.5 – 7.4' },
  4: { kelas: '7.5 – 8.4', fKum: '39' },
  5: { kelas: '8.5 – 9.4' },
}

const TOOLTIPS: Record<keyof FreqRow, string> = {
  kelas: 'Kelas interval: dimulai dari 3.5, lebar tiap kelas = 1.0 jam',
  f: 'Frekuensi (f): hitung berapa siswa yang masuk tiap kelas screen time',
  fRel: 'Frekuensi Relatif (%): (f ÷ n) × 100, n = 40 siswa',
  fKum: 'Frekuensi Kumulatif: jumlah semua frekuensi hingga kelas ini',
}

type Mode = 'FI' | 'FD'

interface FrequencyTableProps {
  mode: Mode
  onSubmit: (isCorrect: boolean, rows: FreqRow[]) => void
}

const emptyRow = (): FreqRow => ({ kelas: '', f: '', fRel: '', fKum: '' })

function initRows(mode: Mode): FreqRow[] {
  return CORRECT_TABLE.map((_, i) => {
    if (mode === 'FD') {
      const prefilled = FD_FILLED[i] ?? {}
      return {
        kelas: prefilled.kelas ?? '',
        f: prefilled.f ?? '',
        fRel: prefilled.fRel ?? '',
        fKum: prefilled.fKum ?? '',
      }
    }
    return emptyRow()
  })
}

function isCellFilled(mode: Mode, rowIdx: number, field: keyof FreqRow): boolean {
  if (mode !== 'FD') return false
  return (FD_FILLED[rowIdx] as Record<string, string | undefined>)?.[field] !== undefined
}

export default function FrequencyTable({ mode, onSubmit }: FrequencyTableProps) {
  const [rows, setRows] = useState<FreqRow[]>(() => initRows(mode))
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const updateCell = (rowIdx: number, field: keyof FreqRow, value: string) => {
    setRows(prev => {
      const next = [...prev]
      next[rowIdx] = { ...next[rowIdx], [field]: value }
      return next
    })
    setErrors(prev => {
      const next = new Set(prev)
      next.delete(`${rowIdx}-${field}`)
      return next
    })
  }

  const handleSubmit = () => {
    const newErrors = new Set<string>()
    CORRECT_TABLE.forEach((correct, i) => {
      const row = rows[i]
      if (!isCellFilled(mode, i, 'kelas') && row.kelas.trim() !== correct.kelas) newErrors.add(`${i}-kelas`)
      if (!isCellFilled(mode, i, 'f') && parseInt(row.f) !== correct.f) newErrors.add(`${i}-f`)
      if (!isCellFilled(mode, i, 'fRel') && Math.abs(parseFloat(row.fRel) - correct.fRel) > 0.5) newErrors.add(`${i}-fRel`)
      if (!isCellFilled(mode, i, 'fKum') && parseInt(row.fKum) !== correct.fKum) newErrors.add(`${i}-fKum`)
    })

    setErrors(newErrors)
    setSubmitted(true)
    const correct = newErrors.size === 0
    onSubmit(correct, rows)
  }

  const fields: (keyof FreqRow)[] = ['kelas', 'f', 'fRel', 'fKum']
  const headers = ['Kelas Interval', 'Frekuensi (f)', 'Frek. Relatif (%)', 'Frek. Kumulatif']

  return (
    <div>
      <div className="data-table-wrap" style={{ marginBottom: '16px' }}>
        <table className="data-table" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>
                  {h}{' '}
                  {mode === 'FD' && (
                    <span
                      className="freq-tooltip"
                      data-tip={TOOLTIPS[fields[i]]}
                      title={TOOLTIPS[fields[i]]}
                    >❓</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <motion.tr
                key={rowIdx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.05 }}
              >
                {fields.map((field) => {
                  const filled = isCellFilled(mode, rowIdx, field)
                  const key = `${rowIdx}-${field}`
                  const hasError = errors.has(key)
                  const isCorrect = submitted && !hasError && !filled

                  if (filled) {
                    return (
                      <td key={field}>
                        <div className="freq-table-cell-filled">{row[field]}</div>
                      </td>
                    )
                  }

                  return (
                    <td key={field}>
                      <input
                        className={`freq-table-input ${hasError ? 'error' : ''} ${isCorrect ? 'correct' : ''} ${mode === 'FD' ? 'freq-table-cell-hint' : ''}`}
                        value={row[field]}
                        onChange={e => updateCell(rowIdx, field, e.target.value)}
                        placeholder={mode === 'FD' ? '?' : '—'}
                        disabled={submitted && !hasError}
                      />
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {!submitted && (
        <button className="game-btn game-btn-primary" onClick={handleSubmit} style={{ width: '100%' }}>
          Submit Tabel →
        </button>
      )}

      {submitted && errors.size > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            background: 'var(--danger-dim)', border: '1px solid rgba(255,51,102,0.3)',
            borderRadius: '12px', padding: '14px 18px', marginTop: '12px',
            color: 'var(--danger)', fontSize: '14px'
          }}
        >
          ❌ {errors.size} cell masih salah. Periksa kembali dan submit ulang.
          <button 
            className="game-btn game-btn-secondary" 
            onClick={() => { setSubmitted(false); setErrors(new Set()) }}
            style={{ marginTop: '10px', width: '100%', fontSize: '13px', padding: '8px' }}
          >
            Coba Lagi
          </button>
        </motion.div>
      )}
    </div>
  )
}
