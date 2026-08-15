'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'

type Student = {
  id: string
  name: string
  nisn: string
  geftStatus: 'not_taken' | 'completed'
  classroom: { name: string }
  diagnosticScore?: number | null
  diagnosticLevel?: string | null
  geftResult?: {
    score: number
    cognitiveStyle: 'FI' | 'FD'
  }
}

function VideoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromLevel = searchParams.get('fromLevel')
  
  const [student, setStudent] = useState<Student | null>(null)
  const [isFI, setIsFI] = useState(false)
  const [loading, setLoading] = useState(true)

  const { resetLevel, startLevel } = useGameStore()

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) {
      router.push('/')
      return
    }
    const s = JSON.parse(data) as Student
    setStudent(s)
    setIsFI(s.geftResult?.cognitiveStyle === 'FI')
    setLoading(false)
  }, [router])

  const handleVideoComplete = () => {
    localStorage.setItem('has_watched_video', 'true')
    
    if (fromLevel && student) {
      const levelId = parseInt(fromLevel, 10)
      const activeStyle = student.geftResult?.cognitiveStyle || 'FD'
      
      // Initialize level and proceed directly to game
      resetLevel()
      startLevel(levelId, activeStyle)
      router.push(`/siswa/game/level/${levelId}`)
    } else {
      // Go back to student dashboard
      router.push('/siswa')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020617' }}>
        <div style={{ color: '#00ADB5', fontWeight: 800, fontSize: '18px', letterSpacing: '1px' }} className="loading-text">
          MEMUAT HALAMAN VIDEO...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #0c1220 50%, #030712 100%)',
      color: '#F8FAFC',
      fontFamily: 'var(--font-sans), sans-serif',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: isFI 
          ? 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(0,0,0,0) 70%)' 
          : 'radial-gradient(circle, rgba(14, 131, 136, 0.12) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Floating Back Navigation Button */}
      <button 
        onClick={() => router.push('/siswa')}
        className="back-btn"
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '50px',
          background: 'rgba(15, 32, 48, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#94A3B8',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          marginBottom: '24px',
          zIndex: 10
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali ke Dashboard
      </button>

      {/* Main Video Card Container */}
      <div 
        className="video-card"
        style={{
          background: 'rgba(15, 35, 56, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isFI ? 'rgba(59, 130, 246, 0.3)' : 'rgba(14, 131, 136, 0.25)'}`,
          borderRadius: '24px',
          padding: '24px md:32px',
          width: '100%',
          maxWidth: '840px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(14, 131, 136, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          zIndex: 5,
          position: 'relative'
        }}
      >
        {/* Header inside card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isFI ? 'rgba(37, 99, 235, 0.15)' : 'rgba(14, 131, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🎥
            </div>
            <div>
              <div style={{ fontSize: '10px', color: isFI ? '#60A5FA' : '#00ADB5', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                VIDEO PEMBELAJARAN
              </div>
              <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                Mean, Median, & Modus Data Kelompok
              </h1>
            </div>
          </div>
        </div>

        {/* Video Player Box with exact 16:9 ratio */}
        <div style={{
          width: '100%',
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            src="https://www.youtube.com/embed/UqWLcTirNjU"
            title="Video Pembelajaran Statistika"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        {/* Description section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '18px 20px',
          fontSize: '13.5px',
          color: '#94A3B8',
          lineHeight: 1.6
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 700, color: '#F8FAFC' }}>📝 Petunjuk Pembelajaran:</p>
          Tonton video pembelajaran dari channel <strong>Matematika Hebat</strong> di atas untuk memahami dasar-dasar perhitungan statistika deskriptif pada data kelompok sebelum kamu memulai investigasi kasus!
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Pahami cara mencari <strong>Mean (Rata-rata)</strong> dengan nilai tengah kelas.</li>
            <li>Pelajari rumus <strong>Median (Nilai Tengah)</strong> dan letak interval median.</li>
            <li>Ketahui cara menentukan <strong>Modus</strong> menggunakan tepi bawah dan selisih frekuensi.</li>
          </ul>
        </div>

        {/* Action Completion Button */}
        <button
          onClick={handleVideoComplete}
          className="complete-btn"
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: isFI 
              ? 'linear-gradient(90deg, #2563eb, #1d4ed8)' 
              : 'linear-gradient(90deg, #0e8388, #00adb5)',
            border: 'none',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            boxShadow: isFI ? '0 4px 20px rgba(37,99,235,0.3)' : '0 4px 20px rgba(14, 131, 136, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>✅ Selesai Menonton & Simpan Progress</span>
        </button>
      </div>

      {/* Styled styles for hover/animations */}
      <style>{`
        .back-btn:hover {
          color: #FFF !important;
          background: rgba(15, 32, 48, 1) !important;
          border-color: ${isFI ? 'rgba(59,130,246,0.5)' : 'rgba(14, 131, 136, 0.5)'} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
        .back-btn:active {
          transform: translateY(0);
        }
        .complete-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
          box-shadow: ${isFI 
            ? '0 6px 24px rgba(37,99,235,0.45)' 
            : '0 6px 24px rgba(14, 131, 136, 0.45)'} !important;
        }
        .complete-btn:active {
          transform: translateY(0);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .loading-text {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020617' }}>
        <div style={{ color: '#00ADB5', fontWeight: 800, fontSize: '18px', letterSpacing: '1px' }}>
          MEMUAT HALAMAN...
        </div>
      </div>
    }>
      <VideoContent />
    </Suspense>
  )
}
