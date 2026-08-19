'use client'

import { useEffect, useState, useCallback, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LkpdWorksheet from '../siswa/game/_levels/level2/components/LkpdWorksheet'

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────
interface Classroom {
  id: string
  name: string
  grade: string
  major: string
  totalStudents: number
  fiCount: number
  fdCount: number
}

interface Student {
  id: string
  name: string
  nisn: string
  classroomId: string
  classroom: { id: string; name: string }
  geftStatus: 'not_taken' | 'completed'
  geftResult?: { score: number; cognitiveStyle: 'FI' | 'FD' } | null
  diagnosticScore?: number | null
  diagnosticLevel?: string | null
  leaderboard?: { totalXp: number } | null
  gameSessions?: { xpEarned: number; createdAt: string; lkpdCompleted?: boolean; lkpdAnswers?: any }[]
  createdAt?: string
}

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  updatedAt: string
}

interface PreVsPostEntry {
  id: string
  name: string
  classroomName: string
  classroomId: string
  cognitiveStyle: 'FI' | 'FD' | null
  preScore: number | null
  postScore: number | null
  gain: number | null
  totalSessions: number
  lastActivityAt: string
  daysSinceActivity?: number
}

interface LevelStat {
  levelId: number
  label: string
  total: number
  correct: number
  incorrect: number
  errorRate: number
  avgTimeSec: number
  topWrongAnswers: { answer: string; count: number }[]
}

interface AnalysisData {
  preVsPost: PreVsPostEntry[]
  levelAnalysis: LevelStat[]
  stuckStudents: (PreVsPostEntry & { daysSinceActivity: number })[]
  stuckDays: number
  totalStudents: number
  generatedAt: string
}

// ─────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
)
const IconKelas = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)

const IconModul = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
)
const IconBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M9 13h.01M15 13h.01M9 17h6" />
  </svg>
)
const IconKeluar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
)
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
)
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
)
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
)
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)


