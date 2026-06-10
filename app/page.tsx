'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Classroom = {
  id: string
  name: string
  grade: string
  major: string
}

export default function HomePage() {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [name, setName] = useState('')
  const [nisn, setNisn] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingClass, setLoadingClass] = useState(true)

  useEffect(() => {
    fetch('/api/classrooms')
      .then(r => r.json())
      .then(data => {
        setClassrooms(data)
        if (data && data.length === 1) {
          setClassroomId(data[0].id)
        }
      })
      .finally(() => setLoadingClass(false))
  }, [])

  async function handleMulaiBelajar() {
    setError('')
    if (!name.trim()) return setError('Nama lengkap wajib diisi.')
    if (!/^\d{10}$/.test(nisn)) return setError('NISN harus 10 digit angka.')
    if (!classroomId) return setError('Pilih kelas terlebih dahulu.')

    setLoading(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), nisn, classroomId }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Terjadi kesalahan.')

      // Simpan sesi siswa di localStorage
      localStorage.setItem('student', JSON.stringify(data))
      router.push('/siswa')
    } catch {
      setError('Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #030712 0%, #080f25 50%, #020617 100%)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background decorative glowing blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }} />
      </div>

      {/* Modern Translucent Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(3, 7, 18, 0.65)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '16px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>🔬</span>
            <div>
              <span style={{
                fontFamily: 'var(--font-outfit), sans-serif',
                fontWeight: 900, fontSize: '18px', letterSpacing: '0.5px',
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>AR-COGNISTATS</span>
              <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', fontWeight: 600 }}>
                PLATFORM STATISTIKA SMA
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => router.push('/guru')}
            style={{
              padding: '8px 20px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          >
            🧑‍🏫 Portal Guru
          </button>
        </div>
      </header>

      {/* Main Hero and Form Layout */}
      <section className="home-hero-section" style={{
        position: 'relative', zIndex: 10,
        maxWidth: '1200px', margin: '0 auto',
        padding: '60px 24px', display: 'flex',
        gap: '48px', alignItems: 'center', flexWrap: 'wrap'
      }}>
        {/* Left Column - Product Presentation */}
        <div style={{ flex: 1.2, minWidth: 'min(320px, 100%)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Badge */}
          <div style={{
            alignSelf: 'flex-start',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
            color: '#3b82f6', background: 'rgba(37,99,235,0.1)',
            padding: '6px 16px', borderRadius: '50px',
            border: '1px solid rgba(37,99,235,0.2)'
          }}>
            LIDM 2026 COMPETITION ENTRY 🏆
          </div>

          {/* Slogan */}
          <h1 className="home-hero-h1" style={{
            fontSize: '46px', fontWeight: 800, lineHeight: 1.15,
            margin: 0, letterSpacing: '-0.5px'
          }}>
            Belajar Statistika Lebih Nyata dengan{' '}
            <span style={{
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Augmented Reality</span>
          </h1>

          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6, margin: 0
          }}>
            AR-Cognistats menggabungkan visualisasi interaktif Augmented Reality 3D dengan profil kognitif Anda untuk menyajikan modul pembelajaran statistika adaptif terbaik.
          </p>

          {/* Features checkmark list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', color: '#10b981' }}>⚡</span>
              <div>
                <strong style={{ color: '#fff', fontSize: '15px' }}>Rekomendasi Gaya Kognitif</strong>
                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', fontSize: '13px' }}>Klasifikasi FI/FD otomatis lewat tes GEFT terintegrasi.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', color: '#10b981' }}>📐</span>
              <div>
                <strong style={{ color: '#fff', fontSize: '15px' }}>Eksplorasi AR Interaktif</strong>
                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', fontSize: '13px' }}>Visualisasikan diagram, modus, dan median dalam ruang 3D nyata.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', color: '#10b981' }}>📊</span>
              <div>
                <strong style={{ color: '#fff', fontSize: '15px' }}>Analisis Guru Real-Time</strong>
                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', fontSize: '13px' }}>Dashboard detail bagi Guru untuk memantau kemajuan belajar siswa.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Entry Card */}
        <div style={{ flex: 0.9, minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
          
          <div style={{
            width: '100%', maxWidth: '440px',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '36px 30px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
            
            {/* Form Greetings */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>Portal Siswa 🚀</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '6px 0 0' }}>
                Masukkan identitas Anda untuk memulai perjalanan belajar statistika
              </p>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Nama Lengkap */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                  NAMA LENGKAP SISWA
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '14px', outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* NISN */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                  NISN (NOMOR INDUK SISWA NASIONAL)
                </label>
                <input
                  type="text"
                  placeholder="10 digit angka NISN"
                  value={nisn}
                  maxLength={10}
                  onChange={e => setNisn(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '14px', outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* Kelas Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '6px' }}>
                  PILIH KELAS
                </label>
                <select
                  value={classroomId}
                  onChange={e => setClassroomId(e.target.value)}
                  disabled={loadingClass}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(11,19,41,0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: classroomId ? '#fff' : 'rgba(255,255,255,0.35)',
                    fontSize: '14px', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">— Pilih Kelas —</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0b1329', color: '#fff' }}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Box */}
              {error && (
                <div style={{
                  padding: '12px 14px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171', fontSize: '13px',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleMulaiBelajar}
                disabled={loading}
                style={{
                  width: '100%', padding: '16px',
                  borderRadius: '12px', border: 'none',
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                  color: '#fff', fontSize: '15px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
                  transition: 'all 0.2s',
                  marginTop: '10px'
                }}
              >
                {loading ? 'Memproses Masuk...' : 'Mulai Belajar 🚀'}
              </button>

            </div>

          </div>

        </div>
      </section>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.2); }
        select { appearance: none; }

        @media (max-width: 800px) {
          .home-hero-section {
            flex-direction: column-reverse !important;
            gap: 32px !important;
            padding: 32px 16px 40px !important;
          }
          .home-hero-section > div {
            min-width: 100% !important;
            width: 100% !important;
          }
          .home-hero-h1 {
            font-size: 32px !important;
            letter-spacing: -0.2px !important;
          }
        }

        @media (max-width: 480px) {
          .home-hero-h1 {
            font-size: 26px !important;
          }
          /* Navbar: shrink logo text a bit */
          header span[style*="18px"] {
            font-size: 15px !important;
          }
          /* Navbar: shrink portal guru button */
          header button {
            padding: 7px 12px !important;
            font-size: 12px !important;
          }
          /* Form card: reduce padding */
          .home-form-card {
            padding: 24px 18px !important;
            border-radius: 18px !important;
          }
        }
      `}</style>
    </main>
  )
}