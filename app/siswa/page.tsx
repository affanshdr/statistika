'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SiswaDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAF6EE',
      fontFamily: 'sans-serif',
      color: '#78716C',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 600 }}>Mengalihkan ke beranda...</p>
      </div>
    </div>
  )
}