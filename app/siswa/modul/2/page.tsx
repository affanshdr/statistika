'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────
type Student = {
  id: string
  name: string
  nisn: string
  geftStatus: 'not_taken' | 'completed'
  classroom: { name: string }
  geftResult?: {
    score: number
    cognitiveStyle: 'FI' | 'FD'
  }
}

type ClassInterval = {
  lower: number
  upper: number
  midpoint: number
  label: string
}

const INTERVALS: ClassInterval[] = [
  { lower: 150, upper: 154, midpoint: 152, label: '150 - 154' },
  { lower: 155, upper: 159, midpoint: 157, label: '155 - 159' },
  { lower: 160, upper: 164, midpoint: 162, label: '160 - 164' },
  { lower: 165, upper: 169, midpoint: 167, label: '165 - 169' },
  { lower: 170, upper: 174, midpoint: 172, label: '170 - 174' },
]

// ── Isometric 3D SVG Histogram ─────────────────────────────────────────────
type ThreeDHistogramProps = {
  frequencies: number[]
  highlightedIndex?: number
  onBarClick?: (index: number) => void
  activeLabel?: string
}

function ThreeDHistogram({ frequencies, highlightedIndex, onBarClick, activeLabel }: ThreeDHistogramProps) {
  const width = 28
  const depth = 14
  const startY = 230
  const scale = 8 // Height scale per frequency unit

  return (
    <div style={{ background: '#0a1428', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Hologram Grid Lines */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(rgba(34,211,238,0.4) 1px, transparent 0)', backgroundSize: '16px 16px', pointerEvents: 'none' }} />
      
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,211,238,0.85)', background: 'rgba(34,211,238,0.1)', padding: '4px 12px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px', letterSpacing: '0.5px' }}>
        <span>📐 Projection Mode: AR 3D Hologram Simulator</span>
      </div>

      <svg viewBox="0 0 460 280" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'auto' }}>
        {/* Isometric Grid Floor */}
        <path d="M 40 230 L 230 135 L 420 230 L 230 325 Z" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        
        {frequencies.map((f, i) => {
          const x0 = 70 + i * 78
          const y0 = startY
          const h = f * scale
          
          const isHighlighted = highlightedIndex === i
          
          // Color palettes: highlighted is neon cyan/gold, else standard glow blue
          const topColor = isHighlighted ? '#22d3ee' : '#3b82f6'
          const rightColor = isHighlighted ? '#0891b2' : '#2563eb'
          const leftColor = isHighlighted ? '#0369a1' : '#1d4ed8'

          // Top face points
          const topPts = `${x0},${y0 - h} ${x0 + width},${y0 - depth - h} ${x0},${y0 - 2 * depth - h} ${x0 - width},${y0 - depth - h}`
          // Left face points
          const leftPts = `${x0},${y0} ${x0 - width},${y0 - depth} ${x0 - width},${y0 - depth - h} ${x0},${y0 - h}`
          // Right face points
          const rightPts = `${x0},${y0} ${x0 + width},${y0 - depth} ${x0 + width},${y0 - depth - h} ${x0},${y0 - h}`

          return (
            <g 
              key={i} 
              style={{ cursor: 'pointer', transition: 'all 0.3s' }} 
              onClick={() => onBarClick && onBarClick(i)}
            >
              {/* Highlight Glow Underlay */}
              {isHighlighted && (
                <ellipse cx={x0} cy={y0 - depth} rx={width + 12} ry={depth + 6} fill="rgba(34,211,238,0.12)" filter="blur(6px)" />
              )}
              
              {/* Left Face */}
              <polygon points={leftPts} fill={leftColor} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
              {/* Right Face */}
              <polygon points={rightPts} fill={rightColor} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
              {/* Top Face */}
              <polygon points={topPts} fill={topColor} stroke="rgba(255,255,255,0.15)" />
              <polygon points={topPts} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />

              {/* Text label underneath */}
              <text 
                x={x0} 
                y={y0 + 20} 
                textAnchor="middle" 
                fill={isHighlighted ? '#22d3ee' : 'rgba(255,255,255,0.45)'} 
                style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: isHighlighted ? 700 : 500 }}
              >
                {INTERVALS[i].label}
              </text>
              
              {/* Value inside bar */}
              <text 
                x={x0} 
                y={y0 - h - 14} 
                textAnchor="middle" 
                fill={isHighlighted ? '#22d3ee' : '#fff'} 
                style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace' }}
              >
                f={f}
              </text>
            </g>
          )
        })}
      </svg>
      {activeLabel && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {activeLabel}
        </div>
      )}
    </div>
  )
}

