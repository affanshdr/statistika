'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Define interfaces matching existing DB schema
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

interface GroupStudent {
  id: string
  name: string
  label: string
  cognitiveStyle: 'FI' | 'FD'
}

interface Group {
  id: string
  name: string
  students: GroupStudent[]
}

// ── SVG Icon Helpers ──
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
)

const IconKelas = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)

const IconNilai = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
)

const IconKelompok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
)

const IconModul = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
)

const IconProfil = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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

const IconGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
)

const IconSparkles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"/></svg>
)

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)

const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>
)

const IconTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
)

const IconTrendDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
)

const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
)

const IconDotsVertical = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
)

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)

// ── Default Mock Student Data (matches image table) ──
const MOCK_STUDENTS = [
  {
    id: 'stud-1',
    name: 'Adrian Alamsyah',
    pretest: 80,
    posttest: 100,
    improvement: 25,
    geftScore: 75,
    geftType: 'Field Dependent',
    classroom: 'Kelas Uji Coba'
  },
  {
    id: 'stud-2',
    name: 'Maya Andriana',
    pretest: 75,
    posttest: 90,
    improvement: 20,
    geftScore: 65,
    geftType: 'Field Independent',
    classroom: 'Kelas Uji Coba'
  },
  {
    id: 'stud-3',
    name: 'Kamasan Andrana',
    pretest: 90,
    posttest: 88,
    improvement: -2,
    geftScore: 78,
    geftType: 'Field Dependent',
    classroom: 'Kelas Uji Coba'
  }
]

// ── Default Focus Discussion Data (matches image) ──
const INITIAL_AVAILABLE: GroupStudent[] = [
  { id: 'av-1', name: 'Siswa Allah', label: 'FD GROUP 3 CANDIDATE', cognitiveStyle: 'FD' },
  { id: 'av-2', name: 'Siswa Senara', label: 'FD GROUP 4 CANDIDATE', cognitiveStyle: 'FD' },
  { id: 'av-3', name: 'Dilah Kozer', label: 'HIGH PERFORMANCE', cognitiveStyle: 'FI' },
]

const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp-1',
    name: 'Kelompok FD 1',
    students: [
      { id: 'g1-1', name: 'Nama Siswa', label: 'FD GROUP 1 CANDIDATE', cognitiveStyle: 'FD' },
      { id: 'g1-2', name: 'Nama Senara', label: 'FD GROUP 2 CANDIDATE', cognitiveStyle: 'FD' },
      { id: 'g1-3', name: 'Nama Salah', label: 'FD GROUP 3 CANDIDATE', cognitiveStyle: 'FD' },
    ]
  },
  {
    id: 'grp-2',
    name: 'Kelompok FD 2',
    students: [
      { id: 'g2-1', name: 'Nama Siswa', label: 'FD GROUP 2 CANDIDATE', cognitiveStyle: 'FD' },
      { id: 'g2-2', name: 'Nama Allah', label: 'FD GROUP 1 CANDIDATE', cognitiveStyle: 'FD' },
    ]
  }
]

