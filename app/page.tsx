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
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f1b3d 0%, #1a2f5e 50%, #0d2247 100%)' }}>

      {/* Background decorative blobs */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,139,253,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,210,255,0.1) 0%, transparent 70%)',
        }} />
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '36px 28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}>

        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2196f3, #00bcd4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
          }}>🔬</div>
          <div>
            <div style={{
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 800, fontSize: '18px',
              color: '#fff', letterSpacing: '1px', lineHeight: 1.1
            }}>AR-<br />COGNISTATS</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1.5px', marginTop: '2px' }}>
              PLATFORM PEMBELAJARAN STATISTIKA SMA
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Selamat Datang! 👋</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
            Masuk untuk mulai belajar statistika dengan Augmented Reality
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Nama */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '6px' }}>
              NAMA LENGKAP
            </label>
            <input
              type="text"
              placeholder="Contoh: Andi Pratama"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '13px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          {/* NISN */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '6px' }}>
              NISN
            </label>
            <input
              type="text"
              placeholder="10 digit NISN kamu"
              value={nisn}
              maxLength={10}
              onChange={e => setNisn(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '13px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          {/* Kelas */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '6px' }}>
              KELAS
            </label>
            <select
              value={classroomId}
              onChange={e => setClassroomId(e.target.value)}
              disabled={loadingClass}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '13px 16px', borderRadius: '12px',
                background: 'rgba(30,50,100,0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: classroomId ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: '14px', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">— Pilih Kelas —</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1a2f5e', color: '#fff' }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(255,80,80,0.15)',
              border: '1px solid rgba(255,80,80,0.3)',
              color: '#ff8080', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          {/* Tombol Mulai Belajar */}
          <button
            onClick={handleMulaiBelajar}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              borderRadius: '14px', border: 'none',
              background: loading ? 'rgba(33,150,243,0.5)' : 'linear-gradient(90deg, #2196f3, #00bcd4)',
              color: '#fff', fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(33,150,243,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Memproses...' : '🚀 Mulai Belajar'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>atau</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Tombol Guru */}
          <button
            onClick={() => router.push('/guru')}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            🧑‍🏫 Masuk sebagai Guru
          </button>

        </div>
      </div>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800&display=swap');
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus, select:focus { border-color: rgba(33,150,243,0.6) !important; box-shadow: 0 0 0 3px rgba(33,150,243,0.15); }
      `}</style>
    </main>
  )
}