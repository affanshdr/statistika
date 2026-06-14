'use client'

import { useRouter } from 'next/navigation'

export default function GuruPage() {
  const router = useRouter()
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F', position: 'relative' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'absolute', top: '24px', left: '24px',
          padding: '8px 16px', borderRadius: '10px',
          border: '1px solid rgba(0,255,136,0.2)',
          background: 'rgba(0,255,136,0.05)',
          color: '#00FF88', fontSize: '13px', fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: '0 0 10px rgba(0,255,136,0.1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,255,136,0.12)'
          e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,136,0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0,255,136,0.05)'
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,136,0.1)'
        }}
      >
        ← Kembali ke Halaman Utama
      </button>
      <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading), sans-serif', fontSize: '32px', margin: 0 }}>Hello, Guru! 🧑‍🏫</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '12px', fontSize: '14px' }}>Portal Guru sedang dalam tahap pengembangan.</p>
    </main>
  )
}