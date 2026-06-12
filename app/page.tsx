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
      animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 4, delay, ease: 'easeInOut' }}
      style={{
        position: 'absolute', top: y, left: x,
        width: '4px', height: '4px', borderRadius: '50%',
        background: '#00FF88',
        boxShadow: '0 0 8px #00FF88',
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
  const ref = useRef(false)
  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const start = Date.now()
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    const timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
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
      if (data.diagnosticScore === null || data.diagnosticScore === undefined) {
        router.push('/siswa/diagnostik')
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
      background: 'var(--game-bg, #0A0A0F)',
      color: '#fff',
      position: 'relative',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>

      {/* Overflow wrapper untuk background decorations — terpisah dari main agar sticky bekerja */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* ── Animated grid background ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-5%', left: '-8%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-8%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.02) 0%, transparent 60%)', filter: 'blur(80px)' }} />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* ── Navbar — sticky ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(6,8,14,0.96)' : 'rgba(10,10,15,0.65)',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(0,255,136,0.14)' : '1px solid rgba(0,255,136,0.06)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              }}>
                AR-COGNISTATS
              </div>
              <div className="nav-subtitle" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
                DATA DETECTIVE ACADEMY
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Status badge — desktop only */}
            <div className="nav-badge" style={{
              padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
              border: '1px solid rgba(0,255,136,0.2)', background: 'rgba(0,255,136,0.06)',
              color: '#00FF88', letterSpacing: '0.5px', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FF88', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              ONLINE
            </div>
            <button
              onClick={() => router.push('/guru')}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.7)', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
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
                border: '1px solid rgba(0,255,136,0.3)',
                background: 'rgba(0,255,136,0.06)',
                fontSize: '11px', fontWeight: 800, color: '#00FF88', letterSpacing: '2px',
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
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: 'rgba(255,255,255,0.9)' }}>
                Jadi Detektif Data,
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)' }}>
                Ungkap Klaim{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #00FF88 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Viral
                </span>{' '}dengan
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: 'rgba(255,255,255,0.9)' }}>
                Statistika! 📊
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{ margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '480px' }}
            >
              Platform game edukasi adaptif yang menggabungkan profil kognitif <strong style={{ color: '#00FF88' }}>FI/FD</strong>, investigasi data nyata, dan visualisasi histogram interaktif untuk pembelajaran statistika SMA yang menyenangkan.
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
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s', cursor: 'default',
                  }}
                  whileHover={{ borderColor: 'rgba(0,255,136,0.25)', background: 'rgba(0,255,136,0.04)' }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{f.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{f.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ display: 'flex', gap: '28px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {[
                { val: 15, suffix: ' soal', label: 'Tes Diagnostik' },
                { val: 35, suffix: ' data', label: 'Dataset Nyata' },
                { val: 3, suffix: ' materi', label: 'Buku Saku' },
              ].map(({ val, suffix, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#00FF88', fontFamily: "'Geist Mono', monospace" }}>
                    <CountUp target={val} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Login Card ── */}
          <div style={{ flex: 0.85, minWidth: '320px', display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
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
                background: 'linear-gradient(135deg, rgba(0,255,136,0.3) 0%, rgba(6,182,212,0.15) 50%, rgba(0,255,136,0.1) 100%)',
                padding: '1px', borderRadius: '28px',
                boxShadow: '0 0 40px rgba(0,255,136,0.12)',
              }}>
                <div style={{
                  background: 'rgba(12,12,20,0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '27px',
                  padding: '36px 30px',
                }}>

                  {/* Card Header */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                        boxShadow: '0 0 16px rgba(0,255,136,0.15)',
                      }}>
                        🔐
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>
                          Masuk ke Markas
                        </h2>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                          Identifikasi dirimu, Detektif!
                        </p>
                      </div>
                    </div>

                    {/* Mission briefing ticker */}
                    <div style={{
                      padding: '8px 12px', borderRadius: '10px',
                      background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)',
                      fontSize: '11px', color: '#00FF88', fontWeight: 700, letterSpacing: '0.5px',
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
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>
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
                            padding: '14px 16px 14px 44px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${nameFocus ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            color: '#fff', fontSize: '14px', outline: 'none',
                            transition: 'all 0.2s', fontFamily: 'inherit',
                            boxShadow: nameFocus ? '0 0 0 3px rgba(0,255,136,0.08)' : 'none',
                          }}
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>
                          🕵️
                        </span>
                      </div>
                    </div>

                    {/* Kelas */}
                    {classrooms.length > 1 ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>
                          UNIT / KELAS
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            id="classroom-select"
                            value={classroomId}
                            onChange={e => setClassroomId(e.target.value)}
                            disabled={loadingClass}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '14px 16px 14px 44px', borderRadius: '12px',
                              background: 'rgba(11,14,25,0.9)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: classroomId ? '#fff' : 'rgba(255,255,255,0.3)',
                              fontSize: '14px', outline: 'none', cursor: 'pointer',
                              appearance: 'none', transition: 'all 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                          >
                            <option value="">— Pilih Unit —</option>
                            {classrooms.map(c => (
                              <option key={c.id} value={c.id} style={{ background: '#0b1329', color: '#fff' }}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>
                            🏛️
                          </span>
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '12px', pointerEvents: 'none' }}>
                            ▼
                          </span>
                        </div>
                      </div>
                    ) : classrooms.length === 1 ? (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(0,255,136,0.04)',
                        border: '1px solid rgba(0,255,136,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>🏛️</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>UNIT / KELAS</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{classrooms[0].name}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#00FF88', fontWeight: 800 }}>AUTO-SELECT</span>
                      </div>
                    ) : null}

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
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 30px rgba(0,255,136,0.5)' } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%', padding: '16px',
                        borderRadius: '14px', border: 'none',
                        background: loading
                          ? 'rgba(0,255,136,0.3)'
                          : 'linear-gradient(90deg, #00FF88 0%, #06b6d4 100%)',
                        color: '#000', fontSize: '15px', fontWeight: 900,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.5px',
                        boxShadow: loading ? 'none' : '0 4px 20px rgba(0,255,136,0.35)',
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
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px' }}>
                      ALUR MISI
                    </div>
                    <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
                      {['Login', 'Diagnostik', 'GEFT', 'Investigasi'].map((step, i, arr) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: i === 0 ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${i === 0 ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.08)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800,
                              color: i === 0 ? '#00FF88' : 'rgba(255,255,255,0.25)',
                            }}>
                              {i + 1}
                            </div>
                            <span style={{ fontSize: '9px', color: i === 0 ? '#00FF88' : 'rgba(255,255,255,0.25)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {step}
                            </span>
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 4px', marginBottom: '14px' }} />
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
        input::placeholder { color: rgba(255,255,255,0.2); }
        select { appearance: none; }

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