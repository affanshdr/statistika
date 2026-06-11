'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function SiswaPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data) as Student
    setStudent(s)
    if (s.geftStatus === 'not_taken') router.push('/siswa/geft')
  }, [router])

  if (!student) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
      <p style={{ color: '#fff' }}>Loading...</p>
    </main>
  )

  const hasResult = student.geftResult
  const isFI = hasResult?.cognitiveStyle === 'FI'

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #030712 0%, #080f25 50%, #020617 100%)', color: '#f3f4f6', fontFamily: 'var(--font-sans), sans-serif', position: 'relative' }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', right: '-15%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }} />
      </div>

      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(3, 7, 18, 0.65)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '16px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🔬</span>
            <span style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>AR-COGNISTATS</span>
          </div>

          <button
            onClick={() => { localStorage.removeItem('student'); router.push('/') }}
            style={{
              padding: '8px 18px', borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#f87171', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)' }}
          >
            Keluar Sesi
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Profile Card Header */}
        <div className="profile-header-card" style={{
          display: 'flex', gap: '20px', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px', padding: '24px 28px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 800, color: '#fff'
          }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px' }}>DASHBOARD SISWA</span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '2px 0 6px 0', color: '#fff' }}>{student.name}</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Kelas: <strong style={{ color: '#fff' }}>{student.classroom?.name}</strong>
            </p>
          </div>
        </div>

        {/* Two Column Dashboard Grid */}
        <div className="dashboard-grid" style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          
          {/* Left Side: Game Mode */}
          <div className="dashboard-left" style={{ flex: 1.2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* GAME CARD */}
            <div
              onClick={() => router.push('/siswa/game/lobby')}
              className="dashboard-game-card"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,200,255,0.05) 100%)',
                border: '1px solid rgba(0,255,136,0.25)',
                borderRadius: '20px', padding: '24px',
                display: 'flex', gap: '16px', alignItems: 'center',
                cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: '0 4px 30px rgba(0,255,136,0.08)',
                marginBottom: '8px'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,255,136,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,255,136,0.08)' }}
            >
              <div style={{ fontSize: '36px', padding: '14px', background: 'rgba(0,255,136,0.08)', borderRadius: '14px', border: '1px solid rgba(0,255,136,0.15)', flexShrink: 0 }}>🕵️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#00FF88' }}>Digital Truth Squad — Game Mode</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00FF88', background: 'rgba(0,255,136,0.1)', padding: '4px 10px', borderRadius: '50px', border: '1px solid rgba(0,255,136,0.2)' }}>BARU ✨</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: '6px 0 12px' }}>
                  Selidiki klaim viral menggunakan statistika! Game investigasi berbasis gaya kognitifmu.
                </p>
                <button style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: '#00FF88', color: '#000', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  Masuk Lobby →
                </button>
              </div>
            </div>

          </div>

          {/* Right Side: Adaptive Profile Widget */}
          <div className="dashboard-right" style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 className="cognitive-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              🧠 Analisis Gaya Kognitif
            </h3>

            {hasResult ? (
              <div className="cognitive-profile-widget" style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                border: isFI ? '1px solid rgba(37,99,235,0.25)' : '1px solid rgba(6,182,212,0.25)',
                background: isFI
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.02) 100%)',
                padding: '28px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              }}>

                {/* Glow Blob */}
                <div style={{
                  position: 'absolute', top: '-40px', right: '-40px',
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: isFI ? 'rgba(37,99,235,0.15)' : 'rgba(6,182,212,0.15)',
                  filter: 'blur(30px)', pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 800, letterSpacing: '1px',
                      color: isFI ? '#90caf9' : '#80deea',
                      background: isFI ? 'rgba(37,99,235,0.12)' : 'rgba(6,182,212,0.12)',
                      padding: '4px 10px', borderRadius: '50px'
                    }}>
                      HASIL TES GEFT
                    </span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      Skor: <strong>{hasResult.score} / 8</strong>
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: isFI ? '#3b82f6' : '#06b6d4' }}>
                      {isFI ? 'Field Independent (FI)' : 'Field Dependent (FD)'}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
                      {isFI
                        ? 'Anda cenderung analitis dan mandiri. Anda pandai memisahkan bagian-bagian kecil dari latar belakang yang rumit.'
                        : 'Anda memiliki cara pandang yang global dan kontekstual. Anda cenderung memahami masalah secara menyeluruh dan terintegrasi.'
                      }
                    </p>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#fff', marginBottom: '6px' }}>🎯 Cara Belajar Terbaik Anda:</strong>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.45 }}>
                      {isFI ? (
                        <>
                          <li>Melakukan eksplorasi rumus dan simulasi data secara mandiri.</li>
                          <li>Menyukai tantangan logika analisis grafik data kelompok.</li>
                          <li>Memanipulasi koordinat/visual 3D AR secara aktif.</li>
                        </>
                      ) : (
                        <>
                          <li>Belajar dengan studi kasus nyata (kontekstual) yang konkret.</li>
                          <li>Menggunakan petunjuk visual bertahap (*scaffolding*) saat membaca grafik.</li>
                          <li>Bekerja sama dalam diskusi kelompok untuk memecahkan masalah.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

              </div>
            ) : (
              <div className="cognitive-profile-widget" style={{
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                padding: '28px',
                textAlign: 'center',
                display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center'
              }}>
                <span style={{ fontSize: '28px' }}>🧠</span>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>Belum Mengerjakan Tes</h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                    Kerjakan tes GEFT terlebih dahulu untuk menganalisis gaya kognitif Anda dan menyesuaikan materi modul pembelajaran.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/siswa/geft')}
                  style={{
                    padding: '8px 18px', borderRadius: '10px', border: 'none',
                    background: '#3b82f6', color: '#fff', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Mulai Tes GEFT ⏱️
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Interactive hover scale and responsive styles */}
      <style>{`
        .dashboard-game-card {
          transition: all 0.25s;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 20px 16px !important;
            gap: 20px !important;
          }

          .profile-header-card {
            padding: 16px 20px !important;
            gap: 16px !important;
            border-radius: 16px !important;
          }

          .profile-header-card h2 {
            font-size: 20px !important;
          }

          .profile-header-card p {
            font-size: 13px !important;
          }

          .dashboard-grid {
            display: flex;
            flex-direction: column;
            gap: 20px !important;
          }

          /* Use display contents to flatten layout elements and rearrange them on mobile */
          .dashboard-left, .dashboard-right {
            display: contents;
          }

          .dashboard-game-card {
            padding: 16px !important;
            border-radius: 16px !important;
            gap: 12px !important;
          }

          /* Ordering of flat elements */
          .cognitive-title {
            order: 1;
            margin: 0 !important;
          }

          .cognitive-profile-widget {
            order: 2;
            padding: 20px !important;
            border-radius: 16px !important;
          }

          /* Ensure all buttons have touch target optimization */
          button {
            padding-top: 10px !important;
            padding-bottom: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-game-card {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </main>
  )
}