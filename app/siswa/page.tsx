'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string
  nisn: string
  geftStatus: 'not_taken' | 'completed'
  classroom: { name: string }
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
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1b3d' }}>
      <p style={{ color: '#fff' }}>Loading...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0f1b3d', padding: '32px 24px', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 4 }}>Halo, {student.name} 👋</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Kelas {student.classroom?.name} &middot; NISN {student.nisn}</p>
      <hr style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Konten pembelajaran — Coming Soon</p>
      <button
        onClick={() => { localStorage.removeItem('student'); router.push('/') }}
        style={{ marginTop: 32, padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
      >
        Keluar
      </button>
    </main>
  )
}