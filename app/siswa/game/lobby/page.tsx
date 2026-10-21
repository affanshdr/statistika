'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * DEPRECATED: Halaman lobby lama telah dihapus dan digantikan oleh
 * Papan Kasus Utama Sekolah (Corkboard Map) di /siswa.
 */
export default function DeprecatedLobbyPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/siswa')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#2B1810',
      color: '#FEF3C7',
      fontFamily: 'sans-serif',
      fontSize: '14px',
    }}>
      Mengalihkan ke Papan Kasus Sekolah...
    </div>
  )
}