export default function GuruPage() {
  const router = useRouter()
  
  // Passcode gate state
  const [passcode, setPasscode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passcodeError, setPasscodeError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Navigation Sidebar tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'modul-ajar' | 'under-construction'>('dashboard')
  const [constructionFeatureName, setConstructionFeatureName] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Database Students and RAG states
  const [students, setStudents] = useState<Student[]>([])
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  
  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingKnowledge, setLoadingKnowledge] = useState(true)

  // Sorting and searching in table
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('Nama Siswa')

  // Drag and Drop States
  const [availableStudents, setAvailableStudents] = useState<GroupStudent[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [lastSaved, setLastSaved] = useState('HARI INI, 10:45 AM')
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null)

  // Form states for CRUD (modul-ajar RAG)
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

  // Load drag-and-drop groups from local storage on mount/auth
  useEffect(() => {
    if (!isAuthorized) return

    const savedAvailable = localStorage.getItem('available_students')
    const savedGroups = localStorage.getItem('groups_fd')
    const savedTime = localStorage.getItem('last_saved_time')

    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    } else {
      setGroups(INITIAL_GROUPS)
    }

    if (savedAvailable) {
      setAvailableStudents(JSON.parse(savedAvailable))
    } else {
      // Dynamic merge if database students are present
      if (students.length > 0) {
        const dbGroupStudents: GroupStudent[] = students.map(s => ({
          id: s.id,
          name: s.name,
          label: s.geftResult?.cognitiveStyle === 'FI' ? 'HIGH PERFORMANCE' : 'FD CANDIDATE',
          cognitiveStyle: s.geftResult?.cognitiveStyle || 'FD'
        }))
        const assignedIds = new Set(
          (savedGroups ? JSON.parse(savedGroups) : INITIAL_GROUPS)
            .flatMap((g: Group) => g.students.map((st: GroupStudent) => st.id))
        )
        const filtered = dbGroupStudents.filter(st => !assignedIds.has(st.id))
        setAvailableStudents(filtered.length > 0 ? filtered : INITIAL_AVAILABLE)
      } else {
        setAvailableStudents(INITIAL_AVAILABLE)
      }
    }

    if (savedTime) {
      setLastSaved(savedTime)
    }
  }, [isAuthorized, students])

  // Handle Passcode verification
  const handleVerifyPasscode = () => {
    setPasscodeError('')
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

  // Handle Drag and Drop
  const handleDragStart = (e: React.DragEvent, studentId: string, source: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ studentId, source }))
  }

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault()
    setDragOverGroupId(null)
    try {
      const dataStr = e.dataTransfer.getData('text/plain')
      if (!dataStr) return
      const { studentId, source } = JSON.parse(dataStr)
      if (source === targetGroupId) return

      let studentToMove: GroupStudent | undefined

      // Retrieve student from source
      if (source === 'available') {
        studentToMove = availableStudents.find(s => s.id === studentId)
      } else {
        const srcGroup = groups.find(g => g.id === source)
        studentToMove = srcGroup?.students.find(s => s.id === studentId)
      }

      if (!studentToMove) return

      // Remove from source
      if (source === 'available') {
        setAvailableStudents(prev => prev.filter(s => s.id !== studentId))
      } else {
        setGroups(prev => prev.map(g => {
          if (g.id === source) {
            return { ...g, students: g.students.filter(s => s.id !== studentId) }
          }
          return g
        }))
      }

      // Add to target
      if (targetGroupId === 'available') {
        setAvailableStudents(prev => [...prev, studentToMove!])
      } else {
        setGroups(prev => prev.map(g => {
          if (g.id === targetGroupId) {
            if (g.students.some(s => s.id === studentId)) return g // Prevent duplicates
            return { ...g, students: [...g.students, studentToMove!] }
          }
          return g
        }))
      }
    } catch (err) {
      console.error('Drop error:', err)
    }
  }

  const removeStudentFromGroup = (studentId: string, groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    const student = group?.students.find(s => s.id === studentId)
    if (!student) return

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, students: g.students.filter(s => s.id !== studentId) }
      }
      return g
    }))
    setAvailableStudents(prev => [...prev, student])
  }

  const handleAddGroup = () => {
    setGroups(prev => [
      ...prev,
      {
        id: `grp-${Date.now()}`,
        name: `Kelompok FD ${prev.length + 1}`,
        students: []
      }
    ])
  }

  const handleAutoGroup = () => {
    if (availableStudents.length === 0) {
      alert('Tidak ada siswa tersedia untuk dikelompokkan secara otomatis.')
      return
    }
    if (groups.length === 0) {
      alert('Silakan buat kelompok terlebih dahulu.')
      return
    }

    const updatedGroups = groups.map(g => ({ ...g, students: [...g.students] }))
    
    // Auto distribute available students to groups with fewest students
    availableStudents.forEach(student => {
      let minGroup = updatedGroups[0]
      updatedGroups.forEach(g => {
        if (g.students.length < minGroup.students.length) {
          minGroup = g
        }
      })
      minGroup.students.push(student)
    })

    setGroups(updatedGroups)
    setAvailableStudents([])
  }

  const handleSaveGroups = () => {
    localStorage.setItem('available_students', JSON.stringify(availableStudents))
    localStorage.setItem('groups_fd', JSON.stringify(groups))
    
    const now = new Date()
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const period = now.getHours() >= 12 ? 'PM' : 'AM'
    const fullSaveTime = `HARI INI, ${timeStr} ${period}`
    
    localStorage.setItem('last_saved_time', fullSaveTime)
    setLastSaved(fullSaveTime)
    alert('Susunan kelompok FD berhasil disimpan!')
  }

  // Map database students into dashboard representation
  const getDisplayStudents = () => {
    if (students.length === 0) {
      return MOCK_STUDENTS
    }
    return students.map(s => {
      const cogStyle = s.geftResult?.cognitiveStyle
      const score = s.geftResult?.score
      const pretest = s.diagnosticScore || 80
      const posttest = s.diagnosticScore ? Math.min(100, Math.round(s.diagnosticScore * 1.15)) : (s.name.includes('Adrian') ? 100 : s.name.includes('Maya') ? 90 : 88)
      const improvement = pretest > 0 ? Math.round(((posttest - pretest) / pretest) * 100) : 15
      const geftScore = score !== undefined && score !== null ? Math.round((score / 18) * 100) : (s.name.includes('Adrian') ? 75 : s.name.includes('Maya') ? 65 : 78)
      const geftType = cogStyle === 'FI' ? 'Field Independent' : 'Field Dependent'
      
      return {
        id: s.id,
        name: s.name,
        pretest,
        posttest,
        improvement,
        geftScore,
        geftType,
        classroom: s.classroom?.name || 'Kelas Uji Coba'
      }
    })
  }

  // Filter and sort students list
  const filteredStudents = getDisplayStudents()
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'Nama Siswa') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'Peningkatan') {
        return b.improvement - a.improvement
      } else if (sortBy === 'Skor GEFT') {
        return b.geftScore - a.geftScore
      }
      return 0
    })

  // Handle RAG CRUD Submit
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
        await fetchKnowledge()
        resetForm()
        alert('Materi RAG berhasil disimpan!')
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

  const handleEditTrigger = (item: KnowledgeItem) => {
    setIsEditing(true)
    setEditingId(item.id)
    setFormTitle(item.title)
    setFormCategory(item.category)
    setFormContent(item.content)
  }

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

  const triggerConstruction = (feature: string) => {
    setConstructionFeatureName(feature)
    setActiveTab('under-construction')
  }

  if (checkingAuth) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EE' }}>
        <p style={{ color: '#1C1917', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Memuat Portal...</p>
      </main>
    )
  }

  // ── PASSCODE GATE UI ──
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
        fontFamily: "var(--font-sans), sans-serif",
        padding: '20px'
      }}>
        {/* Background Grid Pattern */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(180,140,80,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(180,140,80, 0.2)',
            boxShadow: '0 10px 40px rgba(143,79,6, 0.08)',
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
              background: 'none', border: 'none', color: '#8F4F06',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700, display: 'flex',
              alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0
            }}
          >
            ← Kembali ke Menu Utama
          </button>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(143,79,6,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <span style={{ fontSize: '28px' }}>🧑‍🏫</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#8F4F06', fontFamily: 'var(--font-heading)' }}>Portal Otoritas Guru</h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#78716C' }}>
              Silakan masukkan sandi otentikasi guru untuk masuk.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#78716C', letterSpacing: '1px', marginBottom: '8px' }}>
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
                  background: '#FAF6EE',
                  border: '1px solid rgba(180,140,80,0.3)',
                  color: '#1C1917', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            {passcodeError && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: '#FEF2F2', border: '1px solid #FCA5A5',
                color: '#EF4444', fontSize: '13px', lineHeight: 1.5
              }}>
                ⚠️ {passcodeError}
              </div>
            )}

            <button
              onClick={handleVerifyPasscode}
              style={{
                width: '100%', padding: '15px',
                borderRadius: '12px', border: 'none',
                background: '#8F4F06',
                color: '#FFFFFF', fontSize: '14px', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(143,79,6,0.2)',
                transition: 'background-color 0.2s',
                fontFamily: 'var(--font-heading)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#754005'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8F4F06'}
            >
              Masuk Dashboard
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  // ── MAIN TEACHER PORTAL LAYOUT ──
  return (
    <div className="dashboard-layout" style={{
      minHeight: '100vh',
      background: '#FAF6EE',
      color: '#1C1917',
      fontFamily: 'var(--font-sans), sans-serif',
      display: 'flex',
    }}>
      {/* CSS Styles for Responsiveness */}
      <style>{`
        .sidebar-aside {
          transition: all 0.3s ease;
        }
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .workspace-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column !important;
          }
          .sidebar-aside {
            display: none !important;
            width: 280px !important;
          }
          .sidebar-aside.mobile-open {
            display: flex !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            z-index: 100 !important;
            box-shadow: 0 0 40px rgba(0,0,0,0.15) !important;
            background: #FAF6EE !important;
          }
          .mobile-close-sidebar-btn {
            display: block !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .desktop-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            margin-bottom: 20px !important;
          }
          .header-widgets {
            width: 100% !important;
            justify-content: space-between !important;
            border-left: none !important;
            padding-left: 0 !important;
            gap: 12px !important;
          }
          .header-search {
            width: 100% !important;
            max-width: none !important;
          }
          .header-title {
            font-size: 20px !important;
          }
          .main-content {
            padding: 20px 16px !important;
          }
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .workspace-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .rag-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Sidebar Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000000',
              zIndex: 90,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── LEFT SIDEBAR ── */}
      <aside 
        className={`sidebar-aside ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: '260px',
          background: '#FAF6EE',
          borderRight: '1px solid rgba(180,140,80,0.18)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 0',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box'
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', background: '#8F4F06',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {/* Graduation Cap Shield SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11l4-2 4 2-4 2z"/><path d="M12 13v3"/></svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#8F4F06', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>Portal Guru</h2>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#854D0E', letterSpacing: '0.8px', display: 'block', marginTop: '2px' }}>SISTEM AKADEMIK TERPADU</span>
              </div>
            </div>
            {/* Mobile close button inside sidebar */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'none', background: 'none', border: 'none', color: '#8F4F06', cursor: 'pointer', padding: '4px'
              }}
              className="mobile-close-sidebar-btn"
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, padding: '0 12px' }}>
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: activeTab === 'dashboard' ? '#F4EFE6' : 'transparent',
              color: activeTab === 'dashboard' ? '#8F4F06' : '#78716C',
              fontSize: '14px', fontWeight: activeTab === 'dashboard' ? 800 : 600,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', borderLeft: activeTab === 'dashboard' ? '4px solid #8F4F06' : '4px solid transparent',
              borderTopLeftRadius: activeTab === 'dashboard' ? 0 : '12px',
              borderBottomLeftRadius: activeTab === 'dashboard' ? 0 : '12px'
            }}
          >
            <IconDashboard /> Dashboard
          </button>

          {/* Manajemen Kelas */}
          <button
            onClick={() => triggerConstruction('Manajemen Kelas')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: 'transparent', color: '#78716C',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', borderLeft: '4px solid transparent'
            }}
            className="sidebar-hover-btn"
          >
            <IconKelas /> Manajemen Kelas
          </button>

          {/* Laporan Nilai */}
          <button
            onClick={() => triggerConstruction('Laporan Nilai')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: 'transparent', color: '#78716C',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', borderLeft: '4px solid transparent'
            }}
          >
            <IconNilai /> Laporan Nilai
          </button>

          {/* Pengaturan Kelompok */}
          <button
            onClick={() => {
              setActiveTab('dashboard')
              setTimeout(() => {
                const element = document.getElementById('grouping-section')
                if (element) element.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: 'transparent', color: '#78716C',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', borderLeft: '4px solid transparent'
            }}
          >
            <IconKelompok /> Pengaturan Kelompok
          </button>

          {/* Modul Ajar */}
          <button
            onClick={() => setActiveTab('modul-ajar')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: activeTab === 'modul-ajar' ? '#F4EFE6' : 'transparent',
              color: activeTab === 'modul-ajar' ? '#8F4F06' : '#78716C',
              fontSize: '14px', fontWeight: activeTab === 'modul-ajar' ? 800 : 600,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', borderLeft: activeTab === 'modul-ajar' ? '4px solid #8F4F06' : '4px solid transparent',
              borderTopLeftRadius: activeTab === 'modul-ajar' ? 0 : '12px',
              borderBottomLeftRadius: activeTab === 'modul-ajar' ? 0 : '12px'
            }}
          >
            <IconModul /> Modul Ajar
          </button>

          {/* Profil Guru */}
          <button
            onClick={() => triggerConstruction('Profil Guru')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: 'transparent', color: '#78716C',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', borderLeft: '4px solid transparent'
            }}
          >
            <IconProfil /> Profil Guru
          </button>
        </nav>

        {/* Lower Sidebar Actions */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => triggerConstruction('Buat Modul Baru')}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
              background: '#8F4F06', color: '#FFFFFF', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(143,79,6,0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#754005'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8F4F06'}
          >
            Buat Modul Baru
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
              background: 'transparent', color: '#78716C', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#8F4F06'}
            onMouseLeave={e => e.currentTarget.style.color = '#78716C'}
          >
            <IconKeluar /> Keluar
          </button>
        </div>
      </aside>

      {/* ── RIGHT MAIN PANEL ── */}
      <main className="main-content" style={{ flex: 1, padding: '30px 40px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Mobile Header Bar */}
        <div className="mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(180,140,80,0.15)', paddingBottom: '12px' }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', color: '#8F4F06', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px', background: '#8F4F06',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span style={{ fontWeight: 800, color: '#8F4F06', fontSize: '14px', fontFamily: 'var(--font-heading)' }}>Portal Guru</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/profile_sarah.png"
              alt="Sarah Wijaya Portrait"
              style={{
                width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #8F4F06',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>

        {/* ── TOP HEADER ── */}
        <header className="desktop-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '32px'
        }}>
          {/* Title */}
          <div>
            <h1 className="header-title" style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#8F4F06', fontFamily: 'var(--font-heading)' }}>
              Guru Statistika-Two
            </h1>
          </div>

          {/* Right Header Widgets */}
          <div className="header-widgets" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Search Input */}
            <div className="header-search" style={{ position: 'relative', width: '220px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }}>
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Cari Siswa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px 10px 38px', borderRadius: '50px',
                  background: '#F0EAE1', border: 'none',
                  fontSize: '13px', color: '#1C1917', outline: 'none',
                  fontWeight: 600
                }}
              />
            </div>

            {/* Notification Bell */}
            <button style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer', position: 'relative', padding: '4px' }}>
              <IconBell />
              {/* Red dot indicator */}
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '7px', height: '7px', background: '#EF4444', borderRadius: '50%' }} />
            </button>

            {/* Settings Gear */}
            <button style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer', padding: '4px' }}>
              <IconGear />
            </button>

            {/* Profile Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(180,140,80,0.18)', paddingLeft: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>Dr. Sarah Wijaya</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#78716C', marginTop: '2px' }}>Koordinator Statistika</div>
              </div>
              <img
                src="/profile_sarah.png"
                alt="Sarah Wijaya Portrait"
                style={{
                  width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #8F4F06',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </header>

        {/* ── TAB CONTENT: DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* ROW 1: THREE CARDS */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {/* Card 1: Ringkasan Nilai */}
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', padding: '24px',
                border: '1px solid rgba(180,140,80,0.15)', boxShadow: '0 4px 20px rgba(143,79,6,0.02)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px', boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>Ringkasan Nilai</h3>
                  <button style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer' }}>
                    <IconDotsVertical />
                  </button>
                </div>

                {/* SVG/HTML Bar Chart */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100px', borderBottom: '1px solid #E7E5E4', paddingBottom: '6px', position: 'relative' }}>
                    {/* Bars Grid Lines */}
                    <div style={{ position: 'absolute', left: '20px', right: '20px', height: '1px', background: '#F5F5F4', bottom: '40px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', left: '20px', right: '20px', height: '1px', background: '#F5F5F4', bottom: '70px', pointerEvents: 'none' }} />

                    {/* Bars Adrian */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                        <div title="Pretest: 80" style={{ width: '12px', height: '60px', background: '#8F4F06', borderRadius: '3px 3px 0 0' }} />
                        <div title="Posttest: 100" style={{ width: '12px', height: '75px', background: '#E27D30', borderRadius: '3px 3px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '9px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Adrian</span>
                    </div>

                    {/* Bars Maya */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                        <div title="Pretest: 75" style={{ width: '12px', height: '56px', background: '#8F4F06', borderRadius: '3px 3px 0 0' }} />
                        <div title="Posttest: 90" style={{ width: '12px', height: '68px', background: '#E27D30', borderRadius: '3px 3px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '9px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Maya</span>
                    </div>

                    {/* Bars Kamasan */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                        <div title="Pretest: 90" style={{ width: '12px', height: '68px', background: '#8F4F06', borderRadius: '3px 3px 0 0' }} />
                        <div title="Posttest: 88" style={{ width: '12px', height: '66px', background: '#E27D30', borderRadius: '3px 3px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '9px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Kamasan</span>
                    </div>
                  </div>
                </div>

                {/* Legends */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontWeight: 700, color: '#78716C', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8F4F06' }} /> Pretest
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E27D30' }} /> Posttest
                  </div>
                </div>
              </div>

              {/* Card 2: Status Kelompok */}
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', padding: '24px',
                border: '1px solid rgba(180,140,80,0.15)', boxShadow: '0 4px 20px rgba(143,79,6,0.02)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px', boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>Status Kelompok</h3>
                  <button style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer' }}>
                    <IconTrendUp />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, marginTop: '12px' }}>
                  {/* SVG Donut Chart */}
                  <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#E7E5E4" strokeWidth="12" />
                      {/* Brown circle representing 4/6 of groups */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#8F4F06" strokeWidth="12"
                        strokeDasharray="159.2 238.7" strokeDashoffset="0" strokeLinecap="round" />
                      {/* Orange circle representing 2/6 of groups */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#E27D30" strokeWidth="12"
                        strokeDasharray="79.6 238.7" strokeDashoffset="-159.2" strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#1C1917', lineHeight: 1 }}>6</div>
                      <div style={{ fontSize: '8px', fontWeight: 800, color: '#78716C', letterSpacing: '0.5px', marginTop: '2px' }}>TOTAL</div>
                    </div>
                  </div>

                  {/* Legends */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8F4F06', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>4 Kelompok</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#78716C', fontWeight: 600, marginLeft: '14px' }}>Terbentuk</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E27D30', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>2 Kelompok</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#78716C', fontWeight: 600, marginLeft: '14px' }}>Belum Selesai</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Aktivitas Terkini */}
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', padding: '24px',
                border: '1px solid rgba(180,140,80,0.15)', boxShadow: '0 4px 20px rgba(143,79,6,0.02)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px', boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>Aktivitas Terkini</h3>
                  <button
                    onClick={() => triggerConstruction('Semua Aktivitas')}
                    style={{ background: 'none', border: 'none', color: '#E27D30', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Lihat Semua
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginTop: '14px', overflowY: 'auto' }}>
                  {/* Item 1 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: '#FAF5EF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(143,79,6,0.1)'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F4F06" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>Submission 3 siswa baru</div>
                      <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Tugas GEFT atau Posttest selesai</div>
                      <span style={{ fontSize: '9px', color: '#A8A29E', fontWeight: 500, display: 'block', marginTop: '2px' }}>2 menit yang lalu</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: '#FAF5EF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(143,79,6,0.1)'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F4F06" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>Update Laporan Nilai</div>
                      <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Statistika Kelas B telah dirangkum</div>
                      <span style={{ fontSize: '9px', color: '#A8A29E', fontWeight: 500, display: 'block', marginTop: '2px' }}>45 menit yang lalu</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: '#FAF5EF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(143,79,6,0.1)'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F4F06" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>Siswa Baru Terdaftar</div>
                      <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>Lidia Kozer bergabung ke kelas</div>
                      <span style={{ fontSize: '9px', color: '#A8A29E', fontWeight: 500, display: 'block', marginTop: '2px' }}>1 jam yang lalu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: NILAI SISWA & GEFT */}
            <div style={{
              background: '#FFFFFF', borderRadius: '24px', padding: '24px',
              border: '1px solid rgba(180,140,80,0.15)', boxShadow: '0 4px 20px rgba(143,79,6,0.02)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1C1917' }}>Nilai Siswa & Hasil GEFT</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78716C', fontWeight: 600 }}>Monitoring perkembangan kognitif siswa</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Sorting dropdown */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      style={{
                        padding: '10px 32px 10px 16px', borderRadius: '10px',
                        background: '#FAF6EE', border: '1px solid rgba(180,140,80,0.25)',
                        color: '#8F4F06', fontSize: '12px', fontWeight: 800, outline: 'none',
                        cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none'
                      }}
                    >
                      <option value="Nama Siswa">Urutkan: Nama Siswa</option>
                      <option value="Peningkatan">Urutkan: Peningkatan</option>
                      <option value="Skor GEFT">Urutkan: Skor GEFT</option>
                    </select>
                    {/* Caret SVG */}
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8F4F06' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={() => {
                      alert('Mengunduh data siswa dalam format CSV...')
                      const dataCSV = getDisplayStudents().map(s => `${s.name},${s.pretest},${s.posttest},${s.improvement}%,${s.geftScore},${s.geftType}`).join('\n')
                      const blob = new Blob([`Nama Siswa,Pretest,Posttest,Peningkatan,Skor GEFT,Tipe GEFT\n${dataCSV}`], { type: 'text/csv' })
                      const link = document.createElement('a')
                      link.href = URL.createObjectURL(blob)
                      link.download = 'laporan_nilai_siswa.csv'
                      link.click()
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '10px', border: 'none',
                      background: '#8F4F06', color: '#FFFFFF', fontSize: '12px', fontWeight: 800,
                      cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#754005'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8F4F06'}
                  >
                    <IconExport /> Ekspor Data
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(180,140,80,0.15)', fontSize: '11px', fontWeight: 800, color: '#A8A29E' }}>
                      <th style={{ padding: '12px 16px', letterSpacing: '0.5px' }}>NAMA SISWA</th>
                      <th style={{ padding: '12px 16px', letterSpacing: '0.5px' }}>PRETEST (100)</th>
                      <th style={{ padding: '12px 16px', letterSpacing: '0.5px' }}>POSTTEST (100)</th>
                      <th style={{ padding: '12px 16px', letterSpacing: '0.5px' }}>PENINGKATAN</th>
                      <th style={{ padding: '12px 16px', letterSpacing: '0.5px' }}>SKOR GEFT</th>
                      <th style={{ padding: '12px 16px', letterSpacing: '0.5px' }}>TIPE GEFT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#78716C', fontWeight: 600 }}>
                          Tidak ada siswa yang sesuai pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => {
                        const init = st.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        const isIncrease = st.improvement >= 0
                        return (
                          <tr key={st.id} style={{ borderBottom: '1px solid rgba(180,140,80,0.06)' }}>
                            {/* Avatar & Name */}
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  background: st.id === 'stud-1' ? '#FAF2E6' : st.id === 'stud-2' ? '#FAF6EE' : '#F6F0E7',
                                  color: '#8F4F06', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '11px', fontWeight: 800, border: '1px solid rgba(143,79,6,0.15)'
                                }}>
                                  {init}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>{st.name}</span>
                              </div>
                            </td>
                            {/* Pretest */}
                            <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#44403C' }}>{st.pretest}</td>
                            {/* Posttest */}
                            <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#44403C' }}>{st.posttest}</td>
                            {/* Peningkatan */}
                            <td style={{ padding: '16px' }}>
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '4px 10px', borderRadius: '20px',
                                background: isIncrease ? '#FDF4E3' : '#FEE2E2',
                                color: isIncrease ? '#D97706' : '#EF4444',
                                fontSize: '11px', fontWeight: 800
                              }}>
                                {isIncrease ? <IconTrendUp /> : <IconTrendDown />} {isIncrease ? '+' : ''}{st.improvement}%
                              </div>
                            </td>
                            {/* Skor GEFT */}
                            <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: '#8F4F06' }}>{st.geftScore}</td>
                            {/* Tipe GEFT */}
                            <td style={{ padding: '16px' }}>
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', borderRadius: '20px',
                                background: '#FAF5EF', border: '1px solid rgba(143,79,6,0.15)',
                                color: '#8F4F06', fontSize: '11px', fontWeight: 800
                              }}>
                                {/* Brain bulb SVG */}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8F4F06" strokeWidth="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                                {st.geftType}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ROW 3: INTERACTIVE DRAG & DROP GROUP MAKER */}
            <div id="grouping-section" style={{
              background: '#FFFFFF', borderRadius: '24px', padding: '24px',
              border: '1px solid rgba(180,140,80,0.15)', boxShadow: '0 4px 20px rgba(143,79,6,0.02)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1C1917' }}>Pembentukan Kelompok Focus Discussion (FD)</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#78716C', fontWeight: 600 }}>Organisir diskusi kelompok berdasarkan kognitif siswa</p>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Atur ulang susunan kelompok ke default?')) {
                      setAvailableStudents(INITIAL_AVAILABLE)
                      setGroups(INITIAL_GROUPS)
                      localStorage.removeItem('available_students')
                      localStorage.removeItem('groups_fd')
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(180,140,80,0.3)',
                    background: '#FFFFFF', color: '#78716C', fontSize: '12px', fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8F4F06'; e.currentTarget.style.color = '#8F4F06' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(180,140,80,0.3)'; e.currentTarget.style.color = '#78716C' }}
                >
                  <IconHistory /> Riwayat
                </button>
              </div>

              {/* Workspace Grid */}
              <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', alignItems: 'start' }}>
                
                {/* Column 1: Siswa Tersedia */}
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, 'available')}
                  style={{
                    background: '#FAF6EE', borderRadius: '20px', padding: '16px',
                    border: '2px dashed #B48C50', minHeight: '340px', boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#8F4F06' }}>🧑‍🎓</span>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#8c5d18' }}>Siswa Tersedia</h4>
                    </div>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%', background: '#8F4F06'
                    }} />
                  </div>

                  {/* Available cards list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {availableStudents.length === 0 ? (
                      <div style={{ padding: '24px 10px', textAlign: 'center', color: '#A8A29E', fontSize: '11px', fontWeight: 700 }}>
                        Semua siswa telah ditempatkan!
                      </div>
                    ) : (
                      availableStudents.map(student => (
                        <div
                          key={student.id}
                          draggable
                          onDragStart={e => handleDragStart(e, student.id, 'available')}
                          style={{
                            background: '#FFFFFF', border: '1px solid rgba(180,140,80,0.18)',
                            borderRadius: '12px', padding: '12px 14px', cursor: 'grab',
                            boxShadow: '0 2px 6px rgba(143,79,6,0.02)', transition: 'transform 0.2s'
                          }}
                          className="draggable-card"
                        >
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#1C1917' }}>{student.name}</div>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#A8A29E', marginTop: '4px', letterSpacing: '0.3px' }}>
                            {student.label}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2 & 3: Groups */}
                {groups.map(group => {
                  const isHovered = dragOverGroupId === group.id
                  return (
                    <div
                      key={group.id}
                      onDragOver={e => {
                        e.preventDefault()
                        if (dragOverGroupId !== group.id) setDragOverGroupId(group.id)
                      }}
                      onDragLeave={() => setDragOverGroupId(null)}
                      onDrop={e => handleDrop(e, group.id)}
                      style={{
                        background: '#FFFFFF', borderRadius: '20px', padding: '16px',
                        border: '1px solid rgba(180,140,80,0.15)', minHeight: '340px', boxSizing: 'border-box',
                        borderTop: '4px solid #8F4F06', boxShadow: '0 4px 12px rgba(143,79,6,0.02)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        backgroundColor: isHovered ? '#FCFAF5' : '#FFFFFF',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div>
                        {/* Group Title and Settings */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>{group.name}</h4>
                          <button style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer' }}>
                            <IconGear />
                          </button>
                        </div>

                        {/* List students inside group */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {group.students.map(student => (
                            <div
                              key={student.id}
                              draggable
                              onDragStart={e => handleDragStart(e, student.id, group.id)}
                              style={{
                                background: '#FAF6EE', border: '1px solid rgba(180,140,80,0.1)',
                                borderRadius: '10px', padding: '10px 12px', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center', cursor: 'grab'
                              }}
                            >
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1C1917' }}>{student.name}</span>
                              <button
                                onClick={() => removeStudentFromGroup(student.id, group.id)}
                                style={{ background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: 0 }}
                              >
                                <IconClose />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Drop Siswa Area */}
                      <div style={{
                        border: '2px dashed rgba(180,140,80,0.25)', borderRadius: '10px',
                        padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 800,
                        color: '#8F4F06', marginTop: '16px', background: 'rgba(180,140,80,0.02)'
                      }}>
                        + Drop Siswa
                      </div>
                    </div>
                  )
                })}

                {/* Column 4: Controls and Save */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                  {/* Add Group */}
                  <button
                    onClick={handleAddGroup}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: '#FFFFFF', border: '2px dashed rgba(143,79,6,0.3)',
                      color: '#8F4F06', fontSize: '12px', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8F4F06'; e.currentTarget.style.backgroundColor = '#FAF5EF' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(143,79,6,0.3)'; e.currentTarget.style.backgroundColor = '#FFFFFF' }}
                  >
                    <IconPlus /> Tambah Kelompok Baru
                  </button>

                  {/* Auto Grouping */}
                  <button
                    onClick={handleAutoGroup}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                      background: '#E27D30', color: '#FFFFFF', fontSize: '12px', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 10px rgba(226,125,48,0.15)', transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#CD6C24'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#E27D30'}
                  >
                    <IconSparkles /> Grup Secara Otomatis
                  </button>

                  {/* Save Layout */}
                  <button
                    onClick={handleSaveGroups}
                    style={{
                      width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                      background: '#8F4F06', color: '#FFFFFF', fontSize: '13px', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(143,79,6,0.2)', transition: 'background-color 0.2s',
                      marginTop: '8px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#754005'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8F4F06'}
                  >
                    Simpan Susunan Kelompok FD
                  </button>

                  {/* Save Timestamp */}
                  <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 800, color: '#A8A29E', marginTop: '4px', letterSpacing: '0.5px' }}>
                    TERAKHIR DISIMPAN: {lastSaved.toUpperCase()}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT: MODUL AJAR (RAG CRUD MANAGER) ── */}
        {activeTab === 'modul-ajar' && (
          <div className="rag-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px', alignItems: 'start' }}>
            
            {/* Form Column (Create/Update) */}
            <div style={{
              background: '#FFFFFF', border: '1px solid rgba(180,140,80,0.15)',
              borderRadius: '24px', padding: '24px', position: 'sticky', top: '20px',
              boxShadow: '0 4px 20px rgba(143,79,6,0.02)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, color: '#8F4F06', fontFamily: 'var(--font-heading)' }}>
                {isEditing ? '📝 Edit Pengetahuan' : '✨ Tambah Pengetahuan'}
              </h3>

              <form onSubmit={handleSaveKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#78716C', letterSpacing: '1px', marginBottom: '8px' }}>
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
                      background: '#FAF6EE', border: '1px solid rgba(180,140,80,0.25)',
                      color: '#1C1917', fontSize: '13px', outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#78716C', letterSpacing: '1px', marginBottom: '8px' }}>
                    KATEGORI
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 14px', borderRadius: '10px',
                      background: '#FAF6EE', border: '1px solid rgba(180,140,80,0.25)',
                      color: '#8F4F06', fontSize: '13px', outline: 'none', fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="statistika">Statistika (Materi Pembelajaran)</option>
                    <option value="gameplay">Gameplay (Petunjuk Game Skeptikos)</option>
                    <option value="umum">Umum / Profil Gaya Kognitif</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#78716C', letterSpacing: '1px', marginBottom: '8px' }}>
                    KONTEN PENGETAHUAN (RAG TEXT)
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Tuliskan materi statistika detail yang akan dirujuk oleh AI Chatbot. Gunakan kalimat yang lugas dan informatif..."
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px 14px', borderRadius: '10px',
                      background: '#FAF6EE', border: '1px solid rgba(180,140,80,0.25)',
                      color: '#1C1917', fontSize: '13px', outline: 'none',
                      fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.55
                    }}
                  />
                </div>

                {formError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: '#FEF2F2', border: '1px solid #FCA5A5',
                    color: '#EF4444', fontSize: '13px', lineHeight: 1.5
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
                        borderRadius: '10px', border: '1px solid rgba(180,140,80,0.3)',
                        background: 'transparent', color: '#78716C', fontSize: '13px',
                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: 'var(--font-heading)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF6EE'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
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
                      background: '#8F4F06',
                      color: '#FFFFFF', fontSize: '13px', fontWeight: 800,
                      cursor: formSaving ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
                      fontFamily: 'var(--font-heading)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#754005'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8F4F06'}
                  >
                    {formSaving ? 'Menyimpan...' : 'Simpan Materi 💾'}
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#8F4F06', fontFamily: 'var(--font-heading)' }}>
                Daftar Dokumen RAG saat ini
              </h3>

              {loadingKnowledge ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#78716C', fontWeight: 600 }}>
                  Memuat data pangkalan pengetahuan RAG...
                </div>
              ) : knowledgeItems.length === 0 ? (
                <div style={{
                  background: '#FFFFFF', border: '1px dashed rgba(180,140,80,0.3)',
                  padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#78716C', fontWeight: 600
                }}>
                  Belum ada dokumen yang tersimpan. Sistem akan otomatis mengisi data default pada percakapan pertama siswa.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {knowledgeItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#FFFFFF', border: '1px solid rgba(180,140,80,0.15)',
                        borderRadius: '16px', padding: '20px',
                        display: 'flex', flexDirection: 'column', gap: '12px',
                        boxShadow: '0 4px 12px rgba(143,79,6,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800,
                            background: item.category === 'statistika' ? '#EFF6FF' : item.category === 'gameplay' ? '#ECFDF5' : '#FEF3C7',
                            border: `1px solid ${item.category === 'statistika' ? '#BFDBFE' : item.category === 'gameplay' ? '#A7F3D0' : '#FDE68A'}`,
                            color: item.category === 'statistika' ? '#1D4ED8' : item.category === 'gameplay' ? '#047857' : '#B45309',
                            textTransform: 'uppercase', marginBottom: '6px'
                          }}>
                            {item.category}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>{item.title}</h4>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleEditTrigger(item)}
                            style={{
                              border: '1px solid rgba(180,140,80,0.3)', background: 'transparent',
                              color: '#78716C', fontSize: '11px', fontWeight: 800,
                              padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FAF6EE'; e.currentTarget.style.color = '#8F4F06' }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#78716C' }}
                          >
                            Edit ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteKnowledge(item.id)}
                            style={{
                              border: '1px solid rgba(239, 68, 68, 0.4)', background: 'transparent',
                              color: '#EF4444', fontSize: '11px', fontWeight: 800,
                              padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            Hapus 🗑️
                          </button>
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: '12.5px', color: '#44403C', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {item.content}
                      </p>
                      
                      <div style={{ fontSize: '9px', color: '#A8A29E', borderTop: '1px solid rgba(180,140,80,0.1)', paddingTop: '8px', textAlign: 'right', fontWeight: 700 }}>
                        Diperbarui: {new Date(item.updatedAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: UNDER CONSTRUCTION ── */}
        {activeTab === 'under-construction' && (
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(180,140,80,0.15)',
            borderRadius: '24px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 4px 20px rgba(143,79,6,0.02)', maxWidth: '500px', margin: '40px auto 0'
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>🚧</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#8F4F06', fontFamily: 'var(--font-heading)' }}>
              Fitur {constructionFeatureName} Sedang Dikembangkan
            </h3>
            <p style={{ margin: '12px 0 24px', fontSize: '13px', color: '#78716C', lineHeight: 1.5, fontWeight: 600 }}>
              Modul manajemen dashboard sedang diselaraskan untuk integrasi kurikulum statistika berkelanjutan. Fitur ini akan segera tersedia.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '12px 24px', borderRadius: '10px', border: 'none',
                background: '#8F4F06', color: '#FFFFFF', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', transition: 'background-color 0.2s',
                fontFamily: 'var(--font-heading)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#754005'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8F4F06'}
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}

      </main>
    </div>
  )
}