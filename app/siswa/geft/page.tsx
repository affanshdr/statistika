'use client'

import { useEffect, useState, memo } from 'react'
import { useRouter } from 'next/navigation'

// ── Tipe data ──────────────────────────────────────────────────────────────
type Question = {
  id: number
  section: 1 | 2 | 3
  no: number
  targetShape: string
}

const QUESTIONS: Question[] = [
  // Sesi 1 — latihan (tidak dihitung)
  { id: 1,  section: 1, no: 1, targetShape: 'B' },
  { id: 2,  section: 1, no: 2, targetShape: 'G' },
  // Sesi 2 — dinilai
  { id: 3,  section: 2, no: 1, targetShape: 'G' },
  { id: 4,  section: 2, no: 2, targetShape: 'A' },
  { id: 5,  section: 2, no: 3, targetShape: 'G' },
  { id: 6,  section: 2, no: 4, targetShape: 'E' },
  // Sesi 3 — dinilai
  { id: 7,  section: 3, no: 1, targetShape: 'F' },
  { id: 8,  section: 3, no: 2, targetShape: 'G' },
  { id: 9,  section: 3, no: 3, targetShape: 'C' },
  { id: 10, section: 3, no: 4, targetShape: 'E' },
]

const SECTION_LABELS: Record<number, string> = { 1: 'Sesi 1 (Latihan)', 2: 'Sesi 2', 3: 'Sesi 3' }
const SECTION_TIME: Record<number, number> = { 1: 180, 2: 180, 3: 180 }

// ── Memoized SVG Viewer ───────────────────────────────────────────────────
type SvgViewerProps = {
  svgContent: string
  selected: Set<string>
  onSvgClick: (e: React.MouseEvent<HTMLDivElement>) => void
}

const GeftSvgViewer = memo(function GeftSvgViewer({ svgContent, selected, onSvgClick }: SvgViewerProps) {
  useEffect(() => {
    if (!svgContent) return
    const lines = document.querySelectorAll('.geft-svg-container line, .geft-svg-container path')
    lines.forEach(line => {
      const lineId = line.getAttribute('id')
      if (lineId) {
        if (selected.has(lineId)) {
          line.classList.add('selected')
        } else {
          line.classList.remove('selected')
        }
      }
    })
  }, [svgContent, selected])

  return (
    <div 
      className="geft-svg-container"
      dangerouslySetInnerHTML={{ __html: svgContent }} 
      onClick={onSvgClick}
      style={{ 
        position: 'relative', 
        borderRadius: 12, 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.1)', 
        background: '#0a1428', 
        touchAction: 'none' 
      }}
    />
  )
}, (prev, next) => {
  // Hanya re-render jika svgContent berubah atau set selected berubah
  if (prev.svgContent !== next.svgContent) return false
  if (prev.selected.size !== next.selected.size) return false
  for (const id of prev.selected) {
    if (!next.selected.has(id)) return false
  }
  return true
})

