'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Student {
  id: string
  name: string
  nisn: string
  classroom: { name: string }
  geftStatus: 'not_taken' | 'completed'
  geftResult?: {
    score: number
    cognitiveStyle: 'FI' | 'FD'
  } | null
  diagnosticScore?: number | null
  diagnosticLevel?: string | null
  leaderboard?: {
    totalXp: number
  } | null
}

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  updatedAt: string
}

export default function GuruPage() {
  const router = useRouter()
  
  // Passcode gate state
  const [passcode, setPasscode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passcodeError, setPasscodeError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'students' | 'knowledge'>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  
  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingKnowledge, setLoadingKnowledge] = useState(true)

  // Form states for CRUD
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('statistika')
  const [formContent, setFormContent] = useState('')
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('teacher_authorized')
    if (authStatus === 'true') {
      setIsAuthorized(true)
    }
    setCheckingAuth(false)
  }, [])

  // Fetch students data
  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (e) {
      console.error('Error fetching students:', e)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Fetch knowledge data
  const fetchKnowledge = async () => {
    setLoadingKnowledge(true)
    try {
      const res = await fetch('/api/chat/knowledge')
      if (res.ok) {
        const data = await res.json()
        setKnowledgeItems(data)
      }
    } catch (e) {
      console.error('Error fetching knowledge:', e)
    } finally {
      setLoadingKnowledge(false)
    }
  }

  // Fetch dashboard data once authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchStudents()
      fetchKnowledge()
    }
  }, [isAuthorized])

  // Handle Passcode verification
  const handleVerifyPasscode = () => {
    setPasscodeError('')
    // In production, compare securely. For development and LIDM setup, check env or default code:
    const correctCode = 'guru123'
    if (passcode === correctCode) {
      setIsAuthorized(true)
      sessionStorage.setItem('teacher_authorized', 'true')
    } else {
      setPasscodeError('Kata sandi salah. Hubungi administrator!')
    }
  }

  // Handle Log out
  const handleLogout = () => {
    setIsAuthorized(false)
    sessionStorage.removeItem('teacher_authorized')
  }

  // Handle Form Submit (Create / Update)
  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Judul dan Konten wajib diisi!')
      return
    }

    setFormSaving(true)
    try {
      const url = '/api/chat/knowledge'
      const method = isEditing ? 'PUT' : 'POST'
      const bodyData = isEditing 
        ? { id: editingId, title: formTitle, category: formCategory, content: formContent }
        : { title: formTitle, category: formCategory, content: formContent }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (res.ok) {
        // Refresh knowledge list
        await fetchKnowledge()
        // Reset form
        resetForm()
      } else {
        const errData = await res.json()
        setFormError(errData.error || 'Terjadi kesalahan saat menyimpan.')
      }
    } catch (err) {
      setFormError('Gagal terhubung ke server.')
    } finally {
      setFormSaving(false)
    }
  }

  // Edit item trigger
  const handleEditTrigger = (item: KnowledgeItem) => {
    setIsEditing(true)
    setEditingId(item.id)
    setFormTitle(item.title)
    setFormCategory(item.category)
    setFormContent(item.content)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete item trigger
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi RAG ini?')) return
    
    try {
      const res = await fetch(`/api/chat/knowledge?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchKnowledge()
      } else {
        alert('Gagal menghapus materi.')
      }
    } catch (e) {
      alert('Koneksi bermasalah.')
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormTitle('')
    setFormCategory('statistika')
    setFormContent('')
    setFormError('')
  }

  if (checkingAuth) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EE' }}>
        <p style={{ color: '#1C1917' }}>Memuat Portal...</p>
      </main>
    )
  }

  // Passcode gate UI
  if (!isAuthorized) {
    return (
      <main style={{
        minHeight: '100vh',
        background: '#FAF6EE',
        color: '#1C1917',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        padding: '20px'
      }}>
        {/* Background Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(217,119,6,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(217,119,6, 0.25)',
            boxShadow: '0 0 40px rgba(217,119,6, 0.15)',
            width: '100%',
            maxWidth: '400px',
            padding: '36px 30px',
            zIndex: 1,
            position: 'relative'
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none', border: 'none', color: '#A8A29E',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex',
              alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#D97706'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← Kembali ke Menu Utama
          </button>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>🧑‍🏫</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>Portal Otoritas Guru</h2>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#A8A29E' }}>
              Silakan masukkan sandi otentikasi guru untuk masuk.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#A8A29E', letterSpacing: '2px', marginBottom: '8px' }}>
                KATA SANDI PORTAL
              </label>
              <input
                type="password"
                placeholder="Masukkan sandi..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyPasscode()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 16px', borderRadius: '12px',
                  background: 'rgba(217,119,6,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#1C1917', fontSize: '14px', outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#D97706'}
                onBlur={e => e.target.style.borderColor = 'rgba(180,140,80,0.15)'}
              />
            </div>

            {passcodeError && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', fontSize: '13px', lineHeight: 1.5
              }}>
                ⚠️ {passcodeError}
              </div>
            )}

            <button
              onClick={handleVerifyPasscode}
              style={{
                width: '100%', padding: '16px',
                borderRadius: '14px', border: 'none',
                background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
                color: '#000', fontSize: '15px', fontWeight: 900,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(217,119,6,0.3)',
                transition: 'all 0.2s',
              }}
            >
              Masuk Dashboard 🚀
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  // Dashboard Main UI
  return (
    <main style={{
      minHeight: '100vh',
      background: '#FAF6EE',
      color: '#f3f4f6',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      paddingBottom: '80px',
      position: 'relative'
    }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(217,119,6,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', top: '0%', left: '0%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.03) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '0%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Header bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,246,238,0.96)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(217,119,6,0.14)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🕵️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 900, background: 'linear-gradient(90deg, #D97706, #EA580C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Skeptikos Control Panel
              </h1>
              <span style={{ fontSize: '9px', color: '#A8A29E', letterSpacing: '1px', fontWeight: 700 }}>PORTAL GURU</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(217,119,6,0.04)',
                color: '#44403C', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,140,80,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,119,6,0.04)'}
            >
              Menu Utama
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.05)',
                color: '#ff6b6b', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
            >
              Keluar Sesi
            </button>
          </div>

        </div>
      </header>

      {/* Main dashboard content container */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Banner info */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Dashboard Pendidik</h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#78716C' }}>
            Kelola data siswa, pantau hasil diagnostik, serta konfigurasi pangkalan pengetahuan untuk RAG Chatbot DiRA.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1px', marginBottom: '32px', gap: '16px' }}>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '12px 16px', border: 'none', background: 'none',
              color: activeTab === 'students' ? '#D97706' : 'rgba(255,255,255,0.4)',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              position: 'relative', transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
          >
            📊 Pemantauan Siswa ({students.length})
            {activeTab === 'students' && (
              <motion.div layoutId="activeTabUnderline" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', background: '#D97706' }} />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('knowledge')}
            style={{
              padding: '12px 16px', border: 'none', background: 'none',
              color: activeTab === 'knowledge' ? '#D97706' : 'rgba(255,255,255,0.4)',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              position: 'relative', transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
          >
            📚 Kelola Pengetahuan Chatbot (RAG) ({knowledgeItems.length})
            {activeTab === 'knowledge' && (
              <motion.div layoutId="activeTabUnderline" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', background: '#D97706' }} />
            )}
          </button>
        </div>

        {/* TAB CONTENT: STUDENTS */}
        {activeTab === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {loadingStudents ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#A8A29E' }}>
                Memuat data siswa...
              </div>
            ) : students.length === 0 ? (
              <div style={{
                background: 'rgba(217,119,6,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
                padding: '48px', borderRadius: '16px', textAlign: 'center', color: '#A8A29E'
              }}>
                Belum ada siswa yang mendaftar di sistem ini.
              </div>
            ) : (
              <div style={{
                background: 'rgba(12, 16, 28, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                overflowX: 'auto',
                boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(217,119,6,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#A8A29E' }}>
                      <th style={{ padding: '16px 20px' }}>Nama Siswa</th>
                      <th style={{ padding: '16px 20px' }}>Kelas</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center' }}>Gaya Kognitif</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center' }}>Skor GEFT</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center' }}>Diagnostik</th>
                      <th style={{ padding: '16px 20px', textAlign: 'right' }}>Total XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const cognitiveStyle = student.geftResult?.cognitiveStyle
                      const score = student.geftResult?.score
                      const isFI = cognitiveStyle === 'FI'
                      
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} className="student-row">
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: '#1C1917' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isFI ? 'rgba(59,130,246,0.1)' : cognitiveStyle ? 'rgba(6,182,212,0.1)' : 'rgba(180,140,80,0.1)',
                                color: isFI ? '#2563EB' : cognitiveStyle ? '#22d3ee' : 'rgba(255,255,255,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800,
                                border: `1px solid ${isFI ? 'rgba(59,130,246,0.2)' : cognitiveStyle ? 'rgba(6,182,212,0.2)' : 'rgba(180,140,80,0.15)'}`
                              }}>
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#57534E' }}>
                            {student.classroom?.name || '—'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            {cognitiveStyle ? (
                              <span style={{
                                display: 'inline-flex', padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 800,
                                background: isFI ? 'rgba(59,130,246,0.1)' : 'rgba(6,182,212,0.1)',
                                border: `1px solid ${isFI ? 'rgba(59,130,246,0.25)' : 'rgba(6,182,212,0.25)'}`,
                                color: isFI ? '#1D4ED8' : '#22d3ee'
                              }}>
                                {isFI ? '🧠 Field Independent (FI)' : '👥 Field Dependent (FD)'}
                              </span>
                            ) : (
                              <span style={{ color: '#A8A29E' }}>Belum Tes</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 700, fontFamily: 'monospace', color: '#1C1917' }}>
                            {score !== undefined && score !== null ? `${score} / 18` : '—'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            {student.diagnosticLevel ? (
                              <span style={{
                                display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                                background: student.diagnosticLevel === 'tinggi' ? 'rgba(16,185,129,0.08)' : student.diagnosticLevel === 'sedang' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                                border: `1px solid ${student.diagnosticLevel === 'tinggi' ? 'rgba(16,185,129,0.2)' : student.diagnosticLevel === 'sedang' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: student.diagnosticLevel === 'tinggi' ? '#34d399' : student.diagnosticLevel === 'sedang' ? '#fbbf24' : '#f87171',
                                textTransform: 'capitalize'
                              }}>
                                {student.diagnosticLevel} ({student.diagnosticScore || 0})
                              </span>
                            ) : (
                              <span style={{ color: '#A8A29E' }}>Belum Tes</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: '#D97706', fontFamily: "'Geist Mono', monospace" }}>
                            {student.leaderboard?.totalXp !== undefined ? `${student.leaderboard.totalXp} XP` : '0 XP'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <style>{`
              .student-row:hover { background: rgba(255,255,255,0.015); }
            `}</style>
          </div>
        )}

        {/* TAB CONTENT: KNOWLEDGE CRUD */}
        {activeTab === 'knowledge' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px', alignItems: 'start' }}>
            <style>{`
              @media (max-width: 850px) {
                div[style*="display: grid"] { grid-template-columns: 1fr !important; }
              }
            `}</style>

            {/* Left Column: Form (Create/Update) */}
            <div style={{
              background: 'rgba(12, 16, 28, 0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '24px',
              position: 'sticky',
              top: '90px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{isEditing ? '📝 Edit Pengetahuan' : '✨ Tambah Pengetahuan'}</span>
              </h3>

              <form onSubmit={handleSaveKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#A8A29E', letterSpacing: '1.5px', marginBottom: '8px' }}>
                    JUDUL MATERI / KONTEKS
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ukuran Penyebaran Data..."
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 14px', borderRadius: '10px',
                      background: 'rgba(217,119,6,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#1C1917', fontSize: '13px', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#D97706'}
                    onBlur={e => e.target.style.borderColor = 'rgba(180,140,80,0.15)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#A8A29E', letterSpacing: '1.5px', marginBottom: '8px' }}>
                    KATEGORI
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 14px', borderRadius: '10px',
                      background: 'rgba(11,14,25,0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#1C1917', fontSize: '13px', outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="statistika">Statistika (Materi Pembelajaran)</option>
                    <option value="gameplay">Gameplay (Petunjuk Game Skeptikos)</option>
                    <option value="umum">Umum / Profil Gaya Kognitif</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#A8A29E', letterSpacing: '1.5px', marginBottom: '8px' }}>
                    KONTEN PENGETAHUAN (RAG TEXT)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tuliskan materi statistika detail yang akan dirujuk oleh AI Chatbot. Gunakan kalimat yang lugas dan informatif..."
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 14px', borderRadius: '10px',
                      background: 'rgba(217,119,6,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#1C1917', fontSize: '13px', outline: 'none',
                      fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5
                    }}
                    onFocus={e => e.target.style.borderColor = '#D97706'}
                    onBlur={e => e.target.style.borderColor = 'rgba(180,140,80,0.15)'}
                  />
                </div>

                {formError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171', fontSize: '13px', lineHeight: 1.5
                  }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        flex: 1, padding: '12px',
                        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#1C1917', fontSize: '13px',
                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,140,80,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={formSaving}
                    style={{
                      flex: 2, padding: '12px',
                      borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
                      color: '#000', fontSize: '13px', fontWeight: 900,
                      cursor: formSaving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {formSaving ? 'Menyimpan...' : 'Simpan Materi 💾'}
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Knowledge items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Daftar Dokumen RAG saat ini</h3>

              {loadingKnowledge ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#A8A29E' }}>
                  Memuat data pangkalan pengetahuan RAG...
                </div>
              ) : knowledgeItems.length === 0 ? (
                <div style={{
                  background: 'rgba(217,119,6,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
                  padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#A8A29E'
                }}>
                  Belum ada dokumen yang tersimpan. Sistem akan otomatis mengisi data default pada percakapan pertama siswa.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {knowledgeItems.map((item) => {
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: 'rgba(12, 16, 28, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '16px',
                          padding: '20px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <div>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800,
                              background: item.category === 'statistika' ? 'rgba(59,130,246,0.1)' : item.category === 'gameplay' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              border: `1px solid ${item.category === 'statistika' ? 'rgba(59,130,246,0.2)' : item.category === 'gameplay' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                              color: item.category === 'statistika' ? '#2563EB' : item.category === 'gameplay' ? '#34d399' : '#fbbf24',
                              textTransform: 'uppercase', marginBottom: '8px'
                            }}>
                              {item.category}
                            </span>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>{item.title}</h4>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditTrigger(item)}
                              style={{
                                border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.03)',
                                color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', fontWeight: 700,
                                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#fff' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)' }}
                            >
                              Edit ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteKnowledge(item.id)}
                              style={{
                                border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)',
                                color: '#f87171', fontSize: '11px', fontWeight: 700,
                                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                            >
                              Hapus 🗑️
                            </button>
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '12.5px', color: '#78716C', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                          {item.content}
                        </p>
                        
                        <div style={{ fontSize: '9px', color: '#A8A29E', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px', textAlign: 'right' }}>
                          Diperbarui: {new Date(item.updatedAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </main>
  )
}