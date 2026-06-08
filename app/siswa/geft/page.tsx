'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Tipe data ──────────────────────────────────────────────────────────────
type Line = { x1: number; y1: number; x2: number; y2: number }
type Question = {
  id: number
  section: 1 | 2 | 3
  targetShape: string
  refSvgPath: string
  lines: Line[]
  answerLineIds: number[]
}

// ── Helper: jarak titik ke segmen garis ───────────────────────────────────
function ptLineDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(px - x1, py - y1)
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

// ── Bentuk referensi (SVG path string) ────────────────────────────────────
const SHAPES: Record<string, string> = {
  A: 'M34,8 L8,52 L60,52 Z',
  B: 'M8,22 L60,22 L60,52 L8,52 Z M8,22 L34,8 L60,22',
  C: 'M8,8 L60,8 L60,52 L8,52 Z M8,30 L60,30',
  D: 'M8,8 L52,8 L60,30 L52,52 L8,52 Z',
  E: 'M8,8 L60,8 L60,52 L8,52 Z M8,8 L60,52 M60,8 L8,52',
  F: 'M34,8 L60,52 L8,52 Z M8,30 L60,30',
  G: 'M8,30 L34,8 L60,30 L34,52 Z',
  H: 'M8,8 L60,8 L60,52 L8,52 Z M8,8 L8,52 M34,8 L34,52',
}

// ── Data soal (Sesi 1: latihan, Sesi 2-3: dinilai) ────────────────────────
// Catatan: garis & answerLineIds nanti diganti dengan data asli per soal.
// Untuk sekarang semua soal pakai canvas yang sama sebagai placeholder
// sampai gambar asli dari PDF di-redraw satu per satu.
const BASE_LINES: Line[] = [
  { x1: 60,  y1: 50,  x2: 580, y2: 50  },
  { x1: 60,  y1: 310, x2: 580, y2: 310 },
  { x1: 60,  y1: 50,  x2: 60,  y2: 310 },
  { x1: 580, y1: 50,  x2: 580, y2: 310 },
  { x1: 60,  y1: 50,  x2: 320, y2: 15  },
  { x1: 580, y1: 50,  x2: 320, y2: 15  },
  { x1: 60,  y1: 310, x2: 180, y2: 360 },
  { x1: 580, y1: 310, x2: 460, y2: 360 },
  { x1: 140, y1: 90,  x2: 500, y2: 90  },
  { x1: 140, y1: 230, x2: 500, y2: 230 },
  { x1: 140, y1: 90,  x2: 140, y2: 230 },
  { x1: 500, y1: 90,  x2: 500, y2: 230 },
  { x1: 140, y1: 90,  x2: 320, y2: 50  },
  { x1: 500, y1: 90,  x2: 320, y2: 50  },
  { x1: 180, y1: 90,  x2: 180, y2: 230 },
  { x1: 220, y1: 90,  x2: 220, y2: 230 },
  { x1: 320, y1: 90,  x2: 320, y2: 230 },
  { x1: 420, y1: 90,  x2: 420, y2: 230 },
  { x1: 460, y1: 90,  x2: 460, y2: 230 },
  { x1: 60,  y1: 170, x2: 580, y2: 170 },
  { x1: 60,  y1: 50,  x2: 140, y2: 90  },
  { x1: 580, y1: 50,  x2: 500, y2: 90  },
  { x1: 60,  y1: 310, x2: 140, y2: 230 },
  { x1: 580, y1: 310, x2: 500, y2: 230 },
  { x1: 140, y1: 230, x2: 80,  y2: 160 },
  { x1: 500, y1: 230, x2: 560, y2: 160 },
  { x1: 80,  y1: 160, x2: 180, y2: 200 },
  { x1: 560, y1: 160, x2: 460, y2: 200 },
  { x1: 180, y1: 200, x2: 460, y2: 200 },
  { x1: 180, y1: 200, x2: 180, y2: 310 },
  { x1: 460, y1: 200, x2: 460, y2: 310 },
  { x1: 180, y1: 310, x2: 460, y2: 310 },
  { x1: 220, y1: 150, x2: 420, y2: 150 },
  { x1: 270, y1: 50,  x2: 270, y2: 200 },
  { x1: 370, y1: 50,  x2: 370, y2: 200 },
  { x1: 220, y1: 130, x2: 420, y2: 130 },
  { x1: 180, y1: 230, x2: 220, y2: 360 },
  { x1: 460, y1: 230, x2: 420, y2: 360 },
]