// ── Komponen utama ─────────────────────────────────────────────────────────
export default function GeftPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [svgContent, setSvgContent] = useState<string>('')
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [feedback, setFeedback] = useState<{ msg: string; type: 'correct' | 'wrong' | '' }>({ msg: '', type: '' })
  const [timeLeft, setTimeLeft] = useState(180)
  const [submitting, setSubmitting] = useState(false)
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro')

  const q = QUESTIONS[qIndex]

  // ── Auth check ─────────────────────────────────────────────────────────
  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data)
    if (s.geftStatus === 'completed') { router.push('/siswa'); return }
    setStudentId(s.id)
  }, [router])

  // ── Load SVG content for the current question ───────────────────────────
  useEffect(() => {
    if (phase !== 'test') return
    setSvgContent('')
    setSelected(new Set())
    setFeedback({ msg: '', type: '' })

    const url = `/geft/sesi${q.section}-soal${q.no}.svg`
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat gambar soal')
        return res.text()
      })
      .then(text => setSvgContent(text))
      .catch(err => console.error(err))
  }, [qIndex, q.section, q.no, phase])

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'test') return
    setTimeLeft(SECTION_TIME[q.section])
  }, [qIndex, phase, q.section])

  useEffect(() => {
    if (phase !== 'test') return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleNext(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [qIndex, phase])

  // ── Handle Line Clicks on the SVG ────────────────────────────────────────
  function handleSvgClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as SVGElement
    const tagName = target.tagName.toLowerCase()
    if (tagName === 'line' || tagName === 'path') {
      const lineId = target.getAttribute('id')
      if (!lineId) return

      setSelected(prev => {
        const next = new Set(prev)
        next.has(lineId) ? next.delete(lineId) : next.add(lineId)
        return next
      })
      setFeedback({ msg: '', type: '' })
    }
  }

  // ── Reset current question selection ─────────────────────────────────────
  function handleClearSelection() {
    setSelected(new Set())
    setFeedback({ msg: '', type: '' })
  }

  // ── Answer validation ────────────────────────────────────────────────────
  function checkAnswer(): boolean {
    const correctElements = document.querySelectorAll('.geft-svg-container [data-correct="true"]')
    const correctIds = new Set(
      Array.from(correctElements)
        .map(el => el.getAttribute('id'))
        .filter(Boolean) as string[]
    )

    if (correctIds.size === 0) return false
    if (selected.size !== correctIds.size) return false

    for (const id of selected) {
      if (!correctIds.has(id)) return false
    }
    return true
  }

  function handleConfirm() {
    if (selected.size === 0) {
      setFeedback({ msg: 'Pilih setidaknya satu garis dulu.', type: 'wrong' })
      return
    }
    const correct = checkAnswer()
    setFeedback({
      msg: correct ? 'Benar! Bentuk ditemukan dengan tepat.' : 'Belum tepat, tapi jawaban disimpan.',
      type: correct ? 'correct' : 'wrong'
    })
    
    setAnswers(prev => ({ ...prev, [q.id]: correct }))
    setTimeout(() => handleNext(false), 1200)
  }

  function handleNext(timeout = false) {
    if (timeout) setAnswers(prev => ({ ...prev, [q.id]: false }))

    const nextIndex = qIndex + 1
    if (nextIndex >= QUESTIONS.length) {
      finishTest()
      return
    }

    const nextQ = QUESTIONS[nextIndex]
    if (nextQ.section !== q.section) {
      setPhase('intro')
    } else {
      setPhase('test')
    }

    setQIndex(nextIndex)
    setSelected(new Set())
    setFeedback({ msg: '', type: '' })
  }

  async function finishTest() {
    setPhase('done')
    setSubmitting(true)

    const scoredQuestions = QUESTIONS.filter(q => q.section !== 1)
    const score = scoredQuestions.reduce((acc, q) => acc + (answers[q.id] ? 1 : 0), 0)

    try {
      const res = await fetch('/api/geft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, score, totalQuestions: scoredQuestions.length }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error); return }

      const stored = JSON.parse(localStorage.getItem('student')!)
      localStorage.setItem('student', JSON.stringify({ 
        ...stored, 
        geftStatus: 'completed',
        geftResult: { cognitiveStyle: data.cognitiveStyle, score: data.score }
      }))
      setTimeout(() => router.push('/siswa'), 2000)
    } catch {
      alert('Gagal menyimpan hasil.')
    } finally {
      setSubmitting(false)
    }
  }

  const timerStr = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
  const timerColor = timeLeft <= 30 ? '#e53935' : '#fff'

  // ── Navbar Component Shared across states ──────────────────────────────
  const renderNavbar = (titleSuffix: string) => (
    <header className="geft-navbar">
      <div style={{
        maxWidth: '1040px', margin: '0 auto',
        padding: '16px 20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔬</span>
          <span style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px',
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>AR-COGNISTATS</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
          {titleSuffix}
        </span>
      </div>
    </header>
  )

  if (phase === 'intro') {
    const isFirst = qIndex === 0
    const nextSection = QUESTIONS[qIndex].section
    return (
      <main className="geft-page-container">
        {renderNavbar("GEFT COGNITIVE ASSESSMENT ⏱️")}
        
        <div style={{ maxWidth: '600px', margin: '80px auto 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '36px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: 16, fontSize: '24px', fontWeight: 800 }}>
            {isFirst ? 'Selamat datang di Tes GEFT' : `Mulai ${SECTION_LABELS[nextSection]}`}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '14px', margin: '0 0 12px 0' }}>
            {isFirst
              ? 'Tes ini terdiri dari 3 sesi. Sesi 1 adalah latihan dan tidak dihitung. Sesi 2 dan 3 dihitung untuk menentukan gaya kognitif kamu.'
              : nextSection === 2
                ? 'Sesi latihan selesai. Sekarang dimulai sesi yang dinilai. Temukan bentuk sederhana yang tersembunyi di setiap gambar.'
                : 'Sesi 2 selesai. Satu sesi lagi!'
            }
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '28px', lineHeight: 1.5 }}>
            💡 Caranya: Klik garis-garis pada gambar teka-teki yang membentuk bentuk sederhana yang diminta. Batas waktu pengerjaan: 3 menit per soal.
          </p>
          <button
            onClick={() => setPhase('test')}
            style={{ 
              padding: '14px 32px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', 
              color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
            }}
          >
            {isFirst ? 'Mulai Latihan →' : `Mulai ${SECTION_LABELS[nextSection]} →`}
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    return (
      <main className="geft-page-container">
        {renderNavbar("GEFT COGNITIVE ASSESSMENT ⏱️")}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: '80px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12, fontSize: '28px', fontWeight: 800 }}>Tes selesai! 🎉</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>{submitting ? 'Menyimpan hasil tes...' : 'Mengarahkan ke halaman utama...'}</p>
          </div>
        </div>
      </main>
    )
  }

  const totalQ = QUESTIONS.length
  const progress = Math.round(((qIndex + 1) / totalQ) * 100)

  return (
    <main className="geft-page-container">
      <style>{`
        .geft-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #030712 0%, #080f25 50%, #020617 100%);
          color: #f3f4f6;
          font-family: var(--font-sans), sans-serif;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        
        header.geft-navbar {
          background: rgba(3, 7, 18, 0.65);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin: -24px -20px 24px -20px;
        }

        .geft-workspace {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 24px;
          max-width: 1040px;
          margin: 0 auto;
          width: 100%;
          align-items: start;
        }

        .geft-side-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 18px;
          padding: 24px;
        }

        .geft-main-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .geft-svg-container svg {
          display: block;
          width: 100%;
          height: auto;
          max-height: 480px;
        }

        .geft-svg-container svg line, .geft-svg-container svg path {
          cursor: pointer;
          stroke: #666;
          stroke-width: 3.5px;
          transition: stroke 0.15s, stroke-width 0.15s;
        }
        .geft-svg-container svg line.selected, .geft-svg-container svg path.selected {
          stroke: #2196f3 !important;
          stroke-width: 6px !important;
        }
        .geft-svg-container svg line:hover, .geft-svg-container svg path:hover {
          stroke: #42a5f5;
          stroke-width: 5px;
          opacity: 0.95;
        }
        
        .geft-btn-primary {
          padding: 12px 28px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
          transition: all 0.2s;
          text-align: center;
        }
        .geft-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.45);
        }
        
        .geft-btn-secondary {
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,80,80,0.5);
          background: rgba(255,80,80,0.08);
          color: #ff8080;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .geft-btn-secondary:hover {
          background: rgba(255,80,80,0.15);
        }

        .geft-btn-text {
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .geft-btn-text:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        @media (max-width: 800px) {
          .geft-page-container {
            padding: 8px 12px;
            height: 100dvh;
            min-height: auto;
            overflow: hidden;
          }
          
          header.geft-navbar {
            margin: -8px -12px 10px -12px !important;
          }
          header.geft-navbar > div {
            padding: 8px 12px !important;
          }

          .geft-progress-container {
            margin: 0 auto 8px !important;
            height: 3px !important;
          }

          .geft-workspace {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-height: 0;
            width: 100%;
          }
          
          .geft-side-panel, .geft-main-panel {
            display: contents;
          }

          .geft-meta-header {
            order: 1;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
          }

          .geft-target-card {
            order: 2;
            padding: 6px 12px !important;
            gap: 12px !important;
            border-radius: 12px !important;
            background: rgba(255, 255, 255, 0.02) !important;
            width: 100%;
            box-sizing: border-box;
          }

          .geft-target-card .geft-target-img-container {
            padding: 4px !important;
            border-radius: 8px !important;
          }

          .geft-target-card .geft-target-img-container > div {
            width: 36px !important;
            height: 36px !important;
            border-radius: 6px !important;
          }

          .geft-target-card .geft-target-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .geft-target-card .geft-target-desc,
          .geft-target-card .geft-target-info > div:first-child {
            display: none !important;
          }

          .geft-target-card .geft-target-info > div:nth-child(2) {
            font-size: 14px !important;
            margin-bottom: 0 !important;
          }

          .geft-svg-area {
            order: 3;
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          .geft-svg-instruction {
            display: none !important;
          }

          .geft-svg-container {
            flex: 1;
            display: flex !important;
            align-items: center;
            justify-content: center;
            min-height: 0;
            height: 100%;
            width: 100%;
          }

          .geft-svg-container svg {
            max-height: 100% !important;
            width: auto !important;
            height: 100% !important;
            aspect-ratio: 1 / 1;
            margin: 0 auto;
          }

          .geft-actions-area {
            order: 4;
            gap: 8px !important;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 8px 12px;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .geft-buttons-row {
            gap: 8px !important;
          }

          .geft-btn-primary, .geft-btn-secondary, .geft-btn-text {
            padding: 10px 14px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }
          
          .geft-feedback {
            padding: 6px 12px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      {renderNavbar("GEFT COGNITIVE ASSESSMENT ⏱️")}

      {/* Progress */}
      <div className="geft-progress-container" style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 20, maxWidth: 1040, margin: '0 auto 20px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: 3, transition: 'width 0.3s' }} />
      </div>

      <div className="geft-workspace">
        {/* Panel Kiri: Informasi, Bentuk Target, dan Aksi */}
        <div className="geft-side-panel">
          {/* Header */}
          <div className="geft-meta-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', padding: '5px 12px', borderRadius: 8 }}>
              {SECTION_LABELS[q.section]}
            </span>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              Soal <strong style={{ color: '#fff' }}>{qIndex + 1}</strong> dari <strong style={{ color: '#fff' }}>{totalQ}</strong>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: timerColor, fontFamily: 'monospace' }}>⏱️ {timerStr}</span>
          </div>

          {/* Referensi bentuk */}
          <div className="geft-target-card" style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="geft-target-img-container" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px', background: '#0a1428', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <img src={`/geft/shape-${q.targetShape}.svg`} alt={q.targetShape} style={{ maxWidth: '90%', maxHeight: '90%', filter: 'invert(1)' }} />
              </div>
            </div>
            <div className="geft-target-info">
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 4 }}>BENTUK TARGET</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Pola {q.targetShape}</div>
              </div>
              <div className="geft-target-desc" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Temukan bentuk ini secara persis di dalam gambar teka-teki.
              </div>
            </div>
          </div>

          {/* Status Pemilihan & Tombol Aksi */}
          <div className="geft-actions-area">
            {/* Status Pemilihan */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected.size > 0 ? '#10b981' : '#f59e0b' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {selected.size} garis dipilih
              </span>
            </div>

            {/* Tombol Aksi */}
            <div className="geft-buttons-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="geft-btn-primary" onClick={handleConfirm}>
                Submit Jawaban
              </button>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button className="geft-btn-secondary" style={{ flex: 1 }} onClick={handleClearSelection}>
                  Reset Jawaban
                </button>
                {q.section === 1 && (
                  <button className="geft-btn-text" style={{ flex: 1 }} onClick={() => handleNext()}>
                    Lewati
                  </button>
                )}
              </div>
            </div>

            {/* Feedback */}
            {feedback.type && (
              <div className="geft-feedback" style={{
                padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: feedback.type === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${feedback.type === 'correct' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                color: feedback.type === 'correct' ? '#34d399' : '#f87171',
              }}>
                {feedback.msg}
              </div>
            )}
          </div>
        </div>

        {/* Panel Kanan: Canvas SVG */}
        <div className="geft-main-panel">
          <div className="geft-svg-area" style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', height: '100%' }}>
            <div className="geft-svg-instruction" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', paddingLeft: 4 }}>
              KLIK PADA GARIS GAMBAR DI BAWAH UNTUK MEMILIH:
            </div>
            <GeftSvgViewer 
              svgContent={svgContent}
              selected={selected}
              onSvgClick={handleSvgClick}
            />
          </div>
        </div>
      </div>
    </main>
  )
}