const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>
)
const IconAnalysis = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
)
const IconAlertOctagon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
)
const IconTrendUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
)
const IconTrendDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
)

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function GuruPage() {
  const router = useRouter()

  // Auth
  const [passcode, setPasscode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passcodeError, setPasscodeError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Tabs
  type Tab = 'dashboard' | 'manajemen-kelas' | 'modul-ajar' | 'chatbot-rag' | 'analisis'
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Modul Ajar states
  interface ModulAjarData {
    id: string
    title: string
    subject: string
    grade: string
    topic: string
    duration: string
    session: string
    content: string
    createdAt: string
    updatedAt: string
  }
  const [modulList, setModulList] = useState<ModulAjarData[]>([])
  const [loadingModul, setLoadingModul] = useState(true)
  const [selectedModul, setSelectedModul] = useState<ModulAjarData | null>(null)

  // Data
  const [students, setStudents] = useState<Student[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])

  // Loading
  const [loadingClassrooms, setLoadingClassrooms] = useState(true)
  const [loadingKnowledge, setLoadingKnowledge] = useState(true)



  // Manajemen Kelas
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [classStudents, setClassStudents] = useState<Student[]>([])
  const [loadingClassStudents, setLoadingClassStudents] = useState(false)
  const [classStudentSearch, setClassStudentSearch] = useState('')

  // Class Modal
  const [showClassModal, setShowClassModal] = useState(false)
  const [classModalMode, setClassModalMode] = useState<'create' | 'edit'>('create')
  const [classModalId, setClassModalId] = useState<string | null>(null)
  const [classModalName, setClassModalName] = useState('')
  const [classModalGrade, setClassModalGrade] = useState('-')
  const [classModalMajor, setClassModalMajor] = useState('-')
  const [classModalSaving, setClassModalSaving] = useState(false)
  const [classModalError, setClassModalError] = useState('')

  // Move Student Modal
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveStudentId, setMoveStudentId] = useState<string | null>(null)
  const [moveStudentName, setMoveStudentName] = useState('')
  const [moveTargetClassId, setMoveTargetClassId] = useState('')
  const [moveSaving, setMoveSaving] = useState(false)

  // LKPD Viewer Modal
  const [showLkpdModal, setShowLkpdModal] = useState(false)
  const [viewingLkpdStudent, setViewingLkpdStudent] = useState<Student | null>(null)
  const [viewingLkpdAnswers, setViewingLkpdAnswers] = useState<any>(null)

  const openViewLkpd = (s: Student, answers: any) => {
    setViewingLkpdStudent(s)
    setViewingLkpdAnswers(answers)
    setShowLkpdModal(true)
  }



  // RAG Knowledge (modul-ajar)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('statistika')
  const [formContent, setFormContent] = useState('')
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  // Analisis (fitur 6-7-8)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [stuckDays, setStuckDays] = useState(3)
  const [analysisClassFilter, setAnalysisClassFilter] = useState('semua')
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  // ── AUTH ──
  useEffect(() => {
    const authStatus = sessionStorage.getItem('teacher_authorized')
    startTransition(() => {
      if (authStatus === 'true') setIsAuthorized(true)
      setCheckingAuth(false)
    })
  }, [])

  // ── FETCH DATA ──
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students')
      if (res.ok) setStudents(await res.json())
    } catch (e) { console.error(e) }
  }, [])

  const fetchClassrooms = useCallback(async () => {
    setLoadingClassrooms(true)
    try {
      const res = await fetch('/api/classrooms')
      if (res.ok) setClassrooms(await res.json())
    } catch (e) { console.error(e) } finally { setLoadingClassrooms(false) }
  }, [])

  const fetchKnowledge = useCallback(async () => {
    setLoadingKnowledge(true)
    try {
      const res = await fetch('/api/chat/knowledge')
      if (res.ok) setKnowledgeItems(await res.json())
    } catch (e) { console.error(e) } finally { setLoadingKnowledge(false) }
  }, [])

  const fetchModulList = useCallback(async () => {
    setLoadingModul(true)
    try {
      const res = await fetch('/api/guru/modul')
      if (res.ok) setModulList(await res.json())
    } catch (e) { console.error(e) } finally { setLoadingModul(false) }
  }, [])

  const fetchClassStudents = useCallback(async (classId: string) => {
    setLoadingClassStudents(true)
    try {
      const res = await fetch(`/api/students?classroomId=${classId}`)
      if (res.ok) setClassStudents(await res.json())
    } catch (e) { console.error(e) } finally { setLoadingClassStudents(false) }
  }, [])

  const fetchAnalysis = useCallback(async (classId?: string, days?: number) => {
    setLoadingAnalysis(true)
    try {
      const params = new URLSearchParams()
      if (classId && classId !== 'semua') params.set('classroomId', classId)
      params.set('stuckDays', String(days ?? stuckDays))
      const res = await fetch(`/api/guru/analysis?${params}`)
      if (res.ok) {
        const data = await res.json()
        startTransition(() => setAnalysisData(data))
      }
    } catch (e) { console.error(e) } finally { setLoadingAnalysis(false) }
  }, [stuckDays])

  useEffect(() => {
    if (isAuthorized && activeTab === 'analisis') {
      startTransition(() => {
        fetchAnalysis(analysisClassFilter, stuckDays)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, activeTab])

  useEffect(() => {
    if (isAuthorized) {
      startTransition(() => {
        fetchStudents()
        fetchClassrooms()
        fetchKnowledge()
        fetchModulList()
      })
    }
  }, [isAuthorized, fetchStudents, fetchClassrooms, fetchKnowledge, fetchModulList])



  useEffect(() => {
    if (selectedClassId) startTransition(() => { fetchClassStudents(selectedClassId) })
  }, [selectedClassId, fetchClassStudents])

  // ── AUTH HANDLERS ──
  const handleVerifyPasscode = () => {
    if (passcode === 'guru123') {
      setIsAuthorized(true)
      sessionStorage.setItem('teacher_authorized', 'true')
    } else {
      setPasscodeError('Kata sandi salah. Hubungi administrator!')
    }
  }
  const handleLogout = () => {
    setIsAuthorized(false)
    sessionStorage.removeItem('teacher_authorized')
  }



  // ── CLASS CRUD ──
  const openCreateClass = () => {
    setClassModalMode('create')
    setClassModalId(null)
    setClassModalName('')
    setClassModalGrade('-')
    setClassModalMajor('-')
    setClassModalError('')
    setShowClassModal(true)
  }
  const openEditClass = (cls: Classroom) => {
    setClassModalMode('edit')
    setClassModalId(cls.id)
    setClassModalName(cls.name)
    setClassModalGrade(cls.grade)
    setClassModalMajor(cls.major)
    setClassModalError('')
    setShowClassModal(true)
  }
  const handleSaveClass = async () => {
    if (!classModalName.trim()) { setClassModalError('Nama kelas wajib diisi'); return }
    setClassModalSaving(true)
    setClassModalError('')
    try {
      const url = '/api/classrooms'
      const method = classModalMode === 'create' ? 'POST' : 'PUT'
      const body = classModalMode === 'create'
        ? { name: classModalName, grade: classModalGrade, major: classModalMajor }
        : { id: classModalId, name: classModalName, grade: classModalGrade, major: classModalMajor }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        await fetchClassrooms()
        setShowClassModal(false)
      } else {
        const err = await res.json()
        setClassModalError(err.error || 'Terjadi kesalahan')
      }
    } catch { setClassModalError('Koneksi bermasalah') } finally { setClassModalSaving(false) }
  }
  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Hapus kelas "${name}"? Kelas harus kosong (tidak ada siswa) untuk bisa dihapus.`)) return
    const res = await fetch(`/api/classrooms?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchClassrooms()
      if (selectedClassId === id) setSelectedClassId(null)
    } else {
      const err = await res.json()
      alert(err.error || 'Gagal menghapus kelas')
    }
  }

  // ── STUDENT CRUD ──
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Hapus siswa "${name}" beserta semua data progressnya? Tindakan ini tidak bisa dibatalkan.`)) return
    const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchStudents()
      if (selectedClassId) await fetchClassStudents(selectedClassId)
      await fetchClassrooms()
    } else {
      const err = await res.json()
      alert(err.error || 'Gagal menghapus siswa')
    }
  }
  const openMoveStudent = (student: Student) => {
    setMoveStudentId(student.id)
    setMoveStudentName(student.name)
    setMoveTargetClassId('')
    setShowMoveModal(true)
  }
  const handleMoveStudent = async () => {
    if (!moveTargetClassId || !moveStudentId) return
    setMoveSaving(true)
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: moveStudentId, classroomId: moveTargetClassId }),
      })
      if (res.ok) {
        await fetchStudents()
        if (selectedClassId) await fetchClassStudents(selectedClassId)
        await fetchClassrooms()
        setShowMoveModal(false)
      } else {
        alert('Gagal memindahkan siswa')
      }
    } catch { alert('Koneksi bermasalah') } finally { setMoveSaving(false) }
  }

  // ── RAG CRUD ──
  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!formTitle.trim() || !formContent.trim()) { setFormError('Judul dan Konten wajib diisi!'); return }
    setFormSaving(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing ? { id: editingId, title: formTitle, category: formCategory, content: formContent } : { title: formTitle, category: formCategory, content: formContent }
      const res = await fetch('/api/chat/knowledge', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { await fetchKnowledge(); resetForm() } else { const err = await res.json(); setFormError(err.error || 'Terjadi kesalahan') }
    } catch { setFormError('Gagal terhubung ke server') } finally { setFormSaving(false) }
  }
  const handleEditTrigger = (item: KnowledgeItem) => {
    setIsEditing(true); setEditingId(item.id); setFormTitle(item.title); setFormCategory(item.category); setFormContent(item.content)
  }
  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Hapus materi RAG ini?')) return
    const res = await fetch(`/api/chat/knowledge?id=${id}`, { method: 'DELETE' })
    if (res.ok) fetchKnowledge(); else alert('Gagal menghapus materi')
  }
  const resetForm = () => { setIsEditing(false); setEditingId(null); setFormTitle(''); setFormCategory('statistika'); setFormContent(''); setFormError('') }

  // ── STATS HELPERS ──
  const getStudentStageStatus = (s: Student): 'selesai' | 'geft-pending' | 'diagnostic-pending' | 'awal' => {
    if (s.geftStatus === 'completed' && s.geftResult && s.diagnosticScore !== null && s.diagnosticScore !== undefined) return 'selesai'
    if (s.geftStatus === 'completed' && s.geftResult) return 'diagnostic-pending'
    if (s.geftStatus === 'not_taken') return 'geft-pending'
    return 'awal'
  }
  const totalSelesai = students.filter(s => getStudentStageStatus(s) === 'selesai').length
  const totalStuck = students.filter(s => getStudentStageStatus(s) !== 'selesai').length
  const totalFI = students.filter(s => s.geftResult?.cognitiveStyle === 'FI').length
  const totalFD = students.filter(s => s.geftResult?.cognitiveStyle === 'FD').length
  const totalWithGeft = totalFI + totalFD

  // ── EXPORT CSV ──
  const handleExportCSV = (dataStudents: Student[]) => {
    const header = 'Nama,NISN,Kelas,Status Tahap,Gaya Kognitif,Skor GEFT,Skor Diagnostik,Level Diagnostik,Total XP'
    const rows = dataStudents.map(s => [
      s.name,
      s.nisn,
      s.classroom?.name || '-',
      getStudentStageStatus(s),
      s.geftResult?.cognitiveStyle || '-',
      s.geftResult?.score ?? '-',
      s.diagnosticScore ?? '-',
      s.diagnosticLevel || '-',
      s.leaderboard?.totalXp ?? 0,
    ].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rekap_siswa_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`
    link.click()
  }


  // ─────────────────────────────────────────────
  // LOADING / AUTH GATES
  // ─────────────────────────────────────────────
  if (checkingAuth) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EE' }}>
      <p style={{ color: '#8F4F06', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Memuat Portal...</p>
    </main>
  )

  if (!isAuthorized) return (
    <main style={{ minHeight: '100vh', background: '#E5F3F4', color: '#1C1917', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(85,183,180,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid rgba(85,183,180,0.25)', boxShadow: '0 10px 40px rgba(56,123,126,0.08)', width: '100%', maxWidth: '400px', padding: '36px 30px', zIndex: 1, position: 'relative' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#387B7E', cursor: 'pointer', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>← Kembali ke Menu Utama</button>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(85,183,180,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '28px' }}>🧑‍🏫</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#387B7E', fontFamily: 'var(--font-heading)' }}>Portal Otoritas Guru</h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#78716C' }}>Masukkan sandi otentikasi guru untuk masuk.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#78716C', letterSpacing: '1px', marginBottom: '8px' }}>KATA SANDI PORTAL</label>
            <input type="password" placeholder="Masukkan sandi..." value={passcode} onChange={e => setPasscode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerifyPasscode()} style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '12px', background: '#F3F8F9', border: '1px solid rgba(85,183,180,0.35)', color: '#1C1917', fontSize: '14px', outline: 'none' }} />
          </div>
          {passcodeError && <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: '13px' }}>⚠️ {passcodeError}</div>}
          <button onClick={handleVerifyPasscode} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#387B7E', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>Masuk Dashboard</button>
        </div>
      </motion.div>
    </main>
  )

  // ─────────────────────────────────────────────
  // MAIN LAYOUT
  // ─────────────────────────────────────────────
  const stuckCount = analysisData?.stuckStudents.length ?? 0
  const sidebarItems: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { key: 'manajemen-kelas', label: 'Manajemen Kelas', icon: <IconKelas /> },
    { key: 'analisis', label: 'Analisis Belajar', icon: <IconAnalysis />, badge: stuckCount },
    { key: 'modul-ajar', label: 'Modul Ajar', icon: <IconModul /> },
    { key: 'chatbot-rag', label: 'Basis Pengetahuan AI', icon: <IconBot /> },
  ]

  return (
    <div className="guru-layout" style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', fontFamily: 'var(--font-sans), sans-serif' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.8} }
        .guru-tab-content { animation: fadeIn 0.25s ease; }
        .guru-layout { color: #1C1917; }
        .stat-card { background:#F3F8F9; border-radius:20px; padding:24px; transition: background 0.2s, transform 0.2s; }
        .stat-card:hover { background:#EBF3F5; transform:translateY(-2px); }
        .guru-table th { background:#F3F8F9; font-size:10px; font-weight:800; color:#78716C; letter-spacing:0.8px; padding:12px 16px; text-align:left; border-bottom:1px solid rgba(85,183,180,0.15); }
        .guru-table td { padding:14px 16px; border-bottom:1px solid rgba(85,183,180,0.08); font-size:13px; vertical-align:middle; }
        .guru-table tr:hover td { background:rgba(85,183,180,0.06); }
        .badge-fi { background:#F0FDFA; color:#0D9488; border:1px solid #99F6E4; }
        .badge-fd { background:#FEF7ED; color:#B45309; border:1px solid #FCD19C; }
        .badge-selesai { background:#F7FEE7; color:#4D7C0F; border:1px solid #BEF264; }
        .badge-pending { background:#FEF2F2; color:#B91C1C; border:1px solid #FCA5A5; }
        .badge-progress { background:#FFF3EE; color:#C2410C; border:1px solid #FDBA74; }
        .class-card { background:#fff; border-radius:20px; border:1px solid rgba(85,183,180,0.20); padding:20px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 12px rgba(85,183,180,0.02); }
        .class-card:hover { border-color:#55B7B4; box-shadow:0 6px 24px rgba(85,183,180,0.12); transform:translateY(-2px); }
        .class-card.selected { border-color:#387B7E; box-shadow:0 0 0 3px rgba(85,183,180,0.2); }
        .btn-icon { background:none; border:1px solid rgba(85,183,180,0.25); border-radius:8px; padding:6px 8px; cursor:pointer; display:flex; align-items:center; gap:4px; font-size:11px; font-weight:700; transition:all 0.2s; color:#78716C; }
        .btn-icon:hover { background:#F3F8F9; color:#387B7E; border-color:#387B7E; }
        .btn-icon.danger:hover { background:#FEF2F2; color:#DC2626; border-color:#FCA5A5; }
        .sidebar-nav-btn { display:flex; align-items:center; gap:12px; padding:13px 20px; border-radius:28px 0 0 28px; border:none; background:transparent; color:rgba(255,255,255,0.85); font-size:13.5px; font-weight:600; cursor:pointer; text-align:left; width:calc(100% - 16px); margin-left:16px; transition:all 0.2s; justify-content:space-between; position:relative; }
        .sidebar-nav-btn.active { background:#FFFFFF; color:#387B7E; font-weight:800; border-left:none; box-shadow:-4px 4px 12px rgba(0,0,0,0.03); }
        .sidebar-nav-btn.active::before { content:""; position:absolute; right:0; top:-20px; width:20px; height:20px; background:transparent; border-bottom-right-radius:20px; box-shadow:10px 10px 0 10px #FFFFFF; pointer-events:none; z-index:10; }
        .sidebar-nav-btn.active::after { content:""; position:absolute; right:0; bottom:-20px; width:20px; height:20px; background:transparent; border-top-right-radius:20px; box-shadow:10px -10px 0 10px #FFFFFF; pointer-events:none; z-index:10; }
        .sidebar-nav-btn:hover:not(.active) { background:rgba(255,255,255,0.1); color:#FFFFFF; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
        .modal-box { background:#fff; border-radius:24px; padding:32px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); }
        .form-input { width:100%; box-sizing:border-box; padding:11px 14px; border-radius:10px; background:#F3F8F9; border:1.5px solid rgba(85,183,180,0.25); color:#1C1917; font-size:13px; outline:none; font-family:inherit; transition:border-color 0.15s; }
        .form-input:focus { border-color:#387B7E; }
        .form-label { display:block; font-size:10px; font-weight:800; color:#78716C; letter-spacing:1px; margin-bottom:7px; }
        .gain-bar-bg { height:10px; border-radius:5px; background:#E0F2F1; overflow:hidden; flex:1; }
        .notif-panel { position:absolute; right:0; top:calc(100% + 8px); width:340px; background:#fff; border-radius:20px; border:1px solid rgba(85,183,180,0.2); box-shadow:0 16px 48px rgba(85,183,180,0.08); z-index:100; overflow:hidden; }
        .stuck-row { display:flex; align-items:center; gap:12px; padding:14px 18px; border-bottom:1px solid rgba(85,183,180,0.08); transition:background 0.15s; }
        .stuck-row:hover { background:#F3F8F9; }
        .notif-badge { animation: pulse-ring 2s infinite; }
        @media (max-width: 768px) {
          .guru-sidebar { display:none !important; }
          .guru-sidebar.mobile-open { display:flex !important; position:fixed !important; left:0; top:0; bottom:0; z-index:150; box-shadow:0 0 40px rgba(0,0,0,0.15); }
          .guru-mobile-header { display:flex !important; }
        }
      `}</style>

      {/* Sidebar Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 140 }} />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside className={`guru-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: '258px', background: 'linear-gradient(180deg, #55B7B4 0%, #387B7E 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        {/* Brand */}
        <div>
          <div style={{ padding: '0 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#387B7E" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11l4-2 4 2-4 2z"/><path d="M12 13v3"/></svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>Portal Guru</h2>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.8px' }}>SKEPTIKOS AKADEMIK</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 0 0 8px' }}>
            {sidebarItems.map(item => (
              <button key={item.key} className={`sidebar-nav-btn ${activeTab === item.key ? 'active' : ''}`} onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false) }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: activeTab === item.key ? '#EF4444' : '#FFFFFF',
                    color: activeTab === item.key ? '#FFFFFF' : '#EF4444',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    lineHeight: 1
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/profile_sarah.png" alt="Profil Guru" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #FFFFFF', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>Dr. Sarah Wijaya</div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600 }}>Koordinator Statistika</div>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
            <IconKeluar /> Keluar
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, padding: '30px 36px', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '100vh' }}>
        {/* Mobile header */}
        <div className="guru-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', color: '#387B7E', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontWeight: 800, color: '#387B7E', fontSize: '15px' }}>Portal Guru</span>
          <IconBell />
        </div>

        {/* Top header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#387B7E', fontFamily: 'var(--font-heading)' }}>
              {activeTab === 'dashboard' && 'Ringkasan Kelas'}
              {activeTab === 'manajemen-kelas' && 'Manajemen Kelas'}
              {activeTab === 'analisis' && 'Analisis Belajar'}
              {activeTab === 'modul-ajar' && 'Daftar Modul Ajar'}
              {activeTab === 'chatbot-rag' && 'Basis Pengetahuan AI Chatbot'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
              {activeTab === 'dashboard' && 'Snapshot cepat kondisi kelas Anda saat ini'}
              {activeTab === 'manajemen-kelas' && 'Kelola kelas, daftar siswa, dan pindah kelas'}
              {activeTab === 'analisis' && 'Pre/Post learning gain · Pola kesalahan · Siswa macet'}
              {activeTab === 'modul-ajar' && 'Pilih dan pelajari rancangan pelaksanaan pembelajaran'}
              {activeTab === 'chatbot-rag' && 'Kelola basis pengetahuan RAG untuk AI Chatbot'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {activeTab === 'dashboard' && (
              <button onClick={() => handleExportCSV(students)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px', borderRadius: '12px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                <IconExport /> Ekspor CSV
              </button>
            )}
            {activeTab === 'manajemen-kelas' && !selectedClassId && (
              <button onClick={openCreateClass} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px', borderRadius: '12px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                <IconPlus /> Tambah Kelas
              </button>
            )}
            {activeTab === 'analisis' && (
              <button onClick={() => fetchAnalysis(analysisClassFilter, stuckDays)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px', borderRadius: '12px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                <IconHistory /> Refresh
              </button>
            )}
            {/* Notifikasi Bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifPanel(p => !p)} style={{ position: 'relative', background: '#fff', border: '1px solid rgba(85,183,180,0.3)', borderRadius: '12px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#78716C' }}>
                <IconBell />
                {stuckCount > 0 && (
                  <span className="notif-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#C2410C', color: '#fff', fontSize: '9px', fontWeight: 900, borderRadius: '20px', padding: '2px 5px', minWidth: '16px', textAlign: 'center', lineHeight: 1.4 }}>{stuckCount}</span>
                )}
              </button>
              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div className="notif-panel" initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(85,183,180,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>🔔 Siswa Macet</div>
                        <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Tidak ada aktivitas ≥ {stuckDays} hari</div>
                      </div>
                      <button onClick={() => setShowNotifPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E' }}><IconClose /></button>
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {!analysisData ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#78716C', fontSize: '12px' }}>
                          <button onClick={() => { setActiveTab('analisis'); setShowNotifPanel(false) }} style={{ background: '#387B7E', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>Muat Analisis →</button>
                        </div>
                      ) : stuckCount === 0 ? (
                        <div style={{ padding: '28px', textAlign: 'center', color: '#78716C', fontSize: '12px', fontWeight: 600 }}>✅ Semua siswa aktif!</div>
                      ) : analysisData.stuckStudents.map(s => (
                        <div key={s.id} className="stuck-row">
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#FFF3EE', color: '#C2410C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, flexShrink: 0, border: '1px solid #FDBA74' }}>
                            {s.name.split(' ').map((n:string) => n[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                            <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600 }}>{s.classroomName}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: '#C2410C' }}>{s.daysSinceActivity}h</div>
                            <div style={{ fontSize: '9px', color: '#A8A29E', fontWeight: 700 }}>tidak aktif</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {stuckCount > 0 && (
                      <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(85,183,180,0.1)' }}>
                        <button onClick={() => { setActiveTab('analisis'); setShowNotifPanel(false) }} style={{ width: '100%', background: '#FFF3EE', color: '#9A3412', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 800 }}>Lihat Semua di Analisis →</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════
            TAB: DASHBOARD
        ═══════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="guru-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* SNAPSHOT CARDS — 3 angka besar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {/* Selesai Semua Tahap */}
              <div className="stat-card" style={{ borderTop: '4px solid #65A30D' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#F7FEE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4D7C0F" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#4D7C0F', background: '#F7FEE7', padding: '4px 10px', borderRadius: '20px', border: '1px solid #BEF264' }}>SELESAI</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: 900, color: '#1C1917', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{totalSelesai}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#44403C', marginTop: '6px' }}>Siswa Selesai Semua Tahap</div>
                <div style={{ fontSize: '11px', color: '#78716C', marginTop: '4px' }}>GEFT + Diagnostik + Gameplay</div>
                {students.length > 0 && (
                  <div style={{ marginTop: '14px', background: '#F7FEE7', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ height: '6px', flex: 1, background: '#D9F99D', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round((totalSelesai / students.length) * 100)}%`, background: '#65A30D', borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#4D7C0F' }}>{Math.round((totalSelesai / students.length) * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Stuck di GEFT/Diagnostik */}
              <div className="stat-card" style={{ borderTop: '4px solid #C2410C' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#9A3412', background: '#FFF3EE', padding: '4px 10px', borderRadius: '20px', border: '1px solid #FDBA74' }}>PERLU KEJAR</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: 900, color: '#1C1917', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{totalStuck}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#44403C', marginTop: '6px' }}>Siswa Belum Selesai</div>
                <div style={{ fontSize: '11px', color: '#78716C', marginTop: '4px' }}>Stuck di GEFT atau Diagnostik</div>
                <button onClick={() => setActiveTab('analisis')} style={{ marginTop: '14px', width: '100%', padding: '8px', borderRadius: '10px', border: 'none', background: '#FFF3EE', color: '#9A3412', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Lihat Detail <IconArrowRight />
                </button>
              </div>

              {/* Distribusi FI vs FD */}
              <div className="stat-card" style={{ borderTop: '4px solid #387B7E' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#0D9488', background: '#F0FDFA', padding: '4px 10px', borderRadius: '20px', border: '1px solid #99F6E4' }}>KOGNITIF</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#0D9488', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{totalFI}</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#0D9488', marginTop: '2px' }}>Field Independent</div>
                  </div>
                  <div style={{ fontSize: '24px', color: '#D1D5DB', fontWeight: 300, marginBottom: '4px' }}>|</div>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#B45309', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{totalFD}</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>Field Dependent</div>
                  </div>
                </div>
                {totalWithGeft > 0 ? (
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
                    <div style={{ width: `${(totalFI / totalWithGeft) * 100}%`, background: '#0D9488', borderRadius: '4px', transition: 'width 0.5s' }} />
                    <div style={{ flex: 1, background: '#D97706', borderRadius: '4px' }} />
                  </div>
                ) : <div style={{ height: '8px', borderRadius: '4px', background: '#F3F8F9' }} />}
                <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 700, marginTop: '8px' }}>
                  {totalWithGeft > 0 ? `${Math.round((totalFI/totalWithGeft)*100)}% FI · ${Math.round((totalFD/totalWithGeft)*100)}% FD` : 'Menunggu hasil GEFT'}
                </div>
              </div>
            </div>

            {/* Per-Kelas Distribution */}
            {classrooms.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(85,183,180,0.2)', boxShadow: '0 4px 20px rgba(85,183,180,0.02)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>Distribusi Kognitif per Kelas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {classrooms.map(cls => {
                    const fiPct = (cls.fiCount + cls.fdCount) > 0 ? Math.round((cls.fiCount / (cls.fiCount + cls.fdCount)) * 100) : 0
                    return (
                      <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ minWidth: '140px', fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>{cls.name}</div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '10px', background: '#F3F8F9', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                            {(cls.fiCount + cls.fdCount) > 0 ? (
                              <>
                                <div style={{ width: `${fiPct}%`, background: '#0D9488', transition: 'width 0.5s' }} />
                                <div style={{ flex: 1, background: '#D97706' }} />
                              </>
                            ) : <div style={{ flex: 1, background: '#F3F8F9' }} />}
                          </div>
                          <span style={{ fontSize: '11px', color: '#0D9488', fontWeight: 800, minWidth: '30px' }}>FI:{cls.fiCount}</span>
                          <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 800, minWidth: '30px' }}>FD:{cls.fdCount}</span>
                          <span style={{ fontSize: '10px', color: '#A8A29E', fontWeight: 700 }}>({cls.totalStudents} siswa)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}


          </div>
        )}



        {/* ═══════════════════════════════════════
            TAB: MANAJEMEN KELAS
        ═══════════════════════════════════════ */}
        {activeTab === 'manajemen-kelas' && (
          <div className="guru-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Class Grid */}
            {!selectedClassId ? (
              loadingClassrooms ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#78716C' }}>Memuat data kelas...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {classrooms.map(cls => {
                    const withGeft = cls.fiCount + cls.fdCount
                    return (
                      <div key={cls.id} className="class-card" onClick={() => setSelectedClassId(cls.id)}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,123,126,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconUsers />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917' }}>{cls.name}</div>
                              <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600 }}>
                                {cls.grade !== '-' ? `Kelas ${cls.grade}` : ''}{cls.major !== '-' ? ` · ${cls.major}` : ''}
                                {cls.grade === '-' && cls.major === '-' ? 'Kelas Umum' : ''}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-icon" onClick={e => { e.stopPropagation(); openEditClass(cls) }}><IconEdit /></button>
                            <button className="btn-icon danger" onClick={e => { e.stopPropagation(); handleDeleteClass(cls.id, cls.name) }}><IconTrash /></button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                          <div style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#F3F8F9', textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#387B7E', fontFamily: 'var(--font-heading)' }}>{cls.totalStudents}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: '#78716C' }}>TOTAL SISWA</div>
                          </div>
                          <div style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#F0FDFA', textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0D9488', fontFamily: 'var(--font-heading)' }}>{cls.fiCount}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: '#0D9488' }}>FI</div>
                          </div>
                          <div style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#FEF7ED', textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#B45309', fontFamily: 'var(--font-heading)' }}>{cls.fdCount}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: '#B45309' }}>FD</div>
                          </div>
                        </div>

                        {/* Mini bar */}
                        {withGeft > 0 && (
                          <div style={{ height: '6px', borderRadius: '3px', background: '#F3F8F9', overflow: 'hidden', display: 'flex', marginBottom: '10px' }}>
                            <div style={{ width: `${(cls.fiCount / withGeft) * 100}%`, background: '#0D9488', transition: 'width 0.5s' }} />
                            <div style={{ flex: 1, background: '#D97706' }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              /* Class Student Detail (sliced to new sub-view) */
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(85,183,180,0.2)', boxShadow: '0 4px 20px rgba(85,183,180,0.02)' }}>
                {/* Back button */}
                <button onClick={() => setSelectedClassId(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(85,183,180,0.3)', background: '#fff', color: '#387B7E', fontSize: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#E5F3F4'; e.currentTarget.style.borderColor = '#387B7E' }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(85,183,180,0.3)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Kembali ke Daftar Kelas
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>
                      Daftar Siswa — {classrooms.find(c => c.id === selectedClassId)?.name}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78716C' }}>Kelola atau pindahkan siswa ke kelas lain</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }}><IconSearch /></span>
                      <input type="text" placeholder="Cari siswa..." value={classStudentSearch} onChange={e => setClassStudentSearch(e.target.value)} style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '10px', border: '1.5px solid rgba(85,183,180,0.25)', background: '#F3F8F9', fontSize: '12px', color: '#1C1917', outline: 'none', width: '180px' }} />
                    </div>
                    <button onClick={() => handleExportCSV(classStudents)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                      <IconExport /> Ekspor
                    </button>
                  </div>
                </div>

                {loadingClassStudents ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#78716C' }}>Memuat...</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="guru-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                        <tr>
                          <th>NAMA SISWA</th>
                          <th>NISN</th>
                          <th>STATUS</th>
                          <th>KOGNITIF</th>
                          <th>SKOR GEFT</th>
                          <th>INVESTIGASI</th>
                          <th>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.filter(s => s.name.toLowerCase().includes(classStudentSearch.toLowerCase())).map(s => {
                          const stage = getStudentStageStatus(s)
                          const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                          return (
                            <tr key={s.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E5F3F4', color: '#387B7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                                  <span style={{ fontWeight: 800, color: '#1C1917', fontSize: '13px' }}>{s.name}</span>
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: '#78716C', fontFamily: 'monospace' }}>{s.nisn}</td>
                              <td>
                                <span className={`badge-${stage === 'selesai' ? 'selesai' : stage === 'diagnostic-pending' ? 'progress' : 'pending'}`} style={{ display: 'inline-block', padding: '4px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 800 }}>
                                  {stage === 'selesai' ? '✅ Selesai' : stage === 'diagnostic-pending' ? '⏳ Diagnostik' : '🔴 GEFT'}
                                </span>
                              </td>
                              <td>
                                {s.geftResult ? (
                                  <span className={s.geftResult.cognitiveStyle === 'FI' ? 'badge-fi' : 'badge-fd'} style={{ display: 'inline-block', padding: '4px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 800 }}>
                                    {s.geftResult.cognitiveStyle}
                                  </span>
                                ) : <span style={{ color: '#A8A29E' }}>—</span>}
                              </td>
                              <td style={{ fontWeight: 700 }}>{s.geftResult?.score ?? '—'}</td>
                              <td style={{ fontWeight: 700, color: '#387B7E' }}>{s.diagnosticScore ?? '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {s.gameSessions?.[0]?.lkpdCompleted && (
                                    <button
                                      className="btn-icon"
                                      onClick={() => openViewLkpd(s, s.gameSessions?.[0]?.lkpdAnswers)}
                                      title="Lihat Jawaban LKPD"
                                      style={{ background: '#387B7E', color: '#FFF' }}
                                    >
                                      📄 LKPD
                                    </button>
                                  )}
                                  <button className="btn-icon" onClick={() => openMoveStudent(s)} title="Pindah Kelas">
                                    <IconArrowRight /> Pindah
                                  </button>
                                  <button className="btn-icon danger" onClick={() => handleDeleteStudent(s.id, s.name)} title="Hapus Siswa">
                                    <IconTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {classStudents.filter(s => s.name.toLowerCase().includes(classStudentSearch.toLowerCase())).length === 0 && (
                          <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#78716C' }}>Tidak ada siswa yang ditemukan.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: MODUL AJAR
        ═══════════════════════════════════════ */}
        {activeTab === 'modul-ajar' && (
          <div className="guru-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!selectedModul ? (
              loadingModul ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#78716C' }}>Memuat modul ajar...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {modulList.map(modul => (
                    <div key={modul.id} className="class-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }} onClick={() => setSelectedModul(modul)}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,123,126,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconModul />
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#387B7E', fontWeight: 800, textTransform: 'uppercase' }}>{modul.subject} · FASE {modul.grade}</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1C1917', marginTop: '2px' }}>{modul.title}</div>
                          </div>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#78716C', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                          Topik: {modul.topic}<br />
                          Pertemuan: {modul.session}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(85,183,180,0.1)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E' }}>🕒 {modul.duration}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#387B7E', display: 'flex', alignItems: 'center', gap: '4px' }}>Buka Modul →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (() => {
              const content = typeof selectedModul.content === 'string' ? JSON.parse(selectedModul.content) : selectedModul.content
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top Bar for controls */}
                  <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <button onClick={() => setSelectedModul(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(85,183,180,0.3)', background: '#fff', color: '#387B7E', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#E5F3F4'; e.currentTarget.style.borderColor = '#387B7E' }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(85,183,180,0.3)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                      Kembali ke Daftar Modul
                    </button>
                    <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Cetak / Simpan PDF 💾
                    </button>
                  </div>

                  {/* Document container resembling a sheet of paper */}
                  <div className="modul-print-document" style={{
                    background: '#ffffff',
                    border: '1px solid #A8A29E',
                    borderRadius: '8px',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
                    padding: '48px',
                    margin: '0 auto',
                    maxWidth: '850px',
                    width: '100%',
                    boxSizing: 'border-box',
                    color: '#000000',
                    fontFamily: '"Times New Roman", Times, serif',
                    lineHeight: 1.5
                  }}>
                    <style>{`
                      .doc-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                      .doc-table th, .doc-table td { border: 1px solid #000000; padding: 12px; vertical-align: top; font-size: 13.5px; }
                      .doc-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 24px; }
                      .doc-meta { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin-bottom: 24px; font-size: 14px; font-weight: bold; }
                      .doc-bullet { margin: 4px 0; padding-left: 20px; }
                      @media print {
                        body * { visibility: hidden; }
                        .modul-print-document, .modul-print-document * { visibility: visible; }
                        .modul-print-document { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
                        .no-print { display: none !important; }
                      }
                    `}</style>

                    <div className="doc-title">MODUL AJAR</div>

                    <div className="doc-meta">
                      <div>MATA PELAJARAN</div><div>: {selectedModul.subject}</div>
                      <div>FASE/ KELAS</div><div>: {selectedModul.grade}</div>
                      <div>TOPIK</div><div>: {selectedModul.topic}</div>
                      <div>ALOKASI WAKTU</div><div>: {selectedModul.duration}</div>
                      <div>PERTEMUAN</div><div>: {selectedModul.session}</div>
                    </div>

                    {/* Table 1: Identifikasi */}
                    <table className="doc-table">
                      <tbody>
                        <tr>
                          <td rowSpan={4} style={{ width: '120px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', verticalAlign: 'middle' }}>
                            IDENTIFIKASI
                          </td>
                          <td style={{ width: '140px', fontWeight: 'bold' }}>Peserta Didik</td>
                          <td>
                            <div>Berdasarkan hasil tes diagnostik siswa, kemampuan awal siswa terbagi menjadi:</div>
                            <div className="doc-bullet"> Tinggi : {content.identifikasi.kemampuanAwal.tinggi}%</div>
                            <div className="doc-bullet"> Sedang : {content.identifikasi.kemampuanAwal.sedang}%</div>
                            <div className="doc-bullet"> Rendah : {content.identifikasi.kemampuanAwal.rendah}%</div>
                            <div style={{ marginTop: '8px' }}>Berdasarkan hasil GEFT (Group Embedded Figures Test) siswa terbagi menjadi:</div>
                            <div className="doc-bullet"> Field Independent (FI) : {content.identifikasi.geft.fi}%</div>
                            <div className="doc-bullet"> Field Dependent (FD) : {content.identifikasi.geft.fd}%</div>
                            <div style={{ marginTop: '8px' }}>{content.identifikasi.deskripsi}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Materi Pelajaran</td>
                          <td>
                            <div>{content.materiPelajaran.definisi}</div>
                            <div style={{ fontWeight: 'bold', marginTop: '10px' }}>Materi pokok : {content.materiPelajaran.materiPokok.judul}</div>
                            <div>{content.materiPelajaran.materiPokok.deskripsi}</div>
                            <div style={{ fontWeight: 'bold', marginTop: '8px' }}>Langkah-langkah membuat tabel distribusi frekuensi:</div>
                            <ol style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.materiPelajaran.materiPokok.langkah.map((step: string, idx: number) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Histogram</td>
                          <td>
                            <div>{content.materiPelajaran.histogram.deskripsi}</div>
                            <div style={{ fontWeight: 'bold', marginTop: '8px' }}>Sumber :</div>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.materiPelajaran.sumber.map((s: { nama: string; url?: string }, idx: number) => (
                                <li key={idx}>
                                  {s.nama} {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline' }}>{s.url}</a>}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Dimensi Profil Lulusan (DPL)</td>
                          <td>
                            <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>Pilihlah dimensi profil lulusan yang akan dicapai dalam pembelajaran:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>[ ] DPL 1: Keimanan & Ketaqwaan</div>
                              <div>[ ] DPL 2: Kewargaan</div>
                              <div>[✓] DPL 3: Penalaran Kritis</div>
                              <div>[✓] DPL 4: Kreativitas</div>
                              <div>[✓] DPL 5: Kolaborasi</div>
                              <div>[✓] DPL 6: Kemandirian</div>
                              <div>[ ] DPL 7: Kesehatan</div>
                              <div>[✓] DPL 8: Komunikasi</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table 2: Desain Pembelajaran */}
                    <table className="doc-table">
                      <tbody>
                        <tr>
                          <td rowSpan={8} style={{ width: '120px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', verticalAlign: 'middle' }}>
                            DESAIN PEMBELAJARAN
                          </td>
                          <td style={{ width: '140px', fontWeight: 'bold' }}>Capaian Pembelajaran</td>
                          <td>{content.desainPembelajaran.capaian}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Lintas Disiplin Ilmu</td>
                          <td>
                            <div><strong>❖ IPA:</strong> {content.desainPembelajaran.lintasDisiplin.ipa}</div>
                            <div style={{ marginTop: '4px' }}><strong>❖ IPS:</strong> {content.desainPembelajaran.lintasDisiplin.ips}</div>
                            <div style={{ marginTop: '4px' }}><strong>❖ Informatika:</strong> {content.desainPembelajaran.lintasDisiplin.informatika}</div>
                            <div style={{ marginTop: '4px' }}><strong>❖ Bahasa Indonesia:</strong> {content.desainPembelajaran.lintasDisiplin.bahasaIndonesia}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Tujuan Pembelajaran</td>
                          <td>
                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                              {content.desainPembelajaran.tujuan.map((t: string, idx: number) => (
                                <li key={idx}>{t}</li>
                              ))}
                            </ol>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Topik Pembelajaran</td>
                          <td>
                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                              {content.desainPembelajaran.topik.map((t: string, idx: number) => (
                                <li key={idx}>{t}</li>
                              ))}
                            </ol>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Praktik Pedagogis</td>
                          <td>
                            <div>• <strong>Model pembelajaran:</strong> {content.desainPembelajaran.praktikPedagogis.model}</div>
                            <div>• <strong>Pendekatan pembelajaran:</strong> {content.desainPembelajaran.praktikPedagogis.pendekatan}</div>
                            <div>• <strong>Metode Pembelajaran:</strong> {content.desainPembelajaran.praktikPedagogis.metode}</div>
                            <div style={{ marginTop: '4px' }}>• <strong>Pembelajaran Berkesadaran:</strong> {content.desainPembelajaran.praktikPedagogis.pembelajaranBerkesadaran}</div>
                            <div style={{ marginTop: '4px' }}>• <strong>Pembelajaran Bermakna:</strong> {content.desainPembelajaran.praktikPedagogis.pembelajaranBermakna}</div>
                            <div style={{ marginTop: '4px' }}>• <strong>Pembelajaran Menggembirakan:</strong> {content.desainPembelajaran.praktikPedagogis.pembelajaranMenggembirakan}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Kemitraan Pembelajaran</td>
                          <td>
                            {content.desainPembelajaran.kemitraan.map((k: string, idx: number) => (
                              <div key={idx}>• {k}</div>
                            ))}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Lingkungan Pembelajaran</td>
                          <td>
                            <div>• <strong>Ruang Fisik:</strong> {content.desainPembelajaran.lingkungan.ruangFisik}</div>
                            <div>• <strong>Ruang Virtual:</strong> {content.desainPembelajaran.lingkungan.ruangVirtual}</div>
                            <div>• <strong>Budaya Belajar:</strong> {content.desainPembelajaran.lingkungan.budayaBelajar}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>Pemanfaatan Digital</td>
                          <td>{content.desainPembelajaran.pemanfaatanDigital}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table 3: Pengalaman Belajar */}
                    <table className="doc-table">
                      <tbody>
                        <tr>
                          <td rowSpan={3} style={{ width: '120px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', verticalAlign: 'middle' }}>
                            PENGALAMAN BELAJAR
                          </td>
                          <td style={{ width: '140px', fontWeight: 'bold' }}>AWAL<br/><span style={{ fontSize: '11px', fontWeight: 'normal', fontStyle: 'italic' }}>(berkesadaran, bermakna, Menggembirakan)</span></td>
                          <td>
                            <div style={{ fontWeight: 'bold' }}>Pembukaan (berkesadaran/Mindful Learning):</div>
                            <ul style={{ margin: '4px 0 10px 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.awal.pembukaan.map((p: string, idx: number) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{p}</li>
                              ))}
                            </ul>
                            <div style={{ fontWeight: 'bold' }}>Apersepisi (bermakna/Meaningful Learning):</div>
                            <ul style={{ margin: '4px 0 10px 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.awal.apersepsi.map((a: string, idx: number) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{a}</li>
                              ))}
                            </ul>
                            <div style={{ fontWeight: 'bold' }}>Motivasi (Menggembirakan/Joyful Learning):</div>
                            <ul style={{ margin: '4px 0 10px 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.awal.motivasi.map((m: string, idx: number) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{m}</li>
                              ))}
                            </ul>
                            <div style={{ fontWeight: 'bold' }}>Ice Breaking (opsional):</div>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.awal.iceBreaking.map((i: string, idx: number) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{i}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>INTI<br/><span style={{ fontSize: '11px', fontWeight: 'normal', fontStyle: 'italic' }}>(kemandirian)</span></td>
                          <td>
                            <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Memahami (Berkesadaran, Bermakna)</div>
                            <div style={{ fontWeight: 'bold', marginTop: '6px' }}>{content.pengalamanBelajar.inti.memahami.sintaks1.judul}</div>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.inti.memahami.sintaks1.langkah.map((l: string, idx: number) => (
                                <li key={idx}>{l}</li>
                              ))}
                            </ul>
                            <div style={{ margin: '6px 0 12px 20px', fontSize: '12px', fontStyle: 'italic' }}>
                              Diferensiasi proses dan lingkungan:<br/>
                              - FI: {content.pengalamanBelajar.inti.memahami.sintaks1.diferensiasi[0]}<br/>
                              - FD: {content.pengalamanBelajar.inti.memahami.sintaks1.diferensiasi[1]}
                            </div>

                            <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginTop: '14px' }}>Mengaplikasi (berkesadaran, bermakna)</div>
                            <div style={{ fontWeight: 'bold', marginTop: '6px' }}>{content.pengalamanBelajar.inti.mengaplikasi.sintaks2.judul}</div>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.inti.mengaplikasi.sintaks2.langkah.map((l: string, idx: number) => (
                                <li key={idx}>{l}</li>
                              ))}
                            </ul>
                            <div style={{ margin: '6px 0 12px 20px', fontSize: '12px', fontStyle: 'italic' }}>
                              Diferensiasi konten dan lingkungan:<br/>
                              - FI: {content.pengalamanBelajar.inti.mengaplikasi.sintaks2.diferensiasi[0]}<br/>
                              - FD: {content.pengalamanBelajar.inti.mengaplikasi.sintaks2.diferensiasi[1]}
                            </div>

                            <div style={{ fontWeight: 'bold', marginTop: '10px' }}>{content.pengalamanBelajar.inti.mengaplikasi.sintaks3.judul}</div>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.inti.mengaplikasi.sintaks3.langkah.map((l: string, idx: number) => (
                                <li key={idx}>{l}</li>
                              ))}
                            </ul>
                            <div style={{ margin: '6px 0 12px 20px', fontSize: '12px', fontStyle: 'italic' }}>
                              Diferensiasi proses dan lingkungan:<br/>
                              - FI: {content.pengalamanBelajar.inti.mengaplikasi.sintaks3.diferensiasi[0]}<br/>
                              - FD: {content.pengalamanBelajar.inti.mengaplikasi.sintaks3.diferensiasi[1]}
                            </div>

                            <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginTop: '14px' }}>Merefleksi (berkesadaran)</div>
                            <div style={{ fontWeight: 'bold', marginTop: '6px' }}>{content.pengalamanBelajar.inti.mengaplikasi.sintaks4.judul}</div>
                            <ul style={{ margin: '4px 0 12px 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.inti.mengaplikasi.sintaks4.langkah.map((l: string, idx: number) => (
                                <li key={idx}>{l}</li>
                              ))}
                            </ul>

                            <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginTop: '14px' }}>Menganalisis dan mengevaluasi (Sintaks 5 PBL)</div>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.inti.menganalisis.sintaks5.langkah.map((l: string, idx: number) => (
                                <li key={idx}>{l}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 'bold' }}>PENUTUP<br/><span style={{ fontSize: '11px', fontWeight: 'normal', fontStyle: 'italic' }}>(berkesadaran)</span></td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                              {content.pengalamanBelajar.penutup.map((p: string, idx: number) => {
                                if (p.includes("Kemampuan kalian membaca data")) {
                                  return (
                                    <li key={idx} style={{ marginBottom: '8px', listStyleType: 'none', marginLeft: '-20px', padding: '10px 14px', borderLeft: '3px solid #000000', background: '#F8F8F8', fontStyle: 'italic' }}>
                                      {p}
                                    </li>
                                  )
                                }
                                return <li key={idx} style={{ marginBottom: '4px' }}>{p}</li>
                              })}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: BASIS PENGETAHUAN AI (RAG)
        ═══════════════════════════════════════ */}
        {activeTab === 'chatbot-rag' && (
          <div className="guru-tab-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px', alignItems: 'start' }}>
            {/* Form */}
            <div style={{ background: '#fff', border: '1px solid rgba(85,183,180,0.2)', borderRadius: '24px', padding: '24px', position: 'sticky', top: '20px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 800, color: '#387B7E' }}>{isEditing ? '📝 Edit Pengetahuan' : '✨ Tambah Pengetahuan'}</h3>
              <form onSubmit={handleSaveKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">JUDUL MATERI</label>
                  <input className="form-input" type="text" placeholder="Contoh: Ukuran Penyebaran Data..." value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">KATEGORI</label>
                  <select className="form-input" value={formCategory} onChange={e => setFormCategory(e.target.value)} style={{ color: '#387B7E', fontWeight: 800 }}>
                    <option value="statistika">Statistika</option>
                    <option value="gameplay">Gameplay</option>
                    <option value="umum">Umum / Kognitif</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">KONTEN RAG</label>
                  <textarea className="form-input" rows={8} placeholder="Tuliskan materi yang akan dirujuk oleh AI Chatbot..." value={formContent} onChange={e => setFormContent(e.target.value)} style={{ resize: 'vertical', lineHeight: 1.55 }} />
                </div>
                {formError && <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: '13px' }}>⚠️ {formError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {isEditing && <button type="button" onClick={resetForm} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(85,183,180,0.3)', background: 'transparent', color: '#78716C', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Batal</button>}
                  <button type="submit" disabled={formSaving} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                    {formSaving ? 'Menyimpan...' : 'Simpan Materi 💾'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#387B7E' }}>Dokumen RAG Aktif</h3>
              {loadingKnowledge ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#78716C' }}>Memuat...</div>
              ) : knowledgeItems.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed rgba(85,183,180,0.3)', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#78716C' }}>Belum ada dokumen tersimpan.</div>
              ) : knowledgeItems.map(item => (
                <div key={item.id} style={{ background: '#fff', border: '1px solid rgba(85,183,180,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, background: item.category === 'statistika' ? '#EFF6FF' : item.category === 'gameplay' ? '#ECFDF5' : '#FEF3C7', color: item.category === 'statistika' ? '#1D4ED8' : item.category === 'gameplay' ? '#047857' : '#B45309', border: `1px solid ${item.category === 'statistika' ? '#BFDBFE' : item.category === 'gameplay' ? '#A7F3D0' : '#FDE68A'}`, textTransform: 'uppercase', marginBottom: '6px' }}>{item.category}</span>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917' }}>{item.title}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button className="btn-icon" onClick={() => handleEditTrigger(item)}>Edit ✏️</button>
                      <button className="btn-icon danger" onClick={() => handleDeleteKnowledge(item.id)}>Hapus 🗑️</button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#44403C', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  <div style={{ fontSize: '9px', color: '#A8A29E', borderTop: '1px solid rgba(85,183,180,0.1)', paddingTop: '8px', textAlign: 'right', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <IconClock /> {new Date(item.updatedAt).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: ANALISIS BELAJAR (6,7,8)
        ═══════════════════════════════════════ */}
        {activeTab === 'analisis' && (
          <div className="guru-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Filter Bar */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(85,183,180,0.2)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={analysisClassFilter} onChange={e => { setAnalysisClassFilter(e.target.value); fetchAnalysis(e.target.value, stuckDays) }} style={{ padding: '9px 12px', borderRadius: '10px', border: '1.5px solid rgba(85,183,180,0.25)', background: '#F3F8F9', color: '#387B7E', fontSize: '12px', fontWeight: 800, outline: 'none', cursor: 'pointer' }}>
                <option value="semua">Semua Kelas</option>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#78716C' }}>Macet setelah</span>
                <input type="number" min={1} max={30} value={stuckDays} onChange={e => setStuckDays(Number(e.target.value))} style={{ width: '52px', padding: '8px 10px', borderRadius: '10px', border: '1.5px solid rgba(85,183,180,0.25)', background: '#F3F8F9', fontSize: '13px', fontWeight: 800, color: '#387B7E', outline: 'none', textAlign: 'center' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#78716C' }}>hari</span>
                <button onClick={() => fetchAnalysis(analysisClassFilter, stuckDays)} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>Terapkan</button>
              </div>
              {analysisData && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#A8A29E', fontWeight: 700 }}>Diperbarui: {new Date(analysisData.generatedAt).toLocaleTimeString('id-ID')}</span>}
            </div>

            {loadingAnalysis ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#78716C', fontWeight: 600 }}>⏳ Menganalisis data...</div>
            ) : !analysisData ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ color: '#78716C', fontWeight: 600, marginBottom: '16px' }}>Klik Refresh untuk memuat analisis</p>
                <button onClick={() => fetchAnalysis(analysisClassFilter, stuckDays)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#387B7E', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>Muat Analisis 🔍</button>
              </div>
            ) : (
              <>
                {/* ── FITUR 8: STUCK STUDENTS ── */}
                {analysisData.stuckStudents.length > 0 && (
                  <div style={{ background: '#F3F8F9', borderRadius: '20px', padding: '20px 24px', border: '1.5px solid rgba(85,183,180,0.4)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#387B7E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconAlertOctagon />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#387B7E' }}>⚠️ {analysisData.stuckStudents.length} Siswa Tidak Aktif ≥ {stuckDays} Hari</div>
                          <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Butuh intervensi segera — perhatikan daftar ini</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                        {analysisData.stuckStudents.map(s => (
                          <div key={s.id} style={{ background: '#fff', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(85,183,180,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F8F9', border: '2px solid rgba(85,183,180,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#387B7E', flexShrink: 0 }}>
                              {s.name.split(' ').map((n:string) => n[0]).join('').substring(0,2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13px', color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                              <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600 }}>{s.classroomName}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '18px', fontWeight: 900, color: '#387B7E', lineHeight: 1 }}>{s.daysSinceActivity}</div>
                              <div style={{ fontSize: '9px', fontWeight: 700, color: '#78716C' }}>HARI</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {analysisData.stuckStudents.length === 0 && (
                  <div style={{ background: '#F0FDFA', borderRadius: '16px', padding: '16px 20px', border: '1px solid #CCFBF1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F766E' }}>Semua siswa aktif dalam {stuckDays} hari terakhir!</span>
                  </div>
                )}

                {/* ── FITUR 6: PRE vs POST ── */}
                <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(85,183,180,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>📊 Learning Gain — Pre vs Post</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78716C' }}>Diagnostik awal ↔ Skor investigasi akhir per siswa</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#55B7B4' }} /><span style={{ fontSize: '11px', color: '#78716C', fontWeight: 700 }}>Pre (Diagnostik)</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#387B7E' }} /><span style={{ fontSize: '11px', color: '#78716C', fontWeight: 700 }}>Post (Investigasi)</span></div>
                    </div>
                  </div>
                  {analysisData.preVsPost.filter(s => s.preScore !== null || s.postScore !== null).length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#A8A29E', fontWeight: 600, fontSize: '13px' }}>Belum ada data skor untuk ditampilkan.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                      {analysisData.preVsPost
                        .filter(s => s.preScore !== null || s.postScore !== null)
                        .sort((a, b) => (b.gain ?? -99) - (a.gain ?? -99))
                        .map(s => {
                          const pre = s.preScore ?? 0
                          const post = s.postScore ?? 0
                          const gain = s.gain
                          const isPositive = gain !== null && gain >= 0
                          return (
                            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 70px', gap: '12px', alignItems: 'center', padding: '10px 14px', borderRadius: '12px', background: '#F3F8F9', border: '1px solid rgba(85,183,180,0.08)' }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600 }}>{s.classroomName}</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {/* Pre bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#55B7B4', width: '28px', textAlign: 'right' }}>PRE</span>
                                  <div className="gain-bar-bg">
                                    <div style={{ height: '100%', width: `${pre}%`, background: '#55B7B4', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                                  </div>
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#78716C', width: '28px' }}>{s.preScore ?? '—'}</span>
                                </div>
                                {/* Post bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#387B7E', width: '28px', textAlign: 'right' }}>POST</span>
                                  <div className="gain-bar-bg">
                                    <div style={{ height: '100%', width: `${post}%`, background: '#387B7E', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                                  </div>
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#387B7E', width: '28px' }}>{s.postScore ?? '—'}</span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                {gain !== null ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: isPositive ? '#0F766E' : '#B91C1C' }}>
                                      {isPositive ? <IconTrendUp /> : <IconTrendDown />}
                                      <span style={{ fontSize: '15px', fontWeight: 900 }}>{gain > 0 ? '+' : ''}{gain}</span>
                                    </div>
                                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#A8A29E' }}>GAIN</span>
                                  </div>
                                ) : <span style={{ fontSize: '11px', color: '#A8A29E' }}>—</span>}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* ── FITUR 7: LEVEL ERROR ANALYSIS ── */}
                <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(85,183,180,0.2)' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>🎯 Pola Kesalahan per Level Investigasi</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78716C' }}>Diurutkan dari level dengan error rate tertinggi — langsung actionable</p>
                  </div>
                  {analysisData.levelAnalysis.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#A8A29E', fontWeight: 600, fontSize: '13px' }}>Belum ada data sesi investigasi.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analysisData.levelAnalysis.map((lv, idx) => {
                        const isHigh = lv.errorRate >= 60
                        const isMed = lv.errorRate >= 30 && lv.errorRate < 60
                        const accent = isHigh ? '#B91C1C' : isMed ? '#D97706' : '#0F766E'
                        const bg = isHigh ? '#FEF2F2' : isMed ? '#FFFBEB' : '#F0FDFA'
                        const border = isHigh ? '#FCA5A5' : isMed ? '#FCD34D' : '#99F6E4'
                        return (
                          <div key={lv.levelId} style={{ borderRadius: '16px', border: `1.5px solid ${border}`, background: bg, padding: '16px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: '12px', alignItems: 'center', marginBottom: lv.topWrongAnswers.length > 0 ? '12px' : '0' }}>
                              {/* Rank */}
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>#{idx + 1}</div>
                              {/* Info */}
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917' }}>{lv.label}</div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                                  {/* Error bar */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${lv.errorRate}%`, background: accent, borderRadius: '3px', transition: 'width 0.5s' }} />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 900, color: accent, minWidth: '34px' }}>{lv.errorRate}%</span>
                                  </div>
                                  <span style={{ fontSize: '10px', color: '#78716C', fontWeight: 700 }}>{lv.incorrect}/{lv.total} salah</span>
                                  <span style={{ fontSize: '10px', color: '#A8A29E', fontWeight: 700 }}>~{lv.avgTimeSec}det/soal</span>
                                </div>
                              </div>
                              {/* Badge */}
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, background: accent, color: '#fff' }}>
                                  {isHigh ? '🔴 Kritis' : isMed ? '🟡 Perhatian' : '🟢 Baik'}
                                </span>
                              </div>
                            </div>
                            {/* Top wrong answers */}
                            {lv.topWrongAnswers.length > 0 && (
                              <div style={{ paddingTop: '10px', borderTop: `1px solid ${border}`, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: accent }}>Jawaban salah terbanyak:</span>
                                {lv.topWrongAnswers.map((w, i) => (
                                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', border: `1px solid ${border}`, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#44403C' }}>
                                    &ldquo;{w.answer}&rdquo; <span style={{ color: accent, fontWeight: 900 }}>×{w.count}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════
          MODAL: CLASS FORM
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showClassModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#387B7E' }}>
                  {classModalMode === 'create' ? '🏫 Buat Kelas Baru' : '✏️ Edit Kelas'}
                </h3>
                <button onClick={() => setShowClassModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: '4px' }}><IconClose /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">NAMA KELAS *</label>
                  <input className="form-input" type="text" placeholder="Contoh: XI MIPA 2" value={classModalName} onChange={e => setClassModalName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveClass()} autoFocus />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">TINGKAT KELAS</label>
                    <select className="form-input" value={classModalGrade} onChange={e => setClassModalGrade(e.target.value)} style={{ color: '#1C1917' }}>
                      <option value="-">— (Umum)</option>
                      <option value="X">X</option>
                      <option value="XI">XI</option>
                      <option value="XII">XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">JURUSAN</label>
                    <select className="form-input" value={classModalMajor} onChange={e => setClassModalMajor(e.target.value)} style={{ color: '#1C1917' }}>
                      <option value="-">— (Umum)</option>
                      <option value="MIPA">MIPA</option>
                      <option value="IPS">IPS</option>
                      <option value="Bahasa">Bahasa</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                </div>

                {classModalError && <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: '13px' }}>⚠️ {classModalError}</div>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button onClick={() => setShowClassModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(85,183,180,0.3)', background: 'transparent', color: '#78716C', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Batal</button>
                  <button onClick={handleSaveClass} disabled={classModalSaving} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: '#387B7E', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2E6669'} onMouseLeave={e => e.currentTarget.style.background = '#387B7E'}>
                    {classModalSaving ? 'Menyimpan...' : classModalMode === 'create' ? 'Buat Kelas' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          MODAL: MOVE STUDENT
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showMoveModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} style={{ maxWidth: '380px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#387B7E' }}>Pindah Kelas Siswa</h3>
                <button onClick={() => setShowMoveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C' }}><IconClose /></button>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#78716C', fontWeight: 600 }}>Pindahkan <strong style={{ color: '#1C1917' }}>{moveStudentName}</strong> ke kelas:</p>
              <select className="form-input" value={moveTargetClassId} onChange={e => setMoveTargetClassId(e.target.value)} style={{ marginBottom: '16px', color: '#1C1917' }}>
                <option value="">— Pilih kelas tujuan —</option>
                {classrooms.filter(c => c.id !== selectedClassId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowMoveModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(85,183,180,0.3)', background: 'transparent', color: '#78716C', fontWeight: 700, cursor: 'pointer' }}>Batal</button>
                <button onClick={handleMoveStudent} disabled={moveSaving || !moveTargetClassId} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: moveTargetClassId ? '#387B7E' : '#D1D5DB', color: '#fff', fontWeight: 800, cursor: moveTargetClassId ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = moveTargetClassId ? '#2E6669' : '#D1D5DB'} onMouseLeave={e => e.currentTarget.style.background = moveTargetClassId ? '#387B7E' : '#D1D5DB'}>
                  {moveSaving ? 'Memindahkan...' : 'Pindahkan Siswa'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Lihat LKPD */}
      <AnimatePresence>
        {showLkpdModal && viewingLkpdStudent && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#FAF5E4',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '840px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '3px solid #1E293B',
                boxShadow: '12px 12px 0px rgba(15, 23, 42, 0.9)',
                position: 'relative',
                padding: '24px',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowLkpdModal(false)
                  setViewingLkpdStudent(null)
                  setViewingLkpdAnswers(null)
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#FFF',
                  border: '2px solid #1E293B',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  zIndex: 10,
                  boxShadow: '2px 2px 0px #1E293B',
                }}
              >
                ✕
              </button>

              <div style={{ marginBottom: '20px', borderBottom: '2px solid #1E293B', paddingBottom: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1E3A8A' }}>
                  Lembar Kerja (LKPD) Siswa
                </h2>
                <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0' }}>
                  Menampilkan jawaban dari <strong>{viewingLkpdStudent.name}</strong>
                </p>
              </div>

              <LkpdWorksheet
                readOnly={true}
                initialAnswers={viewingLkpdAnswers}
                studentName={viewingLkpdStudent.name}
                studentClass={viewingLkpdStudent.classroom?.name}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}