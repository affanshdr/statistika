'use client'

import { useEffect, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'


// ── Tipe data ──────────────────────────────────────────────────────────────
type Question = {
  id: number
  section: 1 | 2 | 3
  no: number
  targetShape: string
}

// ── SVG Hit Detection Utilities ────────────────────────────────────────────
// Menghitung jarak terdekat dari titik (px, py) ke segmen garis (x1,y1)→(x2,y2)
function pointToSegmentDistance(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x2 - x1, dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - x1, py - y1)
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

// Mengkonversi koordinat layar (clientX/Y) ke koordinat SVG user-unit
function screenToSvgCoords(
  clientX: number, clientY: number,
  svg: SVGSVGElement
): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

const QUESTIONS: Question[] = [
  // Sesi 1 — latihan (tidak dihitung)
  { id: 1, section: 1, no: 1, targetShape: 'B' },
  { id: 2, section: 1, no: 2, targetShape: 'G' },
  { id: 11, section: 1, no: 3, targetShape: 'D' },
  // Sesi 2 — dinilai
  { id: 3, section: 2, no: 1, targetShape: 'G' },
  { id: 4, section: 2, no: 2, targetShape: 'A' },
  { id: 5, section: 2, no: 3, targetShape: 'D' },
  // Sesi 3 — dinilai
  { id: 7, section: 3, no: 1, targetShape: 'F' },
  { id: 8, section: 3, no: 2, targetShape: 'G' },
  { id: 9, section: 3, no: 3, targetShape: 'C' },
]

const SECTION_LABELS: Record<number, string> = { 1: 'Sesi 1 (Latihan)', 2: 'Sesi 2', 3: 'Sesi 3' }
const SECTION_TIME: Record<number, number> = { 1: 30, 2: 30, 3: 30 }

// ── Memoized SVG Viewer ───────────────────────────────────────────────────
type SvgViewerProps = {
  svgContent: string
  selected: Set<string>
  onSvgClick: (e: React.MouseEvent<HTMLDivElement>) => void
}

const GeftSvgViewer = memo(function GeftSvgViewer({ svgContent, selected, onSvgClick }: SvgViewerProps) {
  // Effect 1: Bersihkan hit-area lama jika ada (legacy cleanup)
  // Hit detection sekarang ditangani oleh custom algoritma jarak di handleSvgClick,
  // sehingga tidak perlu lagi membuat clone hit-area yang bisa tumpang-tindih.
  useEffect(() => {
    if (!svgContent) return
    const container = document.querySelector('.geft-svg-container')
    if (!container) return
    container.querySelectorAll('.hit-area').forEach(el => el.remove())
  }, [svgContent])

  // Effect 2: Update kelas 'selected' pada setiap perubahan selection
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
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0c0c14',
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
  const [showSkipModal, setShowSkipModal] = useState(false)

  // State untuk tutorial
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showAnswer1, setShowAnswer1] = useState(false)
  const [showAnswer2, setShowAnswer2] = useState(false)
  const [tutorialSelected, setTutorialSelected] = useState<Set<string>>(new Set())

  const q = QUESTIONS[qIndex]

  // Validasi latihan interaktif tutorial
  const isTutorialSuccess =
    tutorialSelected.has('line-1') &&
    tutorialSelected.has('line-2') &&
    tutorialSelected.has('line-3') &&
    tutorialSelected.size === 3

  function handleTutorialLineClick(lineId: string) {
    setTutorialSelected(prev => {
      const next = new Set(prev)
      next.has(lineId) ? next.delete(lineId) : next.add(lineId)
      return next
    })
  }

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

    const url = `/geft/sesi${q.section}-soal${q.no}.svg?v=${Date.now()}`
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

  // ── Handle Line Clicks on the SVG (Custom Distance-Based Hit Detection) ──
  // Pendekatan lama: mengandalkan pointer-events SVG → hit-area yang tumpang-tindih
  //   menyebabkan hanya 1 garis yang bisa diklik (yang paling atas di z-order).
  // Pendekatan baru: hitung jarak dari titik klik ke setiap garis, pilih yang terdekat.
  function handleSvgClick(e: React.MouseEvent<HTMLDivElement>) {
    const container = e.currentTarget
    const svg = container.querySelector('svg') as SVGSVGElement | null
    if (!svg) return

    const coords = screenToSvgCoords(e.clientX, e.clientY, svg)
    if (!coords) return

    // Toleransi maksimal: 24 SVG unit (~18px pada layar 375px dengan viewBox 400)
    const HIT_THRESHOLD = 24
    const EPSILON = 1.5 // Toleransi untuk menganggap jarak "sama" (mengatasi overlap/subpixel)
    let closestId: string | null = null
    let closestDist = Infinity
    let closestLength = Infinity

    // Cek semua elemen <line> yang punya id
    const lineEls = container.querySelectorAll<SVGElement>('line[id]:not(.hit-area)')
    lineEls.forEach(lineEl => {
      const id = lineEl.getAttribute('id')
      if (!id) return
      const x1 = parseFloat(lineEl.getAttribute('x1') ?? '0')
      const y1 = parseFloat(lineEl.getAttribute('y1') ?? '0')
      const x2 = parseFloat(lineEl.getAttribute('x2') ?? '0')
      const y2 = parseFloat(lineEl.getAttribute('y2') ?? '0')
      const dist = pointToSegmentDistance(coords.x, coords.y, x1, y1, x2, y2)
      const len = Math.hypot(x2 - x1, y2 - y1)

      if (dist <= HIT_THRESHOLD) {
        if (closestDist - dist > EPSILON) {
          // Jarak baru ini secara signifikan lebih dekat
          closestDist = dist
          closestLength = len
          closestId = id
        } else if (Math.abs(dist - closestDist) <= EPSILON) {
          // Jarak dianggap sama/hampir sama (overlap), pilih garis yang lebih pendek
          if (len < closestLength) {
            closestDist = Math.min(dist, closestDist)
            closestLength = len
            closestId = id
          }
        }
      }
    })

    // Cek semua elemen <path> yang punya id (sampling sepanjang path)
    const pathEls = container.querySelectorAll<SVGPathElement>('path[id]:not(.hit-area)')
    pathEls.forEach(pathEl => {
      const id = pathEl.getAttribute('id')
      if (!id) return
      try {
        const len = pathEl.getTotalLength()
        const steps = Math.max(20, Math.floor(len / 5))
        for (let i = 0; i <= steps; i++) {
          const pt = pathEl.getPointAtLength((i / steps) * len)
          const dist = Math.hypot(coords.x - pt.x, coords.y - pt.y)

          if (dist <= HIT_THRESHOLD) {
            if (closestDist - dist > EPSILON) {
              closestDist = dist
              closestLength = len
              closestId = id
            } else if (Math.abs(dist - closestDist) <= EPSILON) {
              if (len < closestLength) {
                closestDist = Math.min(dist, closestDist)
                closestLength = len
                closestId = id
              }
            }
          }
        }
      } catch { /* path tidak valid, lewati */ }
    })

    if (closestId) {
      setSelected(prev => {
        const next = new Set(prev)
        next.has(closestId!) ? next.delete(closestId!) : next.add(closestId!)
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
    // 1. Ambil solusi utama (data-correct="true")
    const correctElements1 = document.querySelectorAll('.geft-svg-container [data-correct="true"]')
    const correctIds1 = new Set(
      Array.from(correctElements1)
        .map(el => el.getAttribute('id'))
        .filter(Boolean) as string[]
    )

    // 2. Ambil solusi alternatif (data-correct-alt="true")
    const correctElements2 = document.querySelectorAll('.geft-svg-container [data-correct-alt="true"]')
    const correctIds2 = new Set(
      Array.from(correctElements2)
        .map(el => el.getAttribute('id'))
        .filter(Boolean) as string[]
    )

    // Cek kecocokan dengan Solusi 1
    let match1 = correctIds1.size > 0 && selected.size === correctIds1.size
    if (match1) {
      for (const id of selected) {
        if (!correctIds1.has(id)) {
          match1 = false
          break
        }
      }
    }

    // Cek kecocokan dengan Solusi 2
    let match2 = correctIds2.size > 0 && selected.size === correctIds2.size
    if (match2) {
      for (const id of selected) {
        if (!correctIds2.has(id)) {
          match2 = false
          break
        }
      }
    }

    return match1 || match2
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

    // Buat salinan answers terbaru (termasuk jawaban soal ini) untuk dikirim ke handleNext
    // agar tidak bergantung pada state React yang belum ter-flush
    const updatedAnswers = { ...answers, [q.id]: correct }
    setAnswers(updatedAnswers)
    setTimeout(() => handleNext(false, updatedAnswers), 1200)
  }

  function handleNext(timeout = false, latestAnswers?: Record<number, boolean>) {
    // Gunakan latestAnswers jika disediakan, agar jawaban soal terakhir selalu terhitung
    const answersSnapshot = latestAnswers ?? answers

    let timedOutAnswers = answersSnapshot
    if (timeout) {
      timedOutAnswers = { ...answersSnapshot, [q.id]: false }
      setAnswers(timedOutAnswers)
    }

    const nextIndex = qIndex + 1
    if (nextIndex >= QUESTIONS.length) {
      finishTest(timedOutAnswers)
      return
    }

    setPhase('test')

    setQIndex(nextIndex)
    setSelected(new Set())
    setFeedback({ msg: '', type: '' })
  }

  async function finishTest(finalAnswers?: Record<number, boolean>) {
    setPhase('done')
    setSubmitting(true)

    // Gunakan finalAnswers yang diteruskan secara eksplisit agar jawaban soal terakhir
    // selalu terhitung (mengatasi race condition setAnswers vs render React)
    const answersToScore = finalAnswers ?? answers
    const scoredQuestions = QUESTIONS.filter(q => q.section !== 1)
    const score = scoredQuestions.reduce((acc, q) => acc + (answersToScore[q.id] ? 1 : 0), 0)

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
      sessionStorage.setItem('show_cognitive_style_first_time', '1')
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
        padding: '12px 20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div
          onClick={() => {
            if (phase === 'test') {
              if (confirm("Apakah Anda yakin ingin keluar dari tes? Kemajuan Anda saat ini tidak akan disimpan.")) {
                router.push('/')
              }
            } else {
              router.push('/')
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <motion.div
            animate={{ filter: ['drop-shadow(0 0 6px #00FF88)', 'drop-shadow(0 0 14px #00FF88)', 'drop-shadow(0 0 6px #00FF88)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ fontSize: '24px', lineHeight: 1 }}
          >
            🕵️
          </motion.div>
          <div>
            <div style={{
              fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #00FF88, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-heading), sans-serif',
            }}>
              Skeptikos
            </div>
            <div className="nav-subtitle" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
              INVESTIGASI DATA
            </div>
          </div>
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

    if (isFirst && tutorialStep < 3) {
      return (
        <main className="geft-page-container">
          {renderNavbar("TUTORIAL TES DIAGNOSTIK (GEFT) 🔬")}
          <style>{`
            .geft-page-container {
              min-height: 100vh;
              background: #0A0A0F;
              background-image: linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
              background-size: 40px 40px;
              color: #f3f4f6;
              font-family: var(--font-sans), sans-serif;
              padding: 20px 16px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
            }
            .geft-navbar {
              position: sticky; top: 0; z-index: 50;
              background: rgba(10,10,15,0.85);
              backdrop-filter: blur(16px);
              border-bottom: 1px solid rgba(0,255,136,0.08);
            }
            .nav-subtitle { display: block; }
            @media (max-width: 480px) {
              .nav-subtitle { display: none; }
            }
            .geft-tutorial-modal {
              max-width: 660px;
              width: 100%;
              margin: 24px auto 16px;
              background: rgba(12, 12, 20, 0.95);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 22px;
              padding: 28px 28px 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.08);
              backdrop-filter: blur(20px);
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              gap: 18px;
            }
            @media (max-width: 600px) {
              .geft-tutorial-modal {
                margin: 8px auto 8px;
                padding: 18px 14px 14px;
                border-radius: 16px;
                gap: 14px;
                max-height: calc(100dvh - 70px);
                overflow-y: auto;
              }
            }
            .geft-tut-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .geft-tut-eyebrow {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #00FF88;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .geft-tut-title {
              font-size: 19px;
              font-weight: 800;
              background: linear-gradient(90deg, #00FF88, #06b6d4);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0;
            }
            @media (max-width: 480px) { .geft-tut-title { font-size: 16px; } }
            .geft-tut-progress-ring { flex-shrink: 0; }
            .geft-tut-progress-track {
              height: 3px;
              background: rgba(255,255,255,0.07);
              border-radius: 99px;
              overflow: hidden;
            }
            .geft-tut-progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #00FF88, #06b6d4);
              border-radius: 99px;
              transition: width 0.4s ease;
              box-shadow: 0 0 8px rgba(0,255,136,0.5);
            }
            .geft-tutorial-container {
              display: flex;
              flex-direction: column;
              gap: 14px;
            }
            .geft-tut-desc {
              color: rgba(255,255,255,0.82);
              font-size: 14px;
              line-height: 1.65;
              margin: 0;
            }
            .geft-tutorial-cols {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              align-items: stretch;
            }
            @media (max-width: 440px) {
              .geft-tutorial-cols { grid-template-columns: 1fr; gap: 10px; }
            }
            .geft-tutorial-box {
              background: rgba(255,255,255,0.025);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 12px;
              padding: 14px 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
              box-sizing: border-box;
            }
            .geft-tut-interactive-box {
              border-color: rgba(0,255,136,0.25);
              background: rgba(0,255,136,0.04);
            }
            .geft-tut-box-label {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1.5px;
              color: rgba(255,255,255,0.4);
              text-transform: uppercase;
            }
            .geft-tutorial-svg-wrapper {
              width: 110px;
              height: 110px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0c0c14;
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 10px;
              padding: 10px;
              box-sizing: border-box;
              flex-shrink: 0;
            }
            .geft-tutorial-svg-wrapper-lg {
              width: 130px;
              height: 130px;
            }
            @media (max-width: 600px) {
              .geft-tutorial-svg-wrapper { width: 95px; height: 95px; padding: 7px; }
              /* Interaktif box: ambil lebar penuh agar mudah diklik jari */
              .geft-tutorial-svg-wrapper-lg {
                width: 100%;
                height: 200px;
                padding: 12px;
              }
            }
            .geft-tut-found-badge {
              font-size: 11px; font-weight: 700;
              color: #34d399;
              background: rgba(16,185,129,0.12);
              border: 1px solid rgba(16,185,129,0.2);
              padding: 2px 10px; border-radius: 99px;
            }
            .geft-tut-card-badge {
              font-size: 9px; font-weight: 700;
              color: rgba(255,255,255,0.3);
              letter-spacing: 1px; text-transform: uppercase;
            }
            .geft-tut-reveal-btn {
              align-self: center;
              padding: 9px 20px;
              border-radius: 10px;
              border: 1px solid rgba(255,255,255,0.12);
              background: rgba(255,255,255,0.04);
              color: rgba(255,255,255,0.75);
              font-size: 13px; font-weight: 600;
              cursor: pointer; transition: all 0.2s;
              width: fit-content;
            }
            .geft-tut-reveal-btn:hover {
              background: rgba(255,255,255,0.08); color: #fff;
              transform: translateY(-1px);
            }
            .geft-tut-reveal-btn.active {
              border-color: rgba(0,255,136,0.5);
              background: rgba(0,255,136,0.08); color: #00FF88;
            }
            .geft-tut-tip {
              font-size: 12.5px; color: rgba(255,255,255,0.5);
              line-height: 1.55;
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(255,255,255,0.05);
              border-radius: 10px; padding: 10px 14px;
            }
            .geft-tut-sel-count {
              font-size: 11px; font-weight: 700;
              color: rgba(255,255,255,0.4); letter-spacing: 0.5px;
            }
            .geft-tut-actions-row {
              display: flex; align-items: center; gap: 10px;
            }
            .geft-tut-reset-btn {
              flex-shrink: 0; padding: 8px 14px; border-radius: 9px;
              border: 1px solid rgba(239,68,68,0.3);
              background: rgba(239,68,68,0.06); color: #f87171;
              font-size: 12px; font-weight: 600; cursor: pointer;
              transition: all 0.2s; white-space: nowrap;
            }
            .geft-tut-reset-btn:disabled { opacity: 0.3; cursor: not-allowed; }
            .geft-tut-reset-btn:not(:disabled):hover { background: rgba(239,68,68,0.12); }
            .geft-tut-feedback {
              flex: 1; font-size: 12.5px; font-weight: 500;
              padding: 8px 12px; border-radius: 9px;
              line-height: 1.45; transition: all 0.25s;
            }
            .geft-tut-feedback.idle {
              color: rgba(255,255,255,0.35);
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(255,255,255,0.05);
            }
            .geft-tut-feedback.hint {
              color: rgba(251,191,36,0.9);
              background: rgba(251,191,36,0.06);
              border: 1px solid rgba(251,191,36,0.15);
            }
            .geft-tut-feedback.success {
              color: #34d399;
              background: rgba(16,185,129,0.08);
              border: 1px solid rgba(16,185,129,0.2);
              font-weight: 600;
            }
            .geft-interactive-line {
              cursor: pointer; stroke: #555; stroke-width: 5px;
              fill: none; pointer-events: none; stroke-linecap: round;
              transition: stroke 0.15s, stroke-width 0.15s;
            }
            .geft-interactive-line:hover { stroke: #00FF88; stroke-width: 7px; }
            .geft-interactive-line.selected { stroke: #00FF88 !important; stroke-width: 8px !important; filter: drop-shadow(0 0 4px rgba(0,255,136,0.7)); }
            /* Hit-area transparan yang lebar — pointer-events ditarget ke sini */
            .geft-hit-area {
              stroke: transparent;
              stroke-width: 40px;
              fill: none;
              cursor: pointer;
              stroke-linecap: round;
            }
            @media (max-width: 600px) {
              .geft-interactive-line {
                stroke-width: 10px !important;
              }
              .geft-interactive-line.selected {
                stroke-width: 12px !important;
              }
              .geft-hit-area {
                stroke-width: 48px;
              }
            }
            .geft-tutorial-steps-nav {
              display: flex; align-items: center; padding-top: 14px;
              border-top: 1px solid rgba(255,255,255,0.06);
            }
            .geft-tutorial-steps-nav > * { flex: 1; }
            .geft-tutorial-steps-nav .geft-tutorial-indicator { display: flex; justify-content: center; }
            .geft-tutorial-steps-nav > .geft-btn-primary-wrap { display: flex; justify-content: flex-end; }
            .geft-tutorial-indicator { display: flex; gap: 8px; }
            .geft-tutorial-dot {
              width: 7px; height: 7px; border-radius: 50%;
              background: rgba(255,255,255,0.15); transition: all 0.25s;
            }
            .geft-tutorial-dot.active {
              background: #00FF88;
              box-shadow: 0 0 8px rgba(0,255,136,0.7);
              transform: scale(1.3);
            }
            .geft-btn-text {
              background: none; border: none; color: rgba(255,255,255,0.5);
              font-size: 13px; font-weight: 600; cursor: pointer;
              padding: 8px 12px; border-radius: 8px; transition: all 0.2s;
            }
            .geft-btn-text:hover:not(:disabled) { color: #fff; background: rgba(255,255,255,0.05); }
            .geft-btn-primary {
              padding: 10px 20px; border-radius: 10px; border: none;
              background: linear-gradient(90deg, #00FF88, #06b6d4);
              color: #000; font-size: 13px; font-weight: 700;
              cursor: pointer; transition: all 0.2s;
              width: fit-content; white-space: nowrap; flex-shrink: 0;
              box-shadow: 0 4px 16px rgba(0,255,136,0.3);
            }
            .geft-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
            /* Override background rect fill of loaded SVGs to match dark theme */
            .geft-svg-container svg rect {
              fill: #0c0c14 !important;
            }
          `}</style>

          <div className="geft-tutorial-modal">

            {/* Header */}
            <div className="geft-tut-header">
              <div>
                <div className="geft-tut-eyebrow">Langkah {tutorialStep + 1} dari 3</div>
                <h2 className="geft-tut-title">Penjelasan Tes GEFT</h2>
              </div>
              <div className="geft-tut-progress-ring">
                <svg viewBox="0 0 36 36" style={{ width: 44, height: 44 }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#00FF88" strokeWidth="3"
                    strokeDasharray={`${((tutorialStep + 1) / 3) * 94.2} 94.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                    style={{ transition: 'stroke-dasharray 0.4s ease' }}
                  />
                  <text x="18" y="22" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{tutorialStep + 1}/3</text>
                </svg>
              </div>
            </div>

            {/* Progress bar */}
            <div className="geft-tut-progress-track">
              <div className="geft-tut-progress-fill" style={{ width: `${((tutorialStep + 1) / 3) * 100}%` }} />
            </div>

            {/* Slide 1: Contoh X */}
            {tutorialStep === 0 && (
              <div className="geft-tutorial-container">
                <p className="geft-tut-desc">
                  Tes ini menguji kemampuan Anda menemukan bentuk sederhana yang <strong>tersembunyi</strong> di dalam gambar yang lebih rumit.
                </p>
                <div className="geft-tutorial-cols">
                  <div className="geft-tutorial-box">
                    <div className="geft-tut-box-label">Bentuk &quot;X&quot;</div>
                    <div className="geft-tutorial-svg-wrapper">
                      <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
                        <line x1="20" y1="20" x2="20" y2="90" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="20" y1="90" x2="80" y2="70" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="80" y1="70" x2="20" y2="20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="geft-tut-card-badge">Bentuk Target</div>
                  </div>
                  <div className="geft-tutorial-box">
                    <div className="geft-tut-box-label">Gambar Rumit</div>
                    <div className="geft-tutorial-svg-wrapper geft-tutorial-svg-wrapper-lg">
                      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                        <line x1="40" y1="80" x2="100" y2="100" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="100" x2="160" y2="80" stroke={showAnswer1 ? '#00FF88' : '#555'} strokeWidth={showAnswer1 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                        <line x1="160" y1="80" x2="100" y2="60" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="60" x2="40" y2="80" stroke="#555" strokeWidth="2" />
                        <line x1="40" y1="80" x2="40" y2="160" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="100" x2="100" y2="180" stroke="#555" strokeWidth="2" />
                        <line x1="160" y1="80" x2="160" y2="160" stroke="#555" strokeWidth="2" />
                        <line x1="40" y1="160" x2="100" y2="180" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="180" x2="160" y2="160" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="30" x2="40" y2="80" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="30" x2="100" y2="60" stroke="#555" strokeWidth="2" />
                        <line x1="100" y1="30" x2="100" y2="100" stroke={showAnswer1 ? '#00FF88' : '#555'} strokeWidth={showAnswer1 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                        <line x1="100" y1="30" x2="160" y2="80" stroke={showAnswer1 ? '#00FF88' : '#555'} strokeWidth={showAnswer1 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                      </svg>
                    </div>
                    {showAnswer1 && <div className="geft-tut-found-badge">✓ Ditemukan!</div>}
                  </div>
                </div>
                <button className={`geft-tut-reveal-btn ${showAnswer1 ? 'active' : ''}`} onClick={() => setShowAnswer1(!showAnswer1)}>
                  {showAnswer1 ? '🙈 Sembunyikan' : '👁️ Tampilkan Letak Bentuk X'}
                </button>
                <div className="geft-tut-tip">
                  💡 Bentuk yang dicari harus memiliki <strong>ukuran, proporsi, dan arah menghadap yang sama persis</strong> — tidak boleh diputar atau dibalik.
                </div>
              </div>
            )}

            {/* Slide 2: Contoh Y */}
            {tutorialStep === 1 && (
              <div className="geft-tutorial-container">
                <p className="geft-tut-desc">
                  Sekarang coba soal berikutnya. Temukan bentuk belah ketupat <strong>&quot;Y&quot;</strong> di dalam gambar yang lebih rumit:
                </p>
                <div className="geft-tutorial-cols">
                  <div className="geft-tutorial-box">
                    <div className="geft-tut-box-label">Bentuk &quot;Y&quot;</div>
                    <div className="geft-tutorial-svg-wrapper">
                      <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
                        <line x1="50" y1="20" x2="25" y2="60" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="25" y1="60" x2="50" y2="100" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="100" x2="75" y2="60" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="75" y1="60" x2="50" y2="20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="25" y1="60" x2="75" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="geft-tut-card-badge">Bentuk Target</div>
                  </div>
                  <div className="geft-tutorial-box">
                    <div className="geft-tut-box-label">Gambar Rumit</div>
                    <div className="geft-tutorial-svg-wrapper geft-tutorial-svg-wrapper-lg">
                      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                        <line x1="45" y1="120" x2="155" y2="120" stroke="#555" strokeWidth="2" />
                        <line x1="35" y1="75" x2="45" y2="120" stroke="#555" strokeWidth="2" />
                        <line x1="165" y1="75" x2="155" y2="120" stroke="#555" strokeWidth="2" />
                        <line x1="35" y1="75" x2="100" y2="105" stroke="#555" strokeWidth="2" />
                        <line x1="165" y1="75" x2="100" y2="105" stroke="#555" strokeWidth="2" />
                        <line x1="62.5" y1="90" x2="45" y2="120" stroke="#555" strokeWidth="2" />
                        <line x1="137.5" y1="90" x2="155" y2="120" stroke="#555" strokeWidth="2" />
                        <line x1="62.5" y1="90" x2="35" y2="75" stroke="#555" strokeWidth="2" />
                        <line x1="137.5" y1="90" x2="165" y2="75" stroke="#555" strokeWidth="2" />
                        <line x1="62.5" y1="90" x2="137.5" y2="90" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1="100" y1="30" x2="62.5" y2="90" stroke={showAnswer2 ? '#00FF88' : '#555'} strokeWidth={showAnswer2 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                        <line x1="100" y1="30" x2="137.5" y2="90" stroke={showAnswer2 ? '#00FF88' : '#555'} strokeWidth={showAnswer2 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                        <line x1="62.5" y1="90" x2="100" y2="150" stroke={showAnswer2 ? '#00FF88' : '#555'} strokeWidth={showAnswer2 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                        <line x1="137.5" y1="90" x2="100" y2="150" stroke={showAnswer2 ? '#00FF88' : '#555'} strokeWidth={showAnswer2 ? '5' : '2'} style={{ transition: 'all 0.25s' }} />
                      </svg>
                    </div>
                    {showAnswer2 && <div className="geft-tut-found-badge">✓ Ditemukan!</div>}
                  </div>
                </div>
                <button className={`geft-tut-reveal-btn ${showAnswer2 ? 'active' : ''}`} onClick={() => setShowAnswer2(!showAnswer2)}>
                  {showAnswer2 ? '🙈 Sembunyikan' : '👁️ Tampilkan Letak Bentuk Y'}
                </button>
                <div className="geft-tut-tip">
                  💡 Bagian yang ditebalkan menunjukkan letak persis bentuk &quot;Y&quot; — tersembunyi di bagian tengah gambar bintang.
                </div>
              </div>
            )}

            {/* Slide 3: Latihan Interaktif */}
            {tutorialStep === 2 && (
              <div className="geft-tutorial-container">
                <p className="geft-tut-desc">
                  <strong>Latihan Interaktif:</strong> Temukan segitiga &quot;X&quot; di gambar kanan dengan <strong>mengklik garis-garis pembentuknya</strong>.
                </p>
                <div className="geft-tutorial-cols">
                  <div className="geft-tutorial-box">
                    <div className="geft-tut-box-label">Cari Bentuk Ini</div>
                    <div className="geft-tutorial-svg-wrapper">
                      <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
                        <line x1="30" y1="20" x2="30" y2="90" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="30" y1="90" x2="90" y2="55" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        <line x1="90" y1="55" x2="30" y2="20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="geft-tut-card-badge">Bentuk Target</div>
                  </div>
                  <div className="geft-tutorial-box geft-tut-interactive-box">
                    <div className="geft-tut-box-label">Klik Garisnya</div>
                    <div className="geft-tutorial-svg-wrapper geft-tutorial-svg-wrapper-lg">
                      {/*
                        Koordinat di-scale agar shape memenuhi hampir seluruh viewBox 200×200:
                        A=(10,100)  B=(100,15)  C=(190,100)  D=(100,185)
                        Sebelumnya: x=40-160, y=55-145  →  Sekarang: x=10-190, y=15-185
                      */}
                      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                        {/* Visual lines */}
                        <line className={`geft-interactive-line ${tutorialSelected.has('line-4') ? 'selected' : ''}`} x1="10" y1="100" x2="100" y2="15" />
                        <line className={`geft-interactive-line ${tutorialSelected.has('line-5') ? 'selected' : ''}`} x1="10" y1="100" x2="100" y2="185" />
                        <line className={`geft-interactive-line ${tutorialSelected.has('line-6') ? 'selected' : ''}`} x1="10" y1="100" x2="190" y2="100" />
                        <line className={`geft-interactive-line ${tutorialSelected.has('line-1') ? 'selected' : ''}`} x1="100" y1="15" x2="100" y2="185" />
                        <line className={`geft-interactive-line ${tutorialSelected.has('line-2') ? 'selected' : ''}`} x1="100" y1="185" x2="190" y2="100" />
                        <line className={`geft-interactive-line ${tutorialSelected.has('line-3') ? 'selected' : ''}`} x1="190" y1="100" x2="100" y2="15" />
                        {/* Invisible wide hit-areas (di atas visual, pointer-events aktif di sini) */}
                        <line className="geft-hit-area" x1="10" y1="100" x2="100" y2="15" onClick={() => handleTutorialLineClick('line-4')} />
                        <line className="geft-hit-area" x1="10" y1="100" x2="100" y2="185" onClick={() => handleTutorialLineClick('line-5')} />
                        <line className="geft-hit-area" x1="10" y1="100" x2="190" y2="100" onClick={() => handleTutorialLineClick('line-6')} />
                        <line className="geft-hit-area" x1="100" y1="15" x2="100" y2="185" onClick={() => handleTutorialLineClick('line-1')} />
                        <line className="geft-hit-area" x1="100" y1="185" x2="190" y2="100" onClick={() => handleTutorialLineClick('line-2')} />
                        <line className="geft-hit-area" x1="190" y1="100" x2="100" y2="15" onClick={() => handleTutorialLineClick('line-3')} />
                      </svg>
                    </div>
                    <div className="geft-tut-sel-count">{tutorialSelected.size}/3 garis dipilih</div>
                  </div>
                </div>
                <div className="geft-tut-actions-row">
                  <button className="geft-tut-reset-btn" onClick={() => setTutorialSelected(new Set())} disabled={tutorialSelected.size === 0}>
                    🗑️ Reset
                  </button>
                  <div className={`geft-tut-feedback ${isTutorialSuccess ? 'success' : tutorialSelected.size > 0 ? 'hint' : 'idle'}`}>
                    {isTutorialSuccess
                      ? '🎉 Hebat! Anda berhasil! Siap mengerjakan tes.'
                      : tutorialSelected.size > 0
                        ? '💡 Klik 3 garis yang membentuk segitiga kanan.'
                        : 'Coba klik salah satu garis pada gambar kanan.'}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="geft-tutorial-steps-nav">
              <button
                className="geft-btn-text"
                disabled={tutorialStep === 0}
                onClick={() => setTutorialStep(tutorialStep - 1)}
                style={{ opacity: tutorialStep === 0 ? 0.3 : 1, cursor: tutorialStep === 0 ? 'not-allowed' : 'pointer' }}
              >
                ← Kembali
              </button>
              <div className="geft-tutorial-indicator">
                <span className={`geft-tutorial-dot ${tutorialStep === 0 ? 'active' : ''}`} />
                <span className={`geft-tutorial-dot ${tutorialStep === 1 ? 'active' : ''}`} />
                <span className={`geft-tutorial-dot ${tutorialStep === 2 ? 'active' : ''}`} />
              </div>
              <div className="geft-btn-primary-wrap">
                <button
                  className="geft-btn-primary"
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                  style={{
                    background: isTutorialSuccess && tutorialStep === 2 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #00FF88, #06b6d4)',
                    boxShadow: isTutorialSuccess && tutorialStep === 2 ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(0,255,136,0.3)',
                    color: '#000',
                  }}
                >
                  {tutorialStep === 2 ? 'Lanjut ke Mulai Tes →' : 'Lanjut →'}
                </button>
              </div>
            </div>

          </div>
        </main>
      )
    }

    return (
      <main className="geft-page-container" style={{ overflowY: 'auto' }}>
        {renderNavbar("TES DIAGNOSTIK (GEFT) ⏱️")}

        <div className="geft-intro-card" style={{ maxWidth: '600px', margin: '48px auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '36px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
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
            💡 Caranya: <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Ketuk / klik garis-garis</strong> pada gambar teka-teki yang membentuk bentuk sederhana yang diminta. Batas waktu: 30 detik per soal.
          </p>
          <button
            onClick={() => setPhase('test')}
            style={{
              width: '100%', padding: '16px 32px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(90deg, #00FF88, #06b6d4)',
              color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,255,136,0.35)',
              minHeight: '52px',
            }}
          >
            {isFirst ? 'Mulai Latihan →' : `Mulai ${SECTION_LABELS[nextSection]} →`}
          </button>
        </div>

        <style>{`
          .geft-intro-card {
            width: calc(100% - 32px);
          }
          @media (max-width: 600px) {
            .geft-intro-card {
              margin: 20px auto 20px !important;
              padding: 24px 18px !important;
              border-radius: 16px !important;
            }
          }
        `}</style>
      </main>
    )
  }

  if (phase === 'done') {
    return (
      <main className="geft-page-container">
        {renderNavbar("TES DIAGNOSTIK (GEFT) ⏱️")}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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
        /* ── Tutorial Modal ──────────────────────────────── */
        .geft-tutorial-modal {
          max-width: 680px;
          width: calc(100% - 32px);
          margin: 32px auto 20px;
          background: rgba(12, 12, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px 32px 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0, 255, 136, 0.08);
          backdrop-filter: blur(20px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .geft-tutorial-modal {
            margin: 12px auto 12px;
            padding: 20px 16px 16px;
            border-radius: 18px;
            gap: 14px;
            max-height: calc(100dvh - 80px);
            overflow-y: auto;
          }
        }
        /* Header */
        .geft-tut-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .geft-tut-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #00FF88;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .geft-tut-title {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(90deg, #00FF88, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        @media (max-width: 600px) {
          .geft-tut-title { font-size: 17px; }
        }
        .geft-tut-progress-ring { flex-shrink: 0; }
        /* Progress bar */
        .geft-tut-progress-track {
          height: 3px;
          background: rgba(255,255,255,0.07);
          border-radius: 99px;
          overflow: hidden;
        }
        .geft-tut-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00FF88, #06b6d4);
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        /* Slide container */
        .geft-tutorial-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .geft-tut-desc {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          line-height: 1.65;
          margin: 0;
        }
        /* Compare row */
        .geft-tutorial-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 480px) {
          .geft-tutorial-cols {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
        .geft-tutorial-box {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          box-sizing: border-box;
        }
        .geft-tut-interactive-box {
          border-color: rgba(0,255,136,0.2);
          background: rgba(0,255,136,0.03);
        }
        /* SVG wrappers */
        .geft-tutorial-svg-wrapper {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0c0c14;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 10px;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .geft-tutorial-svg-wrapper-lg {
          width: 140px;
          height: 140px;
        }
        @media (max-width: 600px) {
          .geft-tutorial-svg-wrapper { width: 100px; height: 100px; padding: 8px; }
          .geft-tutorial-svg-wrapper-lg { width: 115px; height: 115px; }
        }
        /* Found badge */
        .geft-tut-found-badge {
          font-size: 11px;
          font-weight: 700;
          color: #34d399;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.2);
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.5px;
        }
        .geft-tut-card-badge {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        /* Reveal button */
        .geft-tut-reveal-btn {
          align-self: center;
          padding: 10px 22px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }
        .geft-tut-reveal-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          transform: translateY(-1px);
        }
        .geft-tut-reveal-btn.active {
          border-color: rgba(0,255,136,0.5);
          background: rgba(0,255,136,0.08);
          color: #00FF88;
        }
        /* Tip */
        .geft-tut-tip {
          font-size: 12.5px;
          color: rgba(255,255,255,0.5);
          line-height: 1.55;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 10px 14px;
        }
        /* Slide 3 specifics */
        .geft-tut-sel-count {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
        }
        .geft-tut-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .geft-tut-reset-btn {
          flex-shrink: 0;
          padding: 9px 16px;
          border-radius: 9px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.06);
          color: #f87171;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .geft-tut-reset-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .geft-tut-reset-btn:not(:disabled):hover {
          background: rgba(239,68,68,0.12);
        }
        .geft-tut-feedback {
          flex: 1;
          font-size: 12.5px;
          font-weight: 500;
          padding: 9px 14px;
          border-radius: 9px;
          line-height: 1.45;
          transition: all 0.25s;
        }
        .geft-tut-feedback.idle {
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .geft-tut-feedback.hint {
          color: rgba(251,191,36,0.9);
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.15);
        }
        .geft-tut-feedback.success {
          color: #34d399;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          font-weight: 600;
        }
        /* Interactive lines */
        .geft-interactive-line {
          cursor: pointer;
          stroke: #555;
          stroke-width: 4px;
          fill: none;
          pointer-events: all;
          stroke-linecap: round;
          transition: stroke 0.15s, stroke-width 0.15s;
        }
        .geft-interactive-line:hover {
          stroke: #00FF88;
          stroke-width: 6px;
        }
        .geft-interactive-line.selected {
          stroke: #00FF88 !important;
          stroke-width: 6.5px !important;
          filter: drop-shadow(0 0 3px rgba(0,255,136,0.6));
        }
        /* Nav */
        .geft-tutorial-steps-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .geft-tutorial-indicator { display: flex; gap: 8px; }
        .geft-tutorial-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.25s;
        }
        .geft-tutorial-dot.active {
          background: #00FF88;
          box-shadow: 0 0 8px rgba(0,255,136,0.7);
          transform: scale(1.2);
        }

        /* Mengurangi noise visual dari pattern stipple (titik-titik arsiran) */
        .geft-svg-container svg pattern#stipple circle {
          r: 0.6px !important;
          opacity: 0.15 !important;
          fill: #c4a482 !important;
        }

        .geft-page-container {
          min-height: 100vh;
          background: #0A0A0F;
          background-image: linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          color: #f3f4f6;
          font-family: var(--font-sans), sans-serif;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        
        header.geft-navbar {
          background: rgba(10, 10, 15, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 255, 136, 0.08);
          margin: -24px -20px 24px -20px;
        }
        .nav-subtitle { display: block; }
        @media (max-width: 480px) {
          .nav-subtitle { display: none; }
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

        .geft-svg-container {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .geft-svg-container svg {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .geft-svg-container svg rect {
          fill: #0c0c14 !important;
        }

        /* ── SVG Line Styles ────────────────────────────── */
        /* Each line has TWO layers in the SVG:
           1. A transparent thick "hit" line for easy tapping (pointer-events: all)
           2. A visible thin line on top (pointer-events: none)
           Both share the same ID, so clicking the hit area still triggers selection. */
        /* Semua line/path: tidak menerima pointer events — klik ditangani oleh
           container div melalui custom distance-based hit detection */
        .geft-svg-container svg line, .geft-svg-container svg path {
          stroke: #666;
          stroke-width: 5px;
          transition: stroke 0.15s, stroke-width 0.15s;
          pointer-events: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .geft-svg-container svg line.selected, .geft-svg-container svg path.selected {
          stroke: #00FF88 !important;
          stroke-width: 8px !important;
          filter: drop-shadow(0 0 4px rgba(0,255,136,0.6));
        }
        
        .geft-btn-primary {
          padding: 12px 28px;
          min-height: 48px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #00FF88, #06b6d4);
          color: #000;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,255,136,0.35);
          transition: all 0.2s;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .geft-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,255,136,0.5);
        }
        
        .geft-btn-secondary {
          padding: 12px 20px;
          min-height: 48px;
          border-radius: 12px;
          border: 1px solid rgba(255,80,80,0.5);
          background: rgba(255,80,80,0.08);
          color: #ff8080;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .geft-btn-secondary:hover {
          background: rgba(255,80,80,0.15);
        }

        .geft-btn-text {
          padding: 12px 20px;
          min-height: 48px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
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
            flex-shrink: 0;
          }

          .geft-target-card {
            order: 2;
            padding: 6px 12px !important;
            gap: 12px !important;
            border-radius: 12px !important;
            background: rgba(255, 255, 255, 0.02) !important;
            width: 100%;
            box-sizing: border-box;
            flex-shrink: 0;
          }

          .geft-target-card .geft-target-img-container {
            padding: 4px !important;
            border-radius: 8px !important;
          }

          .geft-target-card .geft-target-img-container > div {
            width: 40px !important;
            height: 40px !important;
            border-radius: 6px !important;
          }

          .geft-target-card .geft-target-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }
          /* Garis lebih tebal di mobile agar mudah terlihat;
             pointer-events: none karena klik ditangani oleh custom hit detection */
          .geft-svg-container svg line,
          .geft-svg-container svg path {
            stroke-width: 10px !important;
            pointer-events: none !important;
          }
          .geft-svg-container svg line.selected,
          .geft-svg-container svg path.selected {
            stroke-width: 12px !important;
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
            width: 100%;
            max-width: 420px;
            aspect-ratio: 1 / 1;
            margin: 0 auto;
            display: flex !important;
            align-items: center;
            justify-content: center;
            height: auto !important;
          }

          .geft-svg-container svg {
            width: 100% !important;
            height: 100% !important;
            display: block;
          }

          /* ── Larger touch targets for SVG lines on mobile ── */
          .geft-svg-container svg line,
          .geft-svg-container svg path {
            stroke-width: 10px !important;
          }
          .geft-svg-container svg line.selected,
          .geft-svg-container svg path.selected {
            stroke-width: 12px !important;
          }
          /* Hit areas get even thicker strokes on touch screens */
          .geft-svg-container svg line.hit-area,
          .geft-svg-container svg path.hit-area {
            stroke-width: 48px !important;
            stroke: transparent !important;
          }
          /* Active tap feedback on mobile */
          .geft-svg-container svg line.hit-area:active,
          .geft-svg-container svg path.hit-area:active {
            stroke: rgba(0, 255, 136, 0.25) !important;
          }

          .geft-actions-area {
            order: 4;
            gap: 6px !important;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 8px 12px;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
          }

          .geft-buttons-row {
            gap: 8px !important;
          }

          .geft-btn-primary, .geft-btn-secondary, .geft-btn-text {
            padding: 11px 14px !important;
            min-height: 44px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }
          
          .geft-feedback {
            padding: 6px 12px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }

          /* Dot indicator: bigger for fingers */
          .geft-selection-dot {
            width: 10px !important;
            height: 10px !important;
          }
        }
      `}</style>

      {renderNavbar("TES DIAGNOSTIK (GEFT) ⏱️")}

      {/* Progress */}
      <div className="geft-progress-container" style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 20, maxWidth: 1040, margin: '0 auto 20px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #00FF88, #06b6d4)', borderRadius: 3, transition: 'width 0.3s', boxShadow: '0 0 8px rgba(0,255,136,0.4)' }} />
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
            <div className="geft-target-img-container" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', background: '#0c0c14', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <img src={`/geft/shape-${q.targetShape}.svg`} alt={q.targetShape} style={{ maxWidth: '90%', maxHeight: '90%' }} />
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
                <button
                  className="geft-btn-text"
                  style={{ flex: 1 }}
                  onClick={() => {
                    if (q.section === 1) {
                      handleNext() // Sesi latihan langsung lewati
                    } else {
                      setShowSkipModal(true) // Sesi dinilai tampilkan konfirmasi
                    }
                  }}
                >
                  Lewati Soal
                </button>
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

      {/* Confirmation Modal */}
      {showSkipModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            background: '#0c0c14',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 136, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px' }}>⚠️</div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#f3f4f6' }}>
                Lewati Soal Ini?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                Apakah kamu yakin ingin melewati soal ini? Jawaban untuk soal ini akan dianggap <strong style={{ color: '#f87171' }}>belum tepat (0 poin)</strong>. Coba cari polanya dulu!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                className="geft-btn-primary"
                style={{ flex: 1 }}
                onClick={() => setShowSkipModal(false)}
              >
                Kembali Mencoba
              </button>
              <button
                className="geft-btn-secondary"
                style={{
                  flex: 1,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                }}
                onClick={() => {
                  setShowSkipModal(false)
                  handleNext(true) // skip dan tandai sebagai salah (timeout/skipped = true)
                }}
              >
                Ya, Lewati
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}