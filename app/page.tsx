'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

type Classroom = {
  id: string
  name: string
  grade: string
  major: string
}

// Animated grid particle
function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 4, delay, ease: 'easeInOut' }}
      style={{
        position: 'absolute', top: y, left: x,
        width: '5px', height: '5px', borderRadius: '50%',
        background: '#D97706',
        boxShadow: '0 0 8px rgba(217,119,6,0.5)',
        pointerEvents: 'none',
      }}
    />
  )
}

const PARTICLES = [
  { x: '12%', y: '20%', delay: 0 }, { x: '78%', y: '15%', delay: 0.8 },
  { x: '35%', y: '72%', delay: 1.6 }, { x: '88%', y: '55%', delay: 2.4 },
  { x: '55%', y: '30%', delay: 0.4 }, { x: '20%', y: '60%', delay: 1.2 },
  { x: '65%', y: '80%', delay: 2.0 }, { x: '42%', y: '45%', delay: 0.6 },
]

// Animated stat counter
function CountUp({ target, suffix = '', duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let active = true
    let frameId: number
    const start = Date.now()
    const tick = () => {
      if (!active) return
      const t = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * target))
      if (t < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }
    const timer = setTimeout(tick, 400)
    return () => {
      active = false
      clearTimeout(timer)
      cancelAnimationFrame(frameId)
    }
  }, [target, duration])
  return <>{val}{suffix}</>
}