const QUESTIONS: Question[] = [
  
  // Sesi 1 — latihan (tidak dihitung)
  { id: 1,  section: 1, targetShape: 'B', refSvgPath: SHAPES.B, lines: BASE_LINES, answerLineIds: [8,9,10,11,12,13] },
  { id: 2,  section: 1, targetShape: 'G', refSvgPath: SHAPES.G, lines: BASE_LINES, answerLineIds: [8,9,10,11] },
  { id: 3,  section: 1, targetShape: 'D', refSvgPath: SHAPES.D, lines: BASE_LINES, answerLineIds: [0,1,2,3] },
  { id: 4,  section: 1, targetShape: 'E', refSvgPath: SHAPES.E, lines: BASE_LINES, answerLineIds: [0,1,2,3,4,5] },
  { id: 5,  section: 1, targetShape: 'C', refSvgPath: SHAPES.C, lines: BASE_LINES, answerLineIds: [0,1,2,3,19] },
  { id: 6,  section: 1, targetShape: 'F', refSvgPath: SHAPES.F, lines: BASE_LINES, answerLineIds: [4,5,6,7,19] },
  { id: 7,  section: 1, targetShape: 'A', refSvgPath: SHAPES.A, lines: BASE_LINES, answerLineIds: [4,5,19] },
  // Sesi 2 — dinilai
  { id: 8,  section: 2, targetShape: 'G', refSvgPath: SHAPES.G, lines: BASE_LINES, answerLineIds: [8,9,10,11] },
  { id: 9,  section: 2, targetShape: 'A', refSvgPath: SHAPES.A, lines: BASE_LINES, answerLineIds: [4,5,19] },
  { id: 10, section: 2, targetShape: 'G', refSvgPath: SHAPES.G, lines: BASE_LINES, answerLineIds: [8,9,10,11] },
  { id: 11, section: 2, targetShape: 'E', refSvgPath: SHAPES.E, lines: BASE_LINES, answerLineIds: [0,1,2,3,4,5] },
  { id: 12, section: 2, targetShape: 'B', refSvgPath: SHAPES.B, lines: BASE_LINES, answerLineIds: [8,9,10,11,12,13] },
  { id: 13, section: 2, targetShape: 'C', refSvgPath: SHAPES.C, lines: BASE_LINES, answerLineIds: [0,1,2,3,19] },
  { id: 14, section: 2, targetShape: 'E', refSvgPath: SHAPES.E, lines: BASE_LINES, answerLineIds: [0,1,2,3,4,5] },
  { id: 15, section: 2, targetShape: 'D', refSvgPath: SHAPES.D, lines: BASE_LINES, answerLineIds: [0,1,2,3] },
  { id: 16, section: 2, targetShape: 'H', refSvgPath: SHAPES.H, lines: BASE_LINES, answerLineIds: [0,1,2,3,16] },
  // Sesi 3 — dinilai
  { id: 17, section: 3, targetShape: 'F', refSvgPath: SHAPES.F, lines: BASE_LINES, answerLineIds: [4,5,6,7,19] },
  { id: 18, section: 3, targetShape: 'G', refSvgPath: SHAPES.G, lines: BASE_LINES, answerLineIds: [8,9,10,11] },
  { id: 19, section: 3, targetShape: 'C', refSvgPath: SHAPES.C, lines: BASE_LINES, answerLineIds: [0,1,2,3,19] },
  { id: 20, section: 3, targetShape: 'E', refSvgPath: SHAPES.E, lines: BASE_LINES, answerLineIds: [0,1,2,3,4,5] },
  { id: 21, section: 3, targetShape: 'B', refSvgPath: SHAPES.B, lines: BASE_LINES, answerLineIds: [8,9,10,11,12,13] },
  { id: 22, section: 3, targetShape: 'E', refSvgPath: SHAPES.E, lines: BASE_LINES, answerLineIds: [0,1,2,3,4,5] },
  { id: 23, section: 3, targetShape: 'A', refSvgPath: SHAPES.A, lines: BASE_LINES, answerLineIds: [4,5,19] },
  { id: 24, section: 3, targetShape: 'C', refSvgPath: SHAPES.C, lines: BASE_LINES, answerLineIds: [0,1,2,3,19] },
  { id: 25, section: 3, targetShape: 'A', refSvgPath: SHAPES.A, lines: BASE_LINES, answerLineIds: [4,5,19] },
]