// ── MAIN MODULE PAGE ────────────────────────────────────────────────────────
export default function Modul2Page() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  // Module state
  const [frequencies, setFrequencies] = useState<number[]>([4, 8, 14, 10, 4])

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data) as Student
    if (s.geftStatus !== 'completed') { router.push('/siswa/geft'); return }
    setStudent(s)
    setLoading(false)
  }, [router])

  if (loading || !student) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
        <p style={{ color: '#fff' }}>Memuat Modul Adaptif...</p>
      </main>
    )
  }

  const cognitiveStyle = student.geftResult?.cognitiveStyle || 'FI'

  // Calculations for stats
  const totalN = frequencies.reduce((a, b) => a + b, 0)
  
  // Mean calculation
  const sumFX = frequencies.reduce((acc, f, i) => acc + (f * INTERVALS[i].midpoint), 0)
  const meanVal = totalN > 0 ? (sumFX / totalN) : 0

  // Cumulative frequencies
  const cumulativeFreqs: number[] = []
  frequencies.reduce((acc, f, i) => {
    const sum = acc + f
    cumulativeFreqs.push(sum)
    return sum
  }, 0)

  // Median calculation
  const targetHalfN = totalN / 2
  let medianClassIndex = 0
  for (let i = 0; i < cumulativeFreqs.length; i++) {
    if (cumulativeFreqs[i] >= targetHalfN) {
      medianClassIndex = i
      break
    }
  }
  const medClass = INTERVALS[medianClassIndex]
  const L_median = medClass.lower - 0.5
  const F_median = medianClassIndex > 0 ? cumulativeFreqs[medianClassIndex - 1] : 0
  const f_median = frequencies[medianClassIndex]
  const classIntervalWidth = 5
  const medianVal = totalN > 0 
    ? (L_median + ((targetHalfN - F_median) / f_median) * classIntervalWidth) 
    : 0

  // Modus calculation
  let modalClassIndex = 0
  let maxFreq = 0
  frequencies.forEach((f, i) => {
    if (f > maxFreq) {
      maxFreq = f
      modalClassIndex = i
    }
  })
  const modClass = INTERVALS[modalClassIndex]
  const L_modus = modClass.lower - 0.5
  const f_modal = frequencies[modalClassIndex]
  const f_prev = modalClassIndex > 0 ? frequencies[modalClassIndex - 1] : 0
  const f_next = modalClassIndex < frequencies.length - 1 ? frequencies[modalClassIndex + 1] : 0
  const d1 = f_modal - f_prev
  const d2 = f_modal - f_next
  const modusVal = totalN > 0
    ? (L_modus + (d1 / (d1 + d2)) * classIntervalWidth)
    : 0

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #030712 0%, #080f25 50%, #020617 100%)', color: '#f3f4f6', fontFamily: 'var(--font-sans), sans-serif', paddingBottom: '40px' }}>
      
      {/* Layout styling */}
      <style>{`
        .modul-navbar {
          background: rgba(3, 7, 18, 0.65);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .modul-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .adaptive-badge {
          align-self: flex-start;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 6px 14px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .grid-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 28px;
          align-items: start;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
        }
        .control-slider-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .control-slider-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .control-slider-item input[type="range"] {
          width: 50%;
          cursor: pointer;
        }
        .formula-card {
          border-left: 4px solid #3b82f6;
          background: rgba(59, 130, 246, 0.03);
          padding: 16px;
          border-radius: 0 12px 12px 0;
          margin-top: 16px;
        }
        @media (max-width: 800px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
          .modul-container {
            padding: 16px 16px;
            gap: 20px;
          }
        }
      `}</style>

      {/* Navbar */}
      <header className="modul-navbar">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🔬</span>
            <span style={{ fontFamily: 'var(--font-heading), sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AR-COGNISTATS</span>
          </div>
          <button 
            onClick={() => router.push('/siswa')}
            style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Content wrapper */}
      <div className="modul-container">
        
        {/* Header & Style Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cognitiveStyle === 'FI' ? (
            <span className="adaptive-badge" style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.25)' }}>
              🧠 FIELD INDEPENDENT MODE: ANALYTICAL & EXPLORATIVE LEARNING
            </span>
          ) : (
            <span className="adaptive-badge" style={{ color: '#22d3ee', background: 'rgba(34,211,238,0.12)', borderColor: 'rgba(34,211,238,0.25)' }}>
              🧠 FIELD DEPENDENT MODE: STEP-BY-STEP SCAFFOLDING TUTE
            </span>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Modul 2: Ukuran Pemusatan Data Kelompok</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Pelajari konsep Mean, Median, dan Modus data kelompok melalui simulasi interaktif proyeksi 3D AR.
          </p>
        </div>

        {/* Dynamic Treatment Dispatcher */}
        {cognitiveStyle === 'FI' ? (
          <FIMaterialView 
            frequencies={frequencies}
            setFrequencies={setFrequencies}
            meanVal={meanVal}
            medianVal={medianVal}
            modusVal={modusVal}
            totalN={totalN}
            sumFX={sumFX}
            medianClassIndex={medianClassIndex}
            modalClassIndex={modalClassIndex}
            cumulativeFreqs={cumulativeFreqs}
            L_median={L_median}
            F_median={F_median}
            f_median={f_median}
            L_modus={L_modus}
            d1={d1}
            d2={d2}
            classWidth={classIntervalWidth}
          />
        ) : (
          <FDMaterialView 
            frequencies={frequencies}
            setFrequencies={setFrequencies}
            meanVal={meanVal}
            medianVal={medianVal}
            modusVal={modusVal}
            totalN={totalN}
            sumFX={sumFX}
            medianClassIndex={medianClassIndex}
            modalClassIndex={modalClassIndex}
            cumulativeFreqs={cumulativeFreqs}
            L_median={L_median}
            F_median={F_median}
            f_median={f_median}
            L_modus={L_modus}
            d1={d1}
            d2={d2}
            classWidth={classIntervalWidth}
          />
        )}

      </div>
    </main>
  )
}

// ── TREATMENT 1: FIELD INDEPENDENT (FI) VIEW ────────────────────────────────
type FIViewProps = {
  frequencies: number[]
  setFrequencies: React.Dispatch<React.SetStateAction<number[]>>
  meanVal: number
  medianVal: number
  modusVal: number
  totalN: number
  sumFX: number
  medianClassIndex: number
  modalClassIndex: number
  cumulativeFreqs: number[]
  L_median: number
  F_median: number
  f_median: number
  L_modus: number
  d1: number
  d2: number
  classWidth: number
}

function FIMaterialView({
  frequencies,
  setFrequencies,
  meanVal,
  medianVal,
  modusVal,
  totalN,
  sumFX,
  medianClassIndex,
  modalClassIndex,
  cumulativeFreqs,
  L_median,
  F_median,
  f_median,
  L_modus,
  d1,
  d2,
  classWidth
}: FIViewProps) {
  const [activeTab, setActiveTab] = useState<'mean' | 'median' | 'modus'>('mean')
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined)

  const targetHalfN = totalN / 2
  const medClass = INTERVALS[medianClassIndex]
  const f_modal = frequencies[modalClassIndex]
  const modClass = INTERVALS[modalClassIndex]
  const f_prev = modalClassIndex > 0 ? frequencies[modalClassIndex - 1] : 0
  const f_next = modalClassIndex < frequencies.length - 1 ? frequencies[modalClassIndex + 1] : 0

  // Highlight column based on chosen tab
  useEffect(() => {
    if (activeTab === 'median') {
      setHighlightedIndex(medianClassIndex)
    } else if (activeTab === 'modus') {
      setHighlightedIndex(modalClassIndex)
    } else {
      setHighlightedIndex(undefined)
    }
  }, [activeTab, medianClassIndex, modalClassIndex])

  function handleFrequencyChange(index: number, val: number) {
    setFrequencies(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  return (
    <div className="grid-layout">
      
      {/* Left Column: Interactive Simulation & Customization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Hologram Box */}
        <ThreeDHistogram 
          frequencies={frequencies}
          highlightedIndex={highlightedIndex}
          activeLabel={
            activeTab === 'mean' ? `Menampilkan semua sebaran data (N = ${totalN} siswa)` :
            activeTab === 'median' ? `Highlighted: Kelas Median (${INTERVALS[medianClassIndex].label}) karena data ke-${totalN/2} jatuh di sini.` :
            `Highlighted: Kelas Modus (${INTERVALS[modalClassIndex].label}) dengan frekuensi tertinggi (${frequencies[modalClassIndex]}).`
          }
        />

        {/* Data Customizer Control Panel */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#fff' }}>🛠️ Eksplorasi Data: Atur Frekuensi</h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '-8px', marginBottom: '16px', lineHeight: 1.5 }}>
            Ubah frekuensi kelas tinggi badan di bawah menggunakan slider untuk mengamati perubahan letak Mean, Median, dan Modus secara dinamis di grafik 3D.
          </p>
          <div className="control-slider-group">
            {INTERVALS.map((int, i) => (
              <div key={i} className="control-slider-item">
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Tinggi {int.label} cm</span>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={frequencies[i]}
                  onChange={e => handleFrequencyChange(i, parseInt(e.target.value))}
                />
                <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 800, width: '40px', textAlign: 'right' }}>
                  {frequencies[i]} org
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Analytical Computations & Tabbed Formulas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Results summary widget */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center', background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}>
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.5px' }}>RATA-RATA (MEAN)</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#3b82f6' }}>{meanVal.toFixed(2)}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.5px' }}>NILAI TENGAH (MEDIAN)</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#60a5fa' }}>{medianVal.toFixed(2)}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.5px' }}>MODUS</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#22d3ee' }}>{modusVal.toFixed(2)}</span>
          </div>
        </div>

        {/* Tabbed Formula & Computations */}
        <div className="glass-card">
          
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('mean')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'mean' ? '#3b82f6' : 'rgba(255,255,255,0.03)', color: activeTab === 'mean' ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Rata-Rata (Mean)
            </button>
            <button 
              onClick={() => setActiveTab('median')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'median' ? '#3b82f6' : 'rgba(255,255,255,0.03)', color: activeTab === 'median' ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Nilai Tengah (Median)
            </button>
            <button 
              onClick={() => setActiveTab('modus')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'modus' ? '#3b82f6' : 'rgba(255,255,255,0.03)', color: activeTab === 'modus' ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Modus
            </button>
          </div>

          {/* MEAN CONTENT */}
          {activeTab === 'mean' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Rumus Mean Data Kelompok</h4>
              
              <div className="formula-card">
                <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#93c5fd' }}>
                  x̄ = (Σ (f_i × x_i)) / Σ f_i
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                  Keterangan: f_i = frekuensi kelas ke-i, x_i = nilai tengah kelas ke-i
                </div>
              </div>

              {/* Math Table representation */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', marginTop: '8px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                    <th style={{ padding: '8px 4px' }}>Tinggi (cm)</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>f_i</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>x_i</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>f_i × x_i</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERVALS.map((int, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600 }}>{int.label}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'center', color: '#60a5fa' }}>{frequencies[i]}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{int.midpoint}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 700 }}>{frequencies[i] * int.midpoint}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.15)', fontWeight: 800 }}>
                    <td style={{ padding: '12px 4px' }}>Jumlah (Σ)</td>
                    <td style={{ padding: '12px 4px', textAlign: 'center' }}>{totalN}</td>
                    <td style={{ padding: '12px 4px', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '12px 4px', textAlign: 'right', color: '#3b82f6' }}>{sumFX}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', lineHeight: 1.6 }}>
                <strong>Langkah Perhitungan Substitusi:</strong>
                <div style={{ fontFamily: 'monospace', margin: '8px 0', fontSize: '13px' }}>
                  x̄ = {sumFX} / {totalN} = <span style={{ color: '#3b82f6', fontWeight: 800 }}>{meanVal.toFixed(2)} cm</span>
                </div>
              </div>
            </div>
          )}

          {/* MEDIAN CONTENT */}
          {activeTab === 'median' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Rumus Median Data Kelompok</h4>
              
              <div className="formula-card" style={{ borderLeftColor: '#60a5fa', background: 'rgba(96,165,250,0.03)' }}>
                <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#93c5fd' }}>
                  Me = L + ((N/2 - F_k) / f_m) × c
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', lineHeight: 1.4 }}>
                  L = tepi bawah kelas median, N = total frekuensi, F_k = frekuensi kumulatif sebelum kelas median, f_m = frekuensi kelas median, c = panjang kelas
                </div>
              </div>

              {/* Step checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <strong>1. Cari Kelas Median:</strong> Letak median = N / 2 = {totalN} / 2 = {targetHalfN}. 
                  Kelas dengan F_k ≥ {targetHalfN} terdekat adalah kelas <span style={{ color: '#22d3ee', fontWeight: 700 }}>{medClass.label}</span>.
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Tepi Bawah (L):</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>{medClass.lower} - 0.5 = {L_median}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>F_k sebelum:</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>{F_median}</strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.6 }}>
                  <strong>Langkah Perhitungan Substitusi:</strong>
                  <div style={{ fontFamily: 'monospace', margin: '8px 0', fontSize: '12px', lineHeight: 1.6 }}>
                    Me = {L_median} + (({targetHalfN} - {F_median}) / {f_median}) × {classWidth} <br/>
                    Me = {L_median} + ({(targetHalfN - F_median).toFixed(1)} / {f_median}) × {classWidth} <br/>
                    Me = {L_median} + {(((targetHalfN - F_median) / f_median) * classWidth).toFixed(3)} <br/>
                    Me = <span style={{ color: '#60a5fa', fontWeight: 800 }}>{medianVal.toFixed(2)} cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODUS CONTENT */}
          {activeTab === 'modus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Rumus Modus Data Kelompok</h4>
              
              <div className="formula-card" style={{ borderLeftColor: '#22d3ee', background: 'rgba(34,211,238,0.03)' }}>
                <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#93c5fd' }}>
                  Mo = L + (d1 / (d1 + d2)) × c
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', lineHeight: 1.4 }}>
                  L = tepi bawah kelas modus, d1 = f_modus - f_sebelumnya, d2 = f_modus - f_setelahnya, c = panjang kelas
                </div>
              </div>

              {/* Step info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <strong>1. Cari Kelas Modus:</strong> Frekuensi tertinggi = {f_modal} pada kelas <span style={{ color: '#22d3ee', fontWeight: 700 }}>{modClass.label}</span>.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Selisih Sebelum (d1):</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>{f_modal} - {f_prev} = {d1}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Selisih Setelah (d2):</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>{f_modal} - {f_next} = {d2}</strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.6 }}>
                  <strong>Langkah Perhitungan Substitusi:</strong>
                  <div style={{ fontFamily: 'monospace', margin: '8px 0', fontSize: '12px', lineHeight: 1.6 }}>
                    Mo = {L_modus} + ({d1} / ({d1} + {d2})) × {classWidth} <br/>
                    Mo = {L_modus} + ({d1} / {d1 + d2}) × {classWidth} <br/>
                    Mo = {L_modus} + {((d1 / (d1 + d2)) * classWidth).toFixed(3)} <br/>
                    Mo = <span style={{ color: '#22d3ee', fontWeight: 800 }}>{modusVal.toFixed(2)} cm</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

// ── TREATMENT 2: FIELD DEPENDENT (FD) VIEW ──────────────────────────────────
type FDViewProps = {
  frequencies: number[]
  setFrequencies: React.Dispatch<React.SetStateAction<number[]>>
  meanVal: number
  medianVal: number
  modusVal: number
  totalN: number
  sumFX: number
  medianClassIndex: number
  modalClassIndex: number
  cumulativeFreqs: number[]
  L_median: number
  F_median: number
  f_median: number
  L_modus: number
  d1: number
  d2: number
  classWidth: number
}

function FDMaterialView({
  frequencies,
  setFrequencies,
  meanVal,
  medianVal,
  modusVal,
  totalN,
  sumFX,
  medianClassIndex,
  modalClassIndex,
  cumulativeFreqs,
  L_median,
  F_median,
  f_median,
  L_modus,
  d1,
  d2,
  classWidth
}: FDViewProps) {
  const [step, setStep] = useState<number>(1)
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined)
  const [activeLabel, setActiveLabel] = useState<string>('')
  const [modalCheckPassed, setModalCheckPassed] = useState<boolean | null>(null)

  const targetHalfN = totalN / 2
  const medClass = INTERVALS[medianClassIndex]
  const modClass = INTERVALS[modalClassIndex]
  const router = useRouter()

  // Configure highlighters depending on wizard step
  useEffect(() => {
    setModalCheckPassed(null) // Reset interactive states on step change
    if (step === 1) {
      setHighlightedIndex(undefined)
      setActiveLabel('Ketuk balok 3D di bawah untuk melihat nama kelas dan frekuensinya.')
    } else if (step === 2) {
      setHighlightedIndex(undefined)
      setActiveLabel(`Semua balok dihitung bersama. Rata-rata (Mean) seimbang di nilai ${meanVal.toFixed(2)} cm.`)
    } else if (step === 3) {
      setHighlightedIndex(medianClassIndex)
      setActiveLabel(`Kelas median disorot karena data ke-${totalN/2} berada pada kelas ${INTERVALS[medianClassIndex].label}.`)
    } else if (step === 4) {
      setHighlightedIndex(undefined)
      setActiveLabel('TANTANGAN: Bisakah kamu menemukan dan mengetuk balok tertinggi (Kelas Modus) pada grafik di bawah?')
    }
  }, [step, medianClassIndex, totalN, meanVal])

  function handleBarClick(index: number) {
    if (step === 1) {
      setHighlightedIndex(index)
      setActiveLabel(`Kelas ${INTERVALS[index].label} cm memiliki frekuensi ${frequencies[index]} siswa.`)
    } else if (step === 4) {
      if (index === modalClassIndex) {
        setHighlightedIndex(index)
        setModalCheckPassed(true)
        setActiveLabel(`🎉 Benar sekali! Balok ${INTERVALS[index].label} adalah yang tertinggi (frekuensi: ${frequencies[index]}). Ini disebut KELAS MODUS.`)
      } else {
        setModalCheckPassed(false)
        setActiveLabel(`❌ Belum tepat. Balok ${INTERVALS[index].label} bukan yang tertinggi. Coba ketuk balok yang paling tinggi!`)
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Wizard Steps indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
          Progres Belajar: <strong style={{ color: '#22d3ee' }}>Langkah {step} dari 4</strong>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ width: '28px', height: '6px', borderRadius: '3px', background: s <= step ? '#22d3ee' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Main Grid: Left is simulated AR, Right is Narrative Guide */}
      <div className="grid-layout">
        
        {/* Left Side: 3D AR graph */}
        <ThreeDHistogram 
          frequencies={frequencies}
          highlightedIndex={highlightedIndex}
          onBarClick={handleBarClick}
          activeLabel={activeLabel}
        />

        {/* Right Side: Step narrative & guided card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '340px', justifyContent: 'space-between' }}>
          
          {/* STEP 1: WELCOME & INTRO */}
          {step === 1 && (
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee', letterSpacing: '1px' }}>LANGKAH 1: MENGENAL DATA</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 10px 0' }}>Bagaimana Data Kelompok Terbentuk? 📊</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
                Bayangkan kamu mengukur tinggi badan dari <strong>{totalN} teman sekelasmu</strong>. Untuk mempermudah, data dikelompokkan ke dalam 5 baris/balok tinggi badan.
              </p>
              <div style={{ marginTop: '16px', background: 'rgba(34,211,238,0.04)', border: '1px dashed rgba(34,211,238,0.25)', padding: '14px', borderRadius: '12px', fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>👉</span>
                <span style={{ color: '#22d3ee', fontWeight: 600 }}>Coba ketuk beberapa balok 3D di sebelah kiri untuk melihat sebaran tinggi badan teman-temanmu secara langsung!</span>
              </div>
            </div>
          )}

          {/* STEP 2: MEAN */}
          {step === 2 && (
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee', letterSpacing: '1px' }}>LANGKAH 2: RATA-RATA (MEAN)</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 10px 0' }}>Mencari Titik Tengah Keseimbangan ⚖️</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Rata-rata (*Mean*) adalah nilai tunggal yang mewakili titik pusat keseimbangan dari seluruh tinggi badan siswa.
              </p>

              {/* Scaffolding explanation card */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px', color: '#fff' }}>Panduan Langkah Perhitungan:</strong>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>1. Kalikan (Tinggi Tengah × Jumlah Siswa):</span>
                    <strong style={{ color: '#60a5fa' }}>Σ(x_i × f_i) = {sumFX}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>2. Bagi dengan Total Siswa:</span>
                    <strong style={{ color: '#22d3ee' }}>N = {totalN}</strong>
                  </div>
                </div>

                <div className="formula-card" style={{ borderLeftColor: '#22d3ee', background: 'rgba(34,211,238,0.03)', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Rumus Mean:</div>
                  <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, margin: '2px 0' }}>
                    Mean = {sumFX} / {totalN} = <span style={{ color: '#22d3ee' }}>{meanVal.toFixed(2)} cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDIAN */}
          {step === 3 && (
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee', letterSpacing: '1px' }}>LANGKAH 3: NILAI TENGAH (MEDIAN)</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 10px 0' }}>Membagi Data Tepat di Tengah 🎯</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                Jika semua {totalN} siswa berbaris rapi dari yang terpendek ke tertinggi, **Median** adalah tinggi siswa yang berdiri tepat di posisi tengah (antrean ke-{targetHalfN}).
              </p>

              {/* Scaffolding Color matching */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>📍 Letak antrean tengah:</span> {totalN} / 2 = <strong>{targetHalfN}</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>📌 Kelas Median (Disorot Cyan):</span> Kelas <strong>{medClass.label} cm</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>📏 Hasil perhitungan median:</span>
                  <span style={{ color: '#22d3ee', fontWeight: 700, marginLeft: '6px' }}>{medianVal.toFixed(2)} cm</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MODUS */}
          {step === 4 && (
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee', letterSpacing: '1px' }}>LANGKAH 4: NILAI PALING SERING (MODUS)</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 10px 0' }}>Mendeteksi Puncak Kerumunan ⛰️</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                **Modus** adalah kelompok tinggi badan yang paling banyak dimiliki oleh siswa. Pada grafik 3D AR di samping, ini ditunjukkan oleh balok yang **paling tinggi**.
              </p>

              {/* Interactive confirmation */}
              {modalCheckPassed === null ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '14px', borderRadius: '12px', fontSize: '13px', textAlign: 'center' }}>
                  👆 Ketuk balok paling tinggi di sebelah kiri!
                </div>
              ) : modalCheckPassed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                    Hebat! Modus berada di kelas {modClass.label} cm.
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.45 }}>
                    Hasil rumus Modus: <strong>{modusVal.toFixed(2)} cm</strong>.
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '13px' }}>
                  Coba lagi, cari balok dengan frekuensi siswa tertinggi (paling menjulang).
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              disabled={step === 1}
              onClick={() => setStep(prev => prev - 1)}
              style={{ flex: 1, padding: '12px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: step === 1 ? 'rgba(255,255,255,0.2)' : '#fff', fontWeight: 700, fontSize: '13px', cursor: step === 1 ? 'not-allowed' : 'pointer' }}
            >
              Kembali
            </button>
            
            {step < 4 ? (
              <button 
                onClick={() => setStep(prev => prev + 1)}
                style={{ flex: 1, padding: '12px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(33, 150, 243, 0.25)' }}
              >
                Langkah Selanjutnya →
              </button>
            ) : (
              <button 
                disabled={!modalCheckPassed}
                onClick={() => router.push('/siswa')}
                style={{ flex: 1, padding: '12px 18px', borderRadius: '10px', border: 'none', background: modalCheckPassed ? 'linear-gradient(90deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)', color: modalCheckPassed ? '#fff' : 'rgba(255,255,255,0.25)', fontWeight: 700, fontSize: '13px', cursor: modalCheckPassed ? 'pointer' : 'not-allowed', boxShadow: modalCheckPassed ? '0 4px 15px rgba(16, 185, 129, 0.25)' : 'none' }}
              >
                Selesaikan Belajar 🏁
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