export default function HomePage() {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [name, setName] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingClass, setLoadingClass] = useState(true)
  const [nameFocus, setNameFocus] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Card tilt on mouse
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-100, 100], [4, -4])
  const rotateY = useTransform(mouseX, [-100, 100], [-4, 4])
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  // Scroll detection for sticky header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (data) {
      try {
        const student = JSON.parse(data)
        if (student.geftStatus !== 'completed') {
          router.push('/siswa/geft')
        } else {
          router.push('/siswa')
        }
      } catch (e) {
        console.error('Error parsing student data:', e)
      }
    }
  }, [router])

  useEffect(() => {
    fetch('/api/classrooms')
      .then(r => r.json())
      .then(data => {
        setClassrooms(data)
        if (data?.length === 1) setClassroomId(data[0].id)
      })
      .finally(() => setLoadingClass(false))
  }, [])

  async function handleMulaiBelajar() {
    setError('')
    if (!name.trim()) return setError('Nama lengkap wajib diisi.')
    if (!classroomId) return setError('Pilih kelas terlebih dahulu.')
    setLoading(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), classroomId }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Terjadi kesalahan.')
      localStorage.setItem('student', JSON.stringify(data))
      if (data.geftStatus !== 'completed') {
        router.push('/siswa/geft')
      } else {
        router.push('/siswa')
      }
    } catch {
      setError('Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  const FEATURES = [
    { icon: '🔬', label: 'Tes Diagnostik Awal', desc: 'Ukur kemampuan statistika awal untuk jalur belajar yang dipersonalisasi.' },
    { icon: '🧠', label: 'Gaya Kognitif FI / FD', desc: 'Profil Field Independent & Field Dependent via tes GEFT terintegrasi.' },
    { icon: '🕵️', label: 'Game Investigasi Data', desc: 'Selesaikan misi detektif: ungkap klaim viral menggunakan histogram & statistika.' },
    { icon: '📖', label: 'Buku Saku Detektif', desc: 'Pelajari distribusi, outlier, dan mean vs median lewat animasi interaktif.' },
  ]

  return (
    <main style={{
      minHeight: '100vh',
      background: '#FAF6EE',
      color: '#1C1917',
      position: 'relative',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>

      {/* Overflow wrapper untuk background decorations — terpisah dari main agar sticky bekerja */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* ── Warm dot pattern background ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(180,140,80,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Warm glow blobs */}
        <div style={{ position: 'absolute', top: '-5%', left: '-8%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-8%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 60%)', filter: 'blur(80px)' }} />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* ── Navbar — sticky ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(250,246,238,0.98)' : 'rgba(250,246,238,0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(180,140,80,0.2)' : '1px solid rgba(180,140,80,0.08)',
        boxShadow: scrolled ? '0 4px 24px rgba(180,120,40,0.08)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}>
        <style>{`
          .nav-inner {
            max-width: 1200px; margin: 0 auto;
            padding: 12px 20px;
            display: flex; justify-content: space-between; align-items: center;
          }
          .nav-subtitle { display: block; }
          .nav-badge { display: flex; }
          .nav-btn-full { display: inline; }
          .nav-btn-short { display: none; }
          @media (max-width: 480px) {
            .nav-inner { padding: 10px 16px; }
            .nav-subtitle { display: none; }
            .nav-badge { display: none; }
            .nav-btn-full { display: none; }
            .nav-btn-short { display: inline; }
          }
        `}</style>
        <div className="nav-inner">
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <motion.div
              animate={{ filter: ['drop-shadow(0 0 4px rgba(217,119,6,0.5))', 'drop-shadow(0 0 10px rgba(217,119,6,0.8))', 'drop-shadow(0 0 4px rgba(217,119,6,0.5))'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontSize: '24px', lineHeight: 1 }}
            >
              🕵️
            </motion.div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px',
                background: 'linear-gradient(90deg, #D97706, #EA580C)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}>
                Skeptikos
              </div>
              <div className="nav-subtitle" style={{ fontSize: '9px', color: 'rgba(87,83,78,0.5)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
                INVESTIGASI DATA
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Status badge — desktop only */}
            <div className="nav-badge" style={{
              padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
              border: '1px solid rgba(217,119,6,0.25)', background: 'rgba(217,119,6,0.08)',
              color: '#D97706', letterSpacing: '0.5px', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D97706', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              ONLINE
            </div>
            <button
              onClick={() => router.push('/guru')}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: '1px solid rgba(180,140,80,0.2)',
                background: 'rgba(217,119,6,0.06)',
                color: '#78716C', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.12)'; e.currentTarget.style.color = '#1C1917' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.06)'; e.currentTarget.style.color = '#78716C' }}
            >
              <span className="nav-btn-full">🧑‍🏫 Portal Guru</span>
              <span className="nav-btn-short">Portal Guru</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 80px' }}>
        <div className="hero-layout" style={{ display: 'flex', gap: '56px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* ── LEFT: Hero Copy ── */}
          <div style={{ flex: 1.2, minWidth: 'min(320px, 100%)', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Mission badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex', alignSelf: 'flex-start',
                alignItems: 'center', gap: '8px',
                padding: '7px 16px', borderRadius: '50px',
                border: '1px solid rgba(217,119,6,0.3)',
                background: 'rgba(217,119,6,0.08)',
                fontSize: '11px', fontWeight: 800, color: '#D97706', letterSpacing: '2px',
              }}
            >
              <span style={{ fontSize: '16px' }}>🏆</span>
              LIDM IPDP 2026
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="hero-h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              style={{ margin: 0, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px' }}
            >
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: '#1C1917' }}>
                Jadi Detektif Data,
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: '#1C1917' }}>
                Ungkap Klaim{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Viral
                </span>{' '}dengan
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: '#1C1917' }}>
                <span style={{
                  background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Statistika!
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{ margin: 0, fontSize: '16px', color: '#78716C', lineHeight: 1.7, maxWidth: '480px' }}
            >
              Platform game edukasi adaptif yang menggabungkan profil kognitif <strong style={{ color: '#D97706' }}>FI/FD</strong>, investigasi data nyata, dan visualisasi histogram interaktif untuk pembelajaran statistika SMA yang menyenangkan.
            </motion.p>

            {/* Features grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  style={{
                    padding: '14px 16px', borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(180,140,80,0.15)',
                    boxShadow: '0 2px 8px rgba(180,120,40,0.06)',
                    transition: 'all 0.2s', cursor: 'default',
                  }}
                  whileHover={{ borderColor: 'rgba(217,119,6,0.35)', background: '#FFF8F0', boxShadow: '0 4px 16px rgba(217,119,6,0.1)' }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917', marginBottom: '4px' }}>{f.label}</div>
                  <div style={{ fontSize: '11px', color: '#78716C', lineHeight: 1.5 }}>{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ display: 'flex', gap: '28px', paddingTop: '8px', borderTop: '1px solid rgba(180,140,80,0.15)' }}
            >
              {[
                { val: 15, suffix: ' soal', label: 'Tes Diagnostik' },
                { val: 35, suffix: ' data', label: 'Dataset Nyata' },
                { val: 3, suffix: ' materi', label: 'Buku Saku' },
              ].map(({ val, suffix, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#D97706', fontFamily: "'Geist Mono', monospace" }}>
                    <CountUp target={val} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#78716C', fontWeight: 700, marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Login Card ── */}
          <div className="login-card-container" style={{ flex: 0.85, minWidth: '320px', display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, width: '100%', maxWidth: '420px' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 100 }}
            >
              {/* Glow border ring */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(217,119,6,0.4) 0%, rgba(234,88,12,0.2) 50%, rgba(251,191,36,0.15) 100%)',
                padding: '1px', borderRadius: '28px',
                boxShadow: '0 4px 24px rgba(217,119,6,0.12)',
              }}>
                <div style={{
                  background: '#FFFFFF',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '27px',
                  padding: '36px 30px',
                }}>

                  {/* Card Header */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                        boxShadow: '0 0 16px rgba(217,119,6,0.12)',
                      }}>
                        🔐
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#1C1917' }}>
                          Masuk ke Markas
                        </h2>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
                          Identifikasi dirimu, Detektif!
                        </p>
                      </div>
                    </div>

                    {/* Mission briefing ticker */}
                    <div style={{
                      padding: '8px 12px', borderRadius: '10px',
                      background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)',
                      fontSize: '11px', color: '#D97706', fontWeight: 700, letterSpacing: '0.5px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{ animation: 'blink 1.2s infinite' }}>📡</span>
                      MISI AKTIF: Ungkap Klaim Viral Screen Time Remaja
                    </div>
                  </div>

                  {/* Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                    {/* Nama */}
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#A8A29E', letterSpacing: '2px', marginBottom: '8px' }}>
                        NAMA DETEKTIF
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          id="student-name"
                          placeholder="Masukkan nama lengkapmu..."
                          value={name}
                          onChange={e => setName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleMulaiBelajar()}
                          onFocus={() => setNameFocus(true)}
                          onBlur={() => setNameFocus(false)}
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '14px 16px', borderRadius: '12px',
                            background: nameFocus ? '#FFFDF8' : '#FAFAF5',
                            border: `1px solid ${nameFocus ? 'rgba(217,119,6,0.5)' : 'rgba(180,140,80,0.2)'}`,
                            color: '#1C1917', fontSize: '14px', outline: 'none',
                            transition: 'all 0.2s', fontFamily: 'inherit',
                            boxShadow: nameFocus ? '0 0 0 3px rgba(217,119,6,0.1)' : 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Kelas */}
                    {loadingClass ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#78716C', letterSpacing: '2px', marginBottom: '8px' }}>
                          UNIT / KELAS
                        </label>
                        <div style={{
                          padding: '14px 16px', borderRadius: '12px',
                          background: '#FAFAF5',
                          border: '1px solid rgba(180,140,80,0.2)',
                          display: 'flex', alignItems: 'center', gap: '10px',
                          position: 'relative',
                        }}>
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ fontSize: '13px', color: '#78716C' }}
                          >
                            Memuat daftar kelas...
                          </motion.span>
                        </div>
                      </div>
                    ) : classrooms.length > 1 ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#78716C', letterSpacing: '2px', marginBottom: '8px' }}>
                          UNIT / KELAS
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            id="classroom-select"
                            value={classroomId}
                            onChange={e => setClassroomId(e.target.value)}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '14px 16px', borderRadius: '12px',
                              background: '#FAFAF5',
                              border: '1px solid rgba(180,140,80,0.2)',
                              color: classroomId ? '#1C1917' : '#78716C',
                              fontSize: '14px', outline: 'none', cursor: 'pointer',
                              appearance: 'none', transition: 'all 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(217,119,6,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(180,140,80,0.2)'}
                          >
                            <option value="">— Pilih Unit —</option>
                            {classrooms.map(c => (
                              <option key={c.id} value={c.id} style={{ background: '#FAFAF5', color: '#1C1917' }}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', fontSize: '12px', pointerEvents: 'none' }}>
                            ▼
                          </span>
                        </div>
                      </div>
                    ) : classrooms.length === 1 ? (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(217,119,6,0.06)',
                        border: '1px solid rgba(217,119,6,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>🏛️</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#78716C', letterSpacing: '1px' }}>UNIT / KELAS</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917' }}>{classrooms[0].name}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 800 }}>AUTO-SELECT</span>
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(239,68,68,0.05)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        fontSize: '13px', color: '#f87171',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        ⚠️ Tidak ada kelas tersedia. Hubungi guru.
                      </div>
                    )}

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          style={{
                            padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171', fontSize: '13px', lineHeight: 1.5,
                          }}
                        >
                          ⚠️ {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      onClick={handleMulaiBelajar}
                      disabled={loading || loadingClass}
                      whileHover={!loading && !loadingClass ? { scale: 1.02, boxShadow: '0 4px 24px rgba(217,119,6,0.35)' } : {}}
                      whileTap={!loading && !loadingClass ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%', padding: '16px',
                        borderRadius: '14px', border: 'none',
                        background: loading || loadingClass
                          ? 'rgba(217,119,6,0.3)'
                          : 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
                        color: '#ffffff', fontSize: '15px', fontWeight: 900,
                        cursor: loading || loadingClass ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.5px',
                        boxShadow: loading || loadingClass ? 'none' : '0 4px 20px rgba(217,119,6,0.3)',
                        transition: 'background 0.2s',
                        marginTop: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⏳</motion.span>
                          Verifikasi Identitas...
                        </>
                      ) : (
                        <>🚀 Mulai Investigasi</>
                      )}
                    </motion.button>
                  </div>

                  {/* Flow steps hint */}
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(180,140,80,0.12)' }}>
                    <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px' }}>
                      ALUR MISI
                    </div>
                    <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
                      {['Login', 'Diagnostik', 'GEFT', 'Investigasi'].map((step, i, arr) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: i === 0 ? 'rgba(217,119,6,0.15)' : 'rgba(180,140,80,0.07)',
                              border: `1px solid ${i === 0 ? 'rgba(217,119,6,0.5)' : 'rgba(180,140,80,0.15)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800,
                              color: i === 0 ? '#D97706' : '#78716C',
                            }}>
                              {i + 1}
                            </div>
                            <span style={{ fontSize: '9px', color: i === 0 ? '#D97706' : '#78716C', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {step}
                            </span>
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,80,0.15)', margin: '0 4px', marginBottom: '14px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(87,83,78,0.4); }
        select { appearance: none; }

        @media (min-width: 901px) {
          .login-card-container {
            position: sticky !important;
            top: 100px !important;
            align-self: flex-start !important;
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        @media (max-width: 900px) {
          .hero-layout {
            flex-direction: column-reverse !important;
            gap: 40px !important;
            padding-top: 40px !important;
          }
          .hero-layout > div {
            min-width: 100% !important;
            width: 100% !important;
          }
          .hero-h1 span { font-size: 30px !important; }
        }
        @media (max-width: 480px) {
          .hero-h1 span { font-size: 26px !important; }
        }
      `}</style>
    </main>
  )
}