const SECTION_LABELS: Record<number, string> = { 1: 'Sesi 1 (Latihan)', 2: 'Sesi 2', 3: 'Sesi 3' }
const SECTION_TIME: Record<number, number> = { 1: 180, 2: 180, 3: 180 }

// ── Komponen utama ─────────────────────────────────────────────────────────
export default function GeftPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [hovered, setHovered] = useState(-1)
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

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'test') return
    setTimeLeft(SECTION_TIME[q.section])
  }, [qIndex, phase])

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

  // ── Canvas render ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 640, 370)

    for (let i = 0; i < q.lines.length; i++) {
      const l = q.lines[i]
      const isSel = selected.has(i)
      const isHov = hovered === i
      ctx.beginPath()
      ctx.moveTo(l.x1, l.y1)
      ctx.lineTo(l.x2, l.y2)
      ctx.lineCap = 'round'
      if (isSel) {
        ctx.strokeStyle = '#1976d2'
        ctx.lineWidth = 3.5
      } else if (isHov) {
        ctx.strokeStyle = 'rgba(25,118,210,0.45)'
        ctx.lineWidth = 4
      } else {
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1.3
      }
      ctx.stroke()
    }
  }, [q, selected, hovered])

  // ── Input helpers ────────────────────────────────────────────────────────
  function getScaledPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const r = canvas.getBoundingClientRect()
    const sx = 640 / r.width, sy = 370 / r.height
    if ('touches' in e) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy }
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy }
  }

  function findClosest(px: number, py: number) {
    let best = -1, bestD = Infinity
    for (let i = 0; i < q.lines.length; i++) {
      const l = q.lines[i]
      const d = ptLineDist(px, py, l.x1, l.y1, l.x2, l.y2)
      if (d < bestD) { bestD = d; best = i }
    }
    return bestD < 12 ? best : -1
  }

  function handleMouseMove(e: React.MouseEvent) {
    const p = getScaledPos(e)
    setHovered(findClosest(p.x, p.y))
  }

  function handleClick(e: React.MouseEvent) {
    const p = getScaledPos(e)
    const h = findClosest(p.x, p.y)
    if (h < 0) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(h) ? next.delete(h) : next.add(h)
      return next
    })
    setFeedback({ msg: '', type: '' })
  }

  function handleTouch(e: React.TouchEvent) {
    e.preventDefault()
    const p = getScaledPos(e)
    const h = findClosest(p.x, p.y)
    if (h < 0) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(h) ? next.delete(h) : next.add(h)
      return next
    })
  }

  // ── Logika soal ──────────────────────────────────────────────────────────
  function checkAnswer(): boolean {
    const answerSet = new Set(q.answerLineIds)
    for (const i of selected) { if (!answerSet.has(i)) return false }
    for (const i of answerSet) { if (!selected.has(i)) return false }
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
    // Simpan jawaban lalu lanjut setelah delay singkat
    setAnswers(prev => ({ ...prev, [q.id]: correct }))
    setTimeout(() => handleNext(false, correct), 1200)
  }

  function handleNext(timeout = false, lastCorrect?: boolean) {
    // Kalau timeout, tandai salah
    if (timeout) setAnswers(prev => ({ ...prev, [q.id]: false }))

    const nextIndex = qIndex + 1
    if (nextIndex >= QUESTIONS.length) {
      finishTest()
      return
    }

    // Jeda antar sesi
    const nextQ = QUESTIONS[nextIndex]
    if (nextQ.section !== q.section) {
      setPhase('intro')
    }

    setQIndex(nextIndex)
    setSelected(new Set())
    setHovered(-1)
    setFeedback({ msg: '', type: '' })
    if (nextQ.section !== q.section) setPhase('intro')
    else setPhase('test')
  }

  async function finishTest() {
    setPhase('done')
    setSubmitting(true)

    // Hitung skor hanya dari sesi 2 & 3
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
      localStorage.setItem('student', JSON.stringify({ ...stored, geftStatus: 'completed' }))
      setTimeout(() => router.push('/siswa'), 2000)
    } catch {
      alert('Gagal menyimpan hasil.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Format timer ─────────────────────────────────────────────────────────
  const timerStr = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
  const timerColor = timeLeft <= 30 ? '#e53935' : '#fff'

  // ── UI ────────────────────────────────────────────────────────────────────
  const baseStyle: React.CSSProperties = {
    minHeight: '100vh', background: '#0f1b3d', color: '#fff',
    fontFamily: 'sans-serif', padding: '24px 20px',
  }

  if (phase === 'intro') {
    const isFirst = qIndex === 0
    const nextSection = QUESTIONS[qIndex].section
    return (
      <main style={baseStyle}>
        <h2 style={{ marginBottom: 12 }}>
          {isFirst ? 'Selamat datang di Tes GEFT' : `Mulai ${SECTION_LABELS[nextSection]}`}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 480, marginBottom: 8 }}>
          {isFirst
            ? 'Tes ini terdiri dari 3 sesi. Sesi 1 adalah latihan dan tidak dihitung. Sesi 2 dan 3 dihitung untuk menentukan gaya kognitif kamu.'
            : nextSection === 2
              ? 'Sesi latihan selesai. Sekarang dimulai sesi yang dinilai. Temukan bentuk sederhana yang tersembunyi di setiap gambar.'
              : 'Sesi 2 selesai. Satu sesi lagi!'
          }
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
          Klik garis yang membentuk bentuk sederhana di gambar. Waktu per soal: 3 menit.
        </p>
        <button
          onClick={() => setPhase('test')}
          style={{ padding: '12px 28px', borderRadius: 10, background: '#2196f3', color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer' }}
        >
          {isFirst ? 'Mulai Latihan →' : `Mulai ${SECTION_LABELS[nextSection]} →`}
        </button>
      </main>
    )
  }

  if (phase === 'done') {
    return (
      <main style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>Tes selesai! 🎉</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{submitting ? 'Menyimpan hasil...' : 'Mengarahkan ke halaman utama...'}</p>
        </div>
      </main>
    )
  }

  const totalQ = QUESTIONS.length
  const progress = Math.round(((qIndex + 1) / totalQ) * 100)

  return (
    <main style={baseStyle}>
      {/* Progress */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#2196f3', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: 6 }}>
          {SECTION_LABELS[q.section]} &mdash; Soal {qIndex + 1} / {totalQ}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: timerColor }}>{timerStr}</span>
      </div>

      {/* Referensi bentuk */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 1 }}>BENTUK</div>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <path d={q.refSvgPath} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}><strong>{q.targetShape}</strong></div>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, paddingTop: 6 }}>
          Temukan bentuk <strong style={{ color: '#fff' }}>{q.targetShape}</strong> yang tersembunyi.<br />
          Klik garis yang membentuknya. Klik lagi untuk membatalkan.
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0a1428', cursor: hovered >= 0 ? 'pointer' : 'default', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={640}
          height={370}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(-1)}
          onClick={handleClick}
          onTouchStart={handleTouch}
        />
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '8px 0 4px' }}>
        {selected.size} garis dipilih
      </p>

      {/* Tombol */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <button
          onClick={() => { setSelected(new Set()); setFeedback({ msg: '', type: '' }) }}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,80,80,0.4)', background: 'rgba(255,80,80,0.1)', color: '#ff8080', fontSize: 13, cursor: 'pointer' }}
        >
          Hapus pilihan
        </button>
        <button
          onClick={handleConfirm}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#2196f3', color: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          Konfirmasi →
        </button>
        {q.section === 1 && (
          <button
            onClick={() => handleNext()}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}
          >
            Lewati (latihan)
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback.type && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
          background: feedback.type === 'correct' ? 'rgba(0,200,100,0.15)' : 'rgba(255,80,80,0.12)',
          border: `1px solid ${feedback.type === 'correct' ? 'rgba(0,200,100,0.3)' : 'rgba(255,80,80,0.25)'}`,
          color: feedback.type === 'correct' ? '#4caf50' : '#ff7070',
        }}>
          {feedback.msg}
        </div>
      )}
    </main>
  )
}