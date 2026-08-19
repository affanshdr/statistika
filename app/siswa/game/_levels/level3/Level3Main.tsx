'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Level3MainProps {
  cognitiveStyle: 'FI' | 'FD'
  studentId?: string
  studentName?: string
  demoMode?: boolean
}

export default function Level3Main({
  cognitiveStyle,
  studentId,
  studentName,
  demoMode = false,
}: Level3MainProps) {
  const router = useRouter()

  return (
    <div
      className="game-root"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--game-card)',
          border: '1px solid var(--game-border)',
          borderRadius: '20px',
          padding: '40px 32px',
          maxWidth: '520px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontSize: '56px' }}>🚧</div>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>
          Level 3 — Ukuran Pemusatan &amp; Penyebaran
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Modul Level 3 ({cognitiveStyle} Path) sedang dalam tahap pengembangan akhir.
          Silakan periksa kembali beberapa saat lagi!
        </p>
        <button
          className="game-btn game-btn-primary"
          onClick={() => router.push('/siswa')}
          style={{ marginTop: '12px' }}
        >
          Kembali ke Dashboard Siswa
        </button>
      </motion.div>
    </div>
  )
}
