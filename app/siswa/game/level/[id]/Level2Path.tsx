'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '../../_components/BadgeUnlock'
import DiRA from '../../_components/DiRA'
import { BADGES, STATS, cyberbullyingData, CORRECT_VERDICT, VERDICT_EXPLANATION } from '../../_data/level2'
import TeamGateButton from '../../_components/TeamGateButton'
import { useGameRealtime } from '@/lib/hooks/useGameRealtime'

// Types of phases in Level 2
// - 'prolog': show infographics, write conclusion
// - 'briefing': Dira explains the mission
// - 'map': interactive school blueprint
// - 'obstacle': PISA question block
// - 'exploration': collect data from victims
// - 'interrogation': talk to the perpetrator, advice digital literacy
// - 'calculation': compute mean, median, modus
// - 'verdict': select final conclusion
// - 'completed': myth busted overlay / final screen
type Level2Phase = 'prolog' | 'briefing' | 'map' | 'obstacle' | 'exploration' | 'interrogation' | 'calculation' | 'verdict' | 'completed'

interface PendingBadge { icon: string; name: string; desc: string; id: string }
interface Member { id: string; name: string }
interface ChatMessage { id: string; studentId: string; senderName: string; content: string; createdAt: string }

interface Level2PathProps {
  cognitiveStyle: 'FI' | 'FD'
  teamId?: string | null
  studentId?: string
  studentName?: string
  demoMode?: boolean
}

const INFOGRAPHICS = [
  {
    id: 1,
    title: 'Prevalensi Nasional',
    desc: 'Studi KPAI menyatakan sekitar 45% anak remaja di Indonesia mengaku pernah mengalami perundungan siber (cyberbullying) dalam berbagai bentuk.',
    img: '/infographics/1.jpeg',
    color: '#38BDF8',
    icon: '📊'
  },
  {
    id: 2,
    title: 'Platform Utama',
    desc: 'Ejekan siber paling banyak terjadi di media sosial: WhatsApp (49%), disusul oleh Instagram (38%), dan TikTok (13%).',
    img: '/infographics/2.jpeg',
    color: '#FB7185',
    icon: '📱'
  },
  {
    id: 3,
    title: 'Dampak Psikologis',
    desc: 'Mayoritas korban mengalami gangguan kecemasan, depresi, dan penurunan konsentrasi belajar akademis yang sangat signifikan.',
    img: '/infographics/3.jpeg',
    color: '#FBBF24',
    icon: '🧠'
  },
  {
    id: 4,
    title: 'Etika Bermedia',
    desc: 'Kesadaran digital untuk selalu menyaring pesan, menghindari komentar kasar, dan menjaga empati sangat penting dalam bermedia sosial.',
    img: '/infographics/4.jpeg',
    color: '#34D399',
    icon: '🛡️'
  }
]

// 4 Locations metadata
const LOCATIONS = [
  { id: 'labkom', name: 'Labkom / Kelas', icon: '💻', count: 8, bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#38BDF8' },
  { id: 'lorong', name: 'Lorong Sekolah', icon: '🏫', count: 7, bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FB7185' },
  { id: 'lapangan', name: 'Lapangan Utama', icon: '🏟️', count: 7, bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#4ADE80' },
  { id: 'kantin', name: 'Kantin Sekolah', icon: '🍽️', count: 8, bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FBBF24' },
]

// PISA Questions for each location
const PISA_QUESTIONS: Record<string, { q: string; opts: string[]; correct: number; explanation: string }> = {
  labkom: {
    q: 'Hasil survei penggunaan internet di kelas X menunjukkan bahwa 40% siswa menggunakan internet untuk media sosial selama 2 jam, 30% selama 3 jam, dan 30% sisanya selama 4 jam. Berapakah rata-rata (mean) durasi penggunaan internet siswa kelas X tersebut?',
    opts: ['2.7 jam', '2.9 jam', '3.0 jam', '3.2 jam'],
    correct: 1,
    explanation: 'Rata-rata tertimbang = (0.40 * 2) + (0.30 * 3) + (0.30 * 4) = 0.8 + 0.9 + 1.2 = 2.9 jam.'
  },
  lorong: {
    q: 'Seorang guru mencatat jumlah buku yang dibaca oleh 9 siswa dalam satu bulan: 2, 3, 3, 4, 5, 5, 5, 7, 18. Guru tersebut ingin menggunakan ukuran pemusatan yang paling menggambarkan mayoritas data tanpa terpengaruh oleh nilai ekstrem (outlier 18). Ukuran pemusatan manakah yang paling tepat digunakan?',
    opts: ['Mean (Rata-rata), karena menjumlahkan semua data.', 'Median, karena membagi data menjadi dua bagian sama besar dan tidak terpengaruh oleh pencilan 18.', 'Modus, karena bernilai 3.', 'Range (Jangkauan), karena mengukur penyebaran data.'],
    correct: 1,
    explanation: 'Nilai 18 adalah pencilan (outlier) yang mendistorsi nilai Mean menjadi 5.7 (padahal mayoritas membaca 5 buku atau kurang). Median (5) adalah representasi pusat yang paling stabil dalam kasus ini.'
  },
  lapangan: {
    q: 'Di suatu kelas, nilai rata-rata ujian matematika dari 19 siswa adalah 75. Ketika seorang siswa baru mengikuti susulan dan nilainya digabungkan, nilai rata-rata kelas tersebut naik menjadi 76. Berapakah nilai ujian siswa baru tersebut?',
    opts: ['76', '85', '95', '98'],
    correct: 2,
    explanation: 'Jumlah nilai awal = 19 * 75 = 1425. Jumlah nilai baru = 20 * 76 = 1520. Nilai siswa baru = 1520 - 1425 = 95.'
  },
  kantin: {
    q: 'Tabel frekuensi saudara kandung dari sekelompok siswa menunjukkan: 0 saudara (f = 3), 1 saudara (f = 6), 2 saudara (f = 8), 3 saudara (f = 3). Manakah pernyataan yang benar mengenai modus dan median dari data tersebut?',
    opts: ['Modus = 2, Median = 1', 'Modus = 2, Median = 2', 'Modus = 8, Median = 2', 'Modus = 8, Median = 1.5'],
    correct: 1,
    explanation: 'Modus adalah nilai dengan frekuensi tertinggi, yaitu 2 (f = 8). Jumlah data n = 3+6+8+3 = 20. Median terletak antara data ke-10 (nilai 2) dan ke-11 (nilai 2), sehingga Median = 2. Jadi Modus = 2 dan Median = 2.'
  }
}

// Victims data grouped by location
const VICTIMS: Record<string, { txt: string; val: number }[]> = {
  labkom: [
    { txt: 'Seseorang terus mengirimiku pesan sampah di grup chat kelas...', val: 2 },
    { txt: 'Fotonya diedit jelek dan dibagikan ke teman-teman...', val: 2 },
    { txt: 'Aku dikeluarkan dari grup WhatsApp belajar...', val: 2 },
    { txt: 'Ada akun palsu yang memakai namaku dan mengunggah hal memalukan...', val: 2 },
    { txt: 'Mereka mengomentari penampilanku dengan kasar di medsos...', val: 3 },
    { txt: 'Aku diejek terus di kolom komentar Instagram...', val: 4 },
    { txt: 'Fotonya diedit jadi meme jelek...', val: 4 },
    { txt: 'Mereka mengirimi pesan ancaman di WhatsApp...', val: 4 },
  ],
  lorong: [
    { txt: 'Mereka menertawakanku saat aku lewat karena postingan TikTok palsu...', val: 4 },
    { txt: 'Ada yang menyebarkan rumor bohong tentang diriku di media sosial...', val: 4 },
    { txt: 'Aku dikucilkan dari pertemanan kelas online...', val: 5 },
    { txt: 'Mereka mengomentari gaya berpakaianku secara sarkastik...', val: 6 },
    { txt: 'Fotonya disebarkan dengan caption menghina...', val: 6 },
    { txt: 'Aku diejek bodoh di grup WhatsApp sekolah...', val: 7 },
    { txt: 'Ada yang menyebarkan fotoku tanpa izin dan mencemarkan namaku...', val: 8 },
  ],
  lapangan: [
    { txt: 'Mereka membuat tagar negatif khusus untuk mengejekku di Twitter...', val: 9 },
    { txt: 'Fotonya disebarkan di grup sekolah dengan komentar rasis...', val: 9 },
    { txt: 'Aku terus diteror pesan kebencian setiap malam...', val: 10 },
    { txt: 'Mereka mengomentari setiap status yang kubuat dengan kata-kata kotor...', val: 10 },
    { txt: 'Aku dikeluarkan dari pertemanan game online kelas...', val: 10 },
    { txt: 'Ada akun anonim yang terus-menerus merundungku di medsos...', val: 11 },
    { txt: 'Mereka mengunggah video aib saat aku terjatuh di lapangan...', val: 12 },
  ],
  kantin: [
    { txt: 'Aku diejek karena berat badan di postingan kantin...', val: 12 },
    { txt: 'Mereka menertawakan caraku makan di WhatsApp group...', val: 13 },
    { txt: 'Ada postingan gosip tentangku yang disukai banyak anak sekolah...', val: 13 },
    { txt: 'Mereka mengucilkan aku saat makan siang di kantin...', val: 14 },
    { txt: 'Mereka mengirim spam pesan cacian di story Instagram-ku...', val: 15 },
    { txt: 'Aku diejek tidak punya uang jajan di grup chat...', val: 16 },
    { txt: 'Fotonya di-crop dan diberi tulisan menghina...', val: 16 },
    { txt: 'Mereka terus meneror dengan stiker ejekan di WhatsApp...', val: 16 },
  ]
}

export default function Level2Path({
  cognitiveStyle,
  teamId = null,
  studentId,
  studentName,
  demoMode = false,
}: Level2PathProps) {
  const router = useRouter()
  const isFD = cognitiveStyle === 'FD'

  // Zustand Actions
  const { addXP, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime, lives, loseLife, xp } = useGameStore()

  // Phase & Navigation States
  const [phase, setPhase] = useState<Level2Phase>('prolog')
  const [prologConclusion, setPrologConclusion] = useState('')
  const [activeInfographicIdx, setActiveInfographicIdx] = useState(0)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getDiff = (idx: number, activeIdx: number) => {
    let diff = idx - activeIdx;
    while (diff < -2) diff += 4;
    while (diff > 1) diff -= 4;
    return diff;
  };


  // School Map & Exploration States
  const [visitedLocations, setVisitedLocations] = useState<string[]>([])
  const [activeLoc, setActiveLoc] = useState<string | null>(null)
  const [pisaLoc, setPisaLoc] = useState<string | null>(null)
  const [selectedPisaOpt, setSelectedPisaOpt] = useState<number | null>(null)
  const [pisaSubmitted, setPisaSubmitted] = useState(false)
  const [pisaCorrect, setPisaCorrect] = useState(false)

  // Local Collected Data list
  const [collectedCount, setCollectedCount] = useState<number>(0)
  const [victimsVisited, setVictimsVisited] = useState<Record<string, number[]>>({
    labkom: [], lorong: [], lapangan: [], kantin: []
  })

  // Red Necklace (Pelaku) Dialog Phase
  const [showRedNecklaceIntro, setShowRedNecklaceIntro] = useState(false)
  const [interrogationStep, setInterrogationStep] = useState(0)

  // Calculation Inputs
  const [inputMean, setInputMean] = useState('')
  const [inputMedian, setInputMedian] = useState('')
  const [inputModus, setInputModus] = useState('')
  const [calcSubmitted, setCalcSubmitted] = useState(false)
  const [calcErrors, setCalcErrors] = useState<{ mean?: boolean; median?: boolean; modus?: boolean }>({})

  // Verdict selection
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null)
  const [verdictStatus, setVerdictStatus] = useState<'none' | 'correct' | 'wrong'>('none')

  // Red flash overlay for FD wrong answers
  const [flashWrong, setFlashWrong] = useState(false)

  // DiRA states
  const [diraMsg, setDiraMsg] = useState<string | null>(null)
  const [showDira, setShowDira] = useState(false)

  // Multiplayer chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [teamMembers, setTeamMembers] = useState<Member[]>([])
  const [syncLoading, setSyncLoading] = useState(true)
  const [teamReadyVotes, setTeamReadyVotes] = useState<Record<string, string[]>>({})

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const sessionActiveRef = useRef(false)

  useEffect(() => { sessionActiveRef.current = true }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // DiRA dialog coordinator
  useEffect(() => {
    if (phase === 'prolog') {
      setDiraMsg('Halo Detektif! Selamat atas kesuksesanmu di Level 1. 🌟 Sekarang, mari kita amati infografis berikut ini untuk memahami fenomena Cyberbullying di Indonesia.')
      setShowDira(true)
      return
    }
    if (!isFD) return
    if (phase === 'briefing') {
      setDiraMsg('Ingat detektif, tugas kita adalah mendata siswa yang mengenakan Kalung Kuning. Mereka adalah korban perundungan siber.')
      setShowDira(true)
    } else if (phase === 'map') {
      if (visitedLocations.length === 0) {
        setDiraMsg('Pilih salah satu lokasi sekolah di peta blueprint untuk memulai penyelidikan data. Hati-hati ada satpam atau bom yang menghalangi! 🗺️')
      } else if (visitedLocations.length < 4) {
        setDiraMsg(`Bagus! Kita sudah menyelesaikan ${visitedLocations.length} dari 4 lokasi. Pilih lokasi berikutnya untuk melengkapi 30 data!`)
      } else {
        setDiraMsg('Kerja luar biasa! Semua lokasi korban telah selesai dikumpulkan. Lihat, ada seseorang yang mengenakan Kalung Merah berdiri di tengah Lapangan! Siapa dia? 🔴')
      }
      setShowDira(true)
    } else if (phase === 'obstacle') {
      setDiraMsg('Oops! Pintu masuk terkunci oleh hambatan PISA. Gunakan kemampuan analisismu untuk menjawab pertanyaan siber di bawah ini!')
      setShowDira(true)
    } else if (phase === 'exploration') {
      setDiraMsg('Klik pada siswa yang berkalung kuning 🟡 untuk menanyakan seberapa sering mereka mengalami cyberbullying semester ini, lalu catat datanya.')
      setShowDira(true)
    } else if (phase === 'interrogation') {
      setDiraMsg('Pelaku sedang berada di ruang investigasi. Dengarkan pengakuannya dengan sabar, lalu berikan bimbingan etika digital yang tepat agar dia jera!')
      setShowDira(true)
    } else if (phase === 'calculation') {
      setDiraMsg('Waktunya menganalisis 30 data! Urutkan data terlebih dahulu untuk mempermudah mencari Median dan Modus. Ingat rumusnya: Mean = Jumlah Data / Banyak Data.')
      setShowDira(true)
    } else if (phase === 'verdict') {
      setDiraMsg('Berdasarkan nilai Mean = 8.3, Median = 8.5, dan Modus = 4, buatlah laporan kesimpulan yang paling objektif dan akurat untuk gurumu!')
      setShowDira(true)
    }
  }, [phase, visitedLocations, isFD])

  // Multiplayer fetch & sync
  const fetchTeamState = useCallback(async () => {
    if (!teamId) return
    try {
      const res = await fetch(`/api/game/team/sync?teamId=${teamId}${studentId ? `&studentId=${studentId}` : ''}`)
      if (!res.ok) return
      const data = await res.json()

      // Sync game phase and step
      if (data.gamePhase) {
        const serverPhaseMap: Record<string, Level2Phase> = {
          cutscene_comments: 'prolog',
          cutscene_mentor: 'briefing',
          formula: 'map',
        }
        const mappedPhase = serverPhaseMap[data.gamePhase]
        if (mappedPhase && mappedPhase !== phase) {
          setPhase(mappedPhase)
        }
      }

      if (data.currentStep !== undefined) {
        // Map steps to phase
        if (data.currentStep === 2 && phase === 'map') {
          setPhase('interrogation')
        } else if (data.currentStep === 3 && phase === 'interrogation') {
          setPhase('calculation')
        } else if (data.currentStep === 4 && phase !== 'completed') {
          setPhase('completed')
        }
      }

      if (data.members) setTeamMembers(data.members)
      if (data.chatMessages) setChatMessages(data.chatMessages)
      if (data.readyVotes) setTeamReadyVotes(data.readyVotes)

      if (data.status === 'COMPLETED' || data.isCorrect) {
        if (data.verdictAnswer) {
          useGameStore.getState().setVerdict(data.verdictAnswer)
        }
        if (phase !== 'completed') {
          setPhase('completed')
        }
      }
    } catch (e) {
      console.error('Error syncing team:', e)
    } finally {
      setSyncLoading(false)
    }
  }, [teamId, phase])

  const { broadcastSyncTrigger } = useGameRealtime(
    teamId,
    studentId,
    studentName ?? 'Detektif',
    undefined,
    fetchTeamState
  )

  useEffect(() => {
    if (!teamId) {
      setSyncLoading(false)
      return
    }
    fetchTeamState()
    const interval = setInterval(fetchTeamState, 1500)
    return () => clearInterval(interval)
  }, [teamId, fetchTeamState])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // Cast multi-user vote
  const castVote = async (gate: string) => {
    if (!teamId || !studentId) return
    try {
      const res = await fetch('/api/game/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, castVote: { gate, studentId } }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.team) {
          setTeamReadyVotes(data.team.readyVotes ?? {})
          broadcastSyncTrigger()
          fetchTeamState()
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Action: Prolog Conclusion Submit
  const handlePrologSubmit = async () => {
    if (!prologConclusion.trim()) return
    addXP(10, 'Mengisi kesimpulan awal infografis', 0)
    if (teamId) {
      await castVote('gate_cutscene_next')
    } else {
      setPhase('briefing')
    }
  }

  // Action: Briefing Next
  const handleBriefingNext = async () => {
    if (teamId) {
      await castVote('gate_cutscene_start')
    } else {
      setPhase('map')
    }
  }

  // Action: Select location map node
  const handleSelectLocation = (locId: string) => {
    if (visitedLocations.includes(locId)) return
    setPisaLoc(locId)
    setSelectedPisaOpt(null)
    setPisaSubmitted(false)
    setPhase('obstacle')
  }

  // Action: Submit PISA Obstacle
  const handlePisaSubmit = () => {
    if (selectedPisaOpt === null || !pisaLoc) return
    const qData = PISA_QUESTIONS[pisaLoc]
    const isCorrect = selectedPisaOpt === qData.correct
    setPisaCorrect(isCorrect)
    setPisaSubmitted(true)

    if (isCorrect) {
      addXP(15, `Obstacle ${PISA_QUESTIONS[pisaLoc].q.substring(0, 15)}... Terpecahkan`, 1)
      if (isFD) {
        setDiraMsg(`Hebat sekali! Jawabanmu benar. ${qData.explanation} Pintu lokasi sekarang sudah terbuka! 🎉`)
        setShowDira(true)
      }
    } else {
      incrementMistake()
      if (!isFD) {
        loseLife() // FI path loses a life
      } else {
        // FD path triggers red flash and Dira help
        setFlashWrong(true)
        setTimeout(() => setFlashWrong(false), 500)
        setDiraMsg(`Kurang tepat. Coba perhatikan petunjuk: ${qData.explanation}. Coba jawab sekali lagi ya!`)
        setShowDira(true)
      }
    }
  }

  // Action: Enter location after clearing PISA
  const handleEnterLocation = () => {
    if (pisaLoc) {
      setActiveLoc(pisaLoc)
      setPhase('exploration')
    }
  }

  // Action: Click victim student
  const handleRecordVictim = (idx: number) => {
    if (!activeLoc) return
    const currentVisited = victimsVisited[activeLoc] ?? []
    if (currentVisited.includes(idx)) return

    const updatedVisited = [...currentVisited, idx]
    setVictimsVisited(prev => ({ ...prev, [activeLoc]: updatedVisited }))
    setCollectedCount(prev => prev + 1)
  }

  // Action: Return to map from location
  const handleReturnToMap = () => {
    if (activeLoc) {
      setVisitedLocations(prev => [...prev, activeLoc])
      setActiveLoc(null)
      setPisaLoc(null)
      setPhase('map')
    }
  }

  // Action: Dialogue Perpetrator progression
  const handleInterrogationProgress = () => {
    if (interrogationStep < 2) {
      setInterrogationStep(prev => prev + 1)
    } else {
      awardBadge(BADGES.LITERACY_ADVISOR)
      addXP(20, 'Mewawancarai dan membimbing pelaku siber', 2)
      if (teamId) {
        castVote('gate_step0_done') // advances to calculation
      } else {
        setPhase('calculation')
      }
    }
  }

  // Action: Submit statistics calculations
  const handleCalculationSubmit = () => {
    const errors: { mean?: boolean; median?: boolean; modus?: boolean } = {}
    const parsedMean = parseFloat(inputMean.replace(',', '.'))
    const parsedMedian = parseFloat(inputMedian.replace(',', '.'))
    const parsedModus = parseFloat(inputModus)

    if (parsedMean !== STATS.mean) errors.mean = true
    if (parsedMedian !== STATS.median) errors.median = true
    if (parsedModus !== STATS.modus) errors.modus = true

    setCalcErrors(errors)
    setCalcSubmitted(true)

    const isAllCorrect = Object.keys(errors).length === 0

    if (isAllCorrect) {
      addXP(30, 'Menghitung nilai Mean, Median, Modus dengan benar', 3)
      if (teamId) {
        castVote('gate_step1_done') // advances to verdict
      } else {
        setPhase('verdict')
      }
    } else {
      incrementMistake()
      if (!isFD) {
        loseLife()
      } else {
        setFlashWrong(true)
        setTimeout(() => setFlashWrong(false), 500)
        setDiraMsg(`Hmm, sepertinya masih ada perhitungan yang keliru. 
          Mean: jumlah data (${cyberbullyingData.reduce((a: number, b: number)=>a+b, 0)}) dibagi banyak data (${cyberbullyingData.length}).
          Median: rata-rata data ke-15 dan ke-16 setelah diurutkan.
          Modus: nilai yang paling sering muncul. Re-check kembali ya!`)
        setShowDira(true)
      }
    }
  }

  // Action: Submit Verdict Choice
  const handleVerdictSubmit = () => {
    if (!selectedVerdict) return
    const isCorrect = selectedVerdict === CORRECT_VERDICT

    if (isCorrect) {
      setVerdictStatus('correct')
      addXP(20, 'Kesimpulan kasus siber tepat', 4)
      awardBadge(BADGES.CRITICAL)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      // Speed bonus check
      const initialTime = isFD ? 900 : 600
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      // Multiplier
      const bonus = Math.floor((xp + 35) * (isFD ? 0.3 : 0.5))
      addXP(bonus, `${cognitiveStyle} Multiplier Bonus`, 4)
      awardBadge(BADGES.DETECTIVE)

      if (teamId) {
        castVote('gate_verdict_done')
      } else {
        setTimeout(() => {
          setPhase('completed')
        }, 800)
      }
    } else {
      setVerdictStatus('wrong')
      incrementMistake()
      if (!isFD) {
        loseLife()
      } else {
        setFlashWrong(true)
        setTimeout(() => setFlashWrong(false), 500)
        setDiraMsg('Kesimpulan tersebut kurang didukung oleh data. Ingat, Mean (8.3) dan Median (8.5) menggambarkan bahwa masalah ini sangat intens dan merata pada mayoritas korban, bukan sekadar modusnya saja. Coba baca ulang pilihan kesimpulannya!')
        setShowDira(true)
      }
    }
  }

  // Final complete Level 2 session
  const handleFinalizeLevel = () => {
    addXP(15, 'Menyelesaikan Level 2', 4)
    completeLevel(2)
    useGameStore.getState().setVerdict(selectedVerdict ?? CORRECT_VERDICT)
    router.push('/siswa/game/results/2')
  }

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !teamId || !studentId || !studentName) return
    const content = chatInput.trim()
    setChatInput('')

    try {
      await fetch('/api/game/team/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, studentId, senderName: studentName, content }),
      })
      fetchTeamState()
    } catch (err) {
      console.error(err)
    }
  }

  // Loading spinner for team syncing
  if (teamId && syncLoading && chatMessages.length === 0 && teamMembers.length === 0) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '40px' }}>⚙️</motion.div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Menyinkronkan sesi kelompok...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', width: '100%', flex: 1, minHeight: 0, position: 'relative' }}>
      
      {/* ── LEFT SIDE: Main Gameplay Content ── */}
      <div style={{ flex: 1, maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* Red Flash Overlay for FD Mistakes */}
        <AnimatePresence>
          {flashWrong && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(239, 68, 68, 0.15)', zIndex: 1000, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        {/* Phase Renderers */}
        <AnimatePresence mode="wait">

          {/* ────────────────── PHASE: PROLOG ────────────────── */}
          {phase === 'prolog' && (
            <motion.div
              key="prolog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}
            >
              {/* Header Section */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' }}>
                  PROLOG: KASUS CYBERBULLYING
                </div>
                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, background: 'linear-gradient(135deg, #FFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Infografis Analisis Perundungan Siber
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '10px', maxWidth: '640px', marginInline: 'auto' }}>
                  Selidiki 4 infografis terpercaya di bawah ini untuk memahami kasus Cyberbullying di Indonesia sebelum menarik kesimpulan.
                </p>
              </div>

              {/* ── 3D Coverflow Carousel ── */}
              <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: isMobile ? '200px' : '290px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                  overflow: 'visible',
                  margin: '16px 0',
                }}>
                  {/* Left Arrow */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveInfographicIdx((prev) => (prev === 0 ? INFOGRAPHICS.length - 1 : prev - 1))}
                    style={{
                      position: 'absolute',
                      left: isMobile ? '0px' : '-20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 50,
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(15, 35, 56, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = INFOGRAPHICS[activeInfographicIdx].color;
                      e.currentTarget.style.boxShadow = `0 0 15px ${INFOGRAPHICS[activeInfographicIdx].color}40`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    ←
                  </motion.button>

                  {/* Carousel Cards */}
                  {INFOGRAPHICS.map((info, idx) => {
                    const diff = getDiff(idx, activeInfographicIdx);
                    const isActive = diff === 0;
                    const cardWidth = isMobile ? 240 : 360;
                    const cardHeight = isMobile ? 160 : 240;

                    let x = 0;
                    let z = 0;
                    let rotateY = 0;
                    let scale = 1;
                    let opacity = 1;
                    let zIndex = 1;

                    if (diff === 0) {
                      x = 0;
                      z = 50;
                      rotateY = 0;
                      scale = 1.05;
                      opacity = 1;
                      zIndex = 10;
                    } else if (diff === -1) {
                      x = isMobile ? -85 : -210;
                      z = -100;
                      rotateY = 32;
                      scale = 0.8;
                      opacity = 0.55;
                      zIndex = 5;
                    } else if (diff === 1) {
                      x = isMobile ? 85 : 210;
                      z = -100;
                      rotateY = -32;
                      scale = 0.8;
                      opacity = 0.55;
                      zIndex = 5;
                    } else if (diff === -2) {
                      x = 0;
                      z = -200;
                      rotateY = 0;
                      scale = 0.5;
                      opacity = 0;
                      zIndex = 1;
                    }

                    return (
                      <motion.div
                        key={info.id}
                        style={{
                          position: 'absolute',
                          width: `${cardWidth}px`,
                          height: `${cardHeight}px`,
                          transformStyle: 'preserve-3d',
                          cursor: isActive ? 'default' : 'pointer',
                        }}
                        animate={{
                          x,
                          z,
                          rotateY,
                          scale,
                          opacity,
                          zIndex,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 25,
                        }}
                        onClick={() => {
                          if (!isActive) {
                            setActiveInfographicIdx(idx);
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: isActive
                              ? `0 16px 36px ${info.color}45`
                              : '0 8px 16px rgba(0, 0, 0, 0.4)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            border: isActive ? `2px solid ${info.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                            background: '#0B1E2C',
                            transition: 'border 0.3s, box-shadow 0.3s',
                          }}
                        >
                          <img
                            src={info.img}
                            alt={info.title}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: 'rgba(15, 35, 56, 0.85)',
                            backdropFilter: 'blur(4px)',
                            zIndex: -1,
                            userSelect: 'none',
                          }}>
                            <span style={{ fontSize: isMobile ? '40px' : '56px' }}>{info.icon}</span>
                            <span style={{ fontSize: isMobile ? '9px' : '11px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>
                              INFO 0{info.id}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Right Arrow */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveInfographicIdx((prev) => (prev === INFOGRAPHICS.length - 1 ? 0 : prev + 1))}
                    style={{
                      position: 'absolute',
                      right: isMobile ? '0px' : '-20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 50,
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(15, 35, 56, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = INFOGRAPHICS[activeInfographicIdx].color;
                      e.currentTarget.style.boxShadow = `0 0 15px ${INFOGRAPHICS[activeInfographicIdx].color}40`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    →
                  </motion.button>
                </div>

                {/* Dot Indicators */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0 16px 0' }}>
                  {INFOGRAPHICS.map((_, idx) => {
                    const isActive = activeInfographicIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveInfographicIdx(idx)}
                        style={{
                          width: isActive ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: isActive ? INFOGRAPHICS[idx].color : 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isActive ? `0 0 10px ${INFOGRAPHICS[idx].color}` : 'none',
                          outline: 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Title & Desc block */}
              <div style={{ textAlign: 'center', minHeight: '80px', padding: '0 16px', maxWidth: '600px', marginInline: 'auto' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInfographicIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 style={{ fontSize: '19px', fontWeight: 900, color: INFOGRAPHICS[activeInfographicIdx].color, margin: '0 0 8px 0' }}>
                      {INFOGRAPHICS[activeInfographicIdx].title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {INFOGRAPHICS[activeInfographicIdx].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Conclusion Input Area */}
              <div style={{
                background: 'rgba(15, 35, 56, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(14, 131, 136, 0.15)',
                borderRadius: '16px',
                padding: '20px',
                marginTop: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}>
                <label htmlFor="conclusion-textarea" style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>
                  Kesimpulanmu dari Infografis di atas:
                </label>
                <textarea
                  id="conclusion-textarea"
                  placeholder="Tuliskan analisis atau simpulan awalmu terkait infografis cyberbullying ini..."
                  value={prologConclusion}
                  onChange={(e) => setPrologConclusion(e.target.value)}
                  style={{
                    width: '100%', minHeight: '90px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--game-border)',
                    borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '13.5px', outline: 'none', resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    className="game-btn game-btn-primary"
                    disabled={!prologConclusion.trim()}
                    onClick={prologConclusion.trim() ? handlePrologSubmit : undefined}
                    style={{ opacity: prologConclusion.trim() ? 1 : 0.5 }}
                  >
                    {teamId ? 'Vote Kirim Jawaban' : 'Kirim & Lanjut →'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: BRIEFING ────────────────── */}
          {phase === 'briefing' && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '64px' }}>🕵️‍♂️</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Misi: Kumpulkan Data di Sekolah</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: 1.7, maxWidth: '580px' }}>
                Kamu perlu mengumpulkan data di sekolah untuk melihat berapa banyak siswa yang menjadi korban Cyberbullying. Untungnya, kamu punya kekuatan detektif khusus untuk menemukan mereka!
              </p>
              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '16px', padding: '16px 20px', textAlign: 'left', margin: '12px 0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '28px' }}>🟡</span>
                <span style={{ fontSize: '13.5px', color: '#FBBF24', lineHeight: 1.5 }}>
                  <strong>Petunjuk Penting</strong>: Korban Cyberbullying memakai <strong>kalung warna kuning</strong> kemanapun mereka pergi. Tugasmu adalah mendata berapa kali mereka mendapatkan perlakuan yang tidak menyenangkan dalam satu semester terakhir.
                </span>
              </div>
              <button className="game-btn game-btn-primary" onClick={handleBriefingNext}>
                {teamId ? 'Vote Mulai Penyelidikan' : 'Mulai Pencarian di Peta Sekolah →'}
              </button>
            </motion.div>
          )}

          {/* ────────────────── PHASE: INTERACTIVE MAP ────────────────── */}
          {phase === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="game-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>DENAH SEKOLAH</div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Blueprint Penyelidikan</h2>
                  </div>
                  <div style={{ background: 'rgba(14, 131, 136, 0.1)', border: '1px solid var(--game-border)', padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 700 }}>
                    📂 Data Terkumpul: <strong style={{ color: 'var(--accent)' }}>{collectedCount} / 30</strong>
                  </div>
                </div>

                {/* Map Grid Node Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '12px 0' }}>
                  {LOCATIONS.map((loc) => {
                    const isVisited = visitedLocations.includes(loc.id)
                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc.id)}
                        style={{
                          background: isVisited ? 'rgba(255,255,255,0.01)' : 'var(--game-card)',
                          border: `1.5px solid ${isVisited ? 'rgba(255,255,255,0.08)' : loc.color}`,
                          borderRadius: '16px', padding: '20px', cursor: isVisited ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          opacity: isVisited ? 0.65 : 1
                        }}
                        onMouseEnter={e => {
                          if (!isVisited) {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = `0 4px 16px ${loc.color}25`
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isVisited) {
                            e.currentTarget.style.transform = 'none'
                            e.currentTarget.style.boxShadow = 'none'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '32px' }}>{loc.icon}</span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#fff' }}>{loc.name}</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {isVisited ? '✓ Selesai didata' : `Hambatan Terdeteksi`}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '20px' }}>
                          {isVisited ? '✅' : '🔒'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Perpetrator Red Necklace Node (Unlocks when all locations visited) */}
                {visitedLocations.length === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setPhase('interrogation')}
                    style={{
                      marginTop: '20px', padding: '20px', background: 'rgba(239,68,68,0.06)', border: '2px solid #EF4444',
                      borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 0 20px rgba(239,68,68,0.2)'
                    }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '36px', animation: 'float 2s infinite' }}>🔴</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 900, fontSize: '15px', color: '#EF4444' }}>PERINGATAN DETEKTIF!</div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Siswa Berkalung Merah mencurigakan terdeteksi di Lapangan Sekolah. Selidiki sekarang!
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '20px' }}>🚨</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: PISA OBSTACLE ────────────────── */}
          {phase === 'obstacle' && pisaLoc && (
            <motion.div key="obstacle" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                  ⚠️ HAMBATAN KEAMANAN TERDETEKSI ({LOCATIONS.find(l=>l.id===pisaLoc)?.name})
                </div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Pecahkan Kunci Sandi PISA untuk Lolos</h2>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--game-border)', padding: '20px', borderRadius: '12px', fontSize: '14.5px', lineHeight: 1.6, color: '#F1F5F9' }}>
                {PISA_QUESTIONS[pisaLoc].q}
              </div>

              {/* Option Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PISA_QUESTIONS[pisaLoc].opts.map((opt, idx) => {
                  const isSelected = selectedPisaOpt === idx
                  let borderStyle = '1px solid var(--game-border)'
                  let bgStyle = 'rgba(255,255,255,0.02)'
                  if (isSelected) {
                    borderStyle = '2px solid var(--accent)'
                    bgStyle = 'var(--accent-dim)'
                  }
                  if (pisaSubmitted) {
                    if (idx === PISA_QUESTIONS[pisaLoc].correct) {
                      borderStyle = '2px solid #10B981'
                      bgStyle = 'rgba(16,185,129,0.08)'
                    } else if (isSelected) {
                      borderStyle = '2px solid #EF4444'
                      bgStyle = 'rgba(239,68,68,0.08)'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={pisaSubmitted}
                      onClick={() => setSelectedPisaOpt(idx)}
                      style={{
                        padding: '14px 16px', borderRadius: '10px', border: borderStyle, background: bgStyle,
                        color: '#fff', fontSize: '13.5px', fontWeight: 600, textAlign: 'left',
                        cursor: pisaSubmitted ? 'default' : 'pointer', transition: 'all 0.2s',
                        display: 'flex', gap: '10px', alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                {!pisaSubmitted ? (
                  <button
                    className="game-btn game-btn-primary"
                    disabled={selectedPisaOpt === null}
                    onClick={handlePisaSubmit}
                    style={{ opacity: selectedPisaOpt !== null ? 1 : 0.5 }}
                  >
                    Buka Kunci Sandi
                  </button>
                ) : (
                  <button
                    className="game-btn"
                    style={{
                      background: pisaCorrect ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      boxShadow: pisaCorrect ? 'var(--accent-glow)' : 'none'
                    }}
                    onClick={pisaCorrect ? handleEnterLocation : () => { setPisaSubmitted(false); setSelectedPisaOpt(null); }}
                  >
                    {pisaCorrect ? 'Masuk ke Lokasi →' : 'Coba Lagi'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: EXPLORATION (LOCATION DATA GATHERING) ────────────────── */}
          {phase === 'exploration' && activeLoc && (
            <motion.div key="exploration" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="game-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--game-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '32px' }}>{LOCATIONS.find(l=>l.id===activeLoc)?.icon}</span>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>PENCARIAN DATA</div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Lokasi: {LOCATIONS.find(l=>l.id===activeLoc)?.name}</h2>
                    </div>
                  </div>
                  <div style={{ background: 'var(--game-bg)', border: '1px solid var(--game-border)', padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 700 }}>
                    Terdata di Lokasi: <strong style={{ color: 'var(--accent)' }}>{victimsVisited[activeLoc]?.length ?? 0} / {VICTIMS[activeLoc].length}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                  Berikut adalah daftar siswa di lokasi ini. Cari siswa yang mengenakan Kalung Kuning 🟡, klik untuk mendengarkan frekuensi cyberbullying yang mereka alami, dan catat angkanya.
                </p>

                {/* Victims list cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {VICTIMS[activeLoc].map((vic, idx) => {
                    const isRecorded = (victimsVisited[activeLoc] ?? []).includes(idx)
                    return (
                      <div
                        key={idx}
                        onClick={() => !isRecorded && handleRecordVictim(idx)}
                        style={{
                          background: isRecorded ? 'rgba(255,255,255,0.02)' : 'rgba(14, 131, 136, 0.03)',
                          border: `1px solid ${isRecorded ? 'rgba(255,255,255,0.06)' : 'rgba(251,191,36,0.3)'}`,
                          borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', cursor: isRecorded ? 'default' : 'pointer',
                          transition: 'all 0.2s', opacity: isRecorded ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{isRecorded ? '🕵️' : '🟡'}</span>
                          <span style={{ fontSize: '13px', color: isRecorded ? 'var(--text-secondary)' : '#fff', fontStyle: isRecorded ? 'italic' : 'normal' }}>
                            {isRecorded ? `"${vic.txt}"` : 'Siswa Berkalung Kuning Terdeteksi'}
                          </span>
                        </div>
                        
                        {isRecorded ? (
                          <div style={{ background: 'rgba(0,173,181,0.08)', border: '1px solid rgba(0,173,181,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, color: '#00ADB5', fontFamily: 'monospace' }}>
                            {vic.val} Kali / Semester
                          </div>
                        ) : (
                          <button className="game-btn" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', background: 'linear-gradient(90deg, #D97706, #EA580C)', color: '#fff' }}>
                            Tanya Korban
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Return button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    className="game-btn game-btn-primary"
                    disabled={(victimsVisited[activeLoc]?.length ?? 0) < VICTIMS[activeLoc].length}
                    onClick={handleReturnToMap}
                    style={{ opacity: (victimsVisited[activeLoc]?.length ?? 0) === VICTIMS[activeLoc].length ? 1 : 0.5 }}
                  >
                    Kembali ke Peta Sekolah
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: PERPETRATOR INTERROGATION / DIALOG ────────────────── */}
          {phase === 'interrogation' && (
            <motion.div key="interrogation" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="game-card">
                <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                  🚨 RUANG INVESTIGASI
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Wawancara &amp; Bimbingan Pelaku</h2>
                
                {/* Dialogue Panel */}
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '20px', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', position: 'relative' }}>
                  
                  {/* Sprite image mock */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.15, fontSize: '72px' }}>🔴</div>

                  {interrogationStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#FB7185', fontWeight: 800 }}>PELAKU (KALUNG MERAH):</div>
                      <p style={{ fontSize: '14px', margin: 0, color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "Kenapa aku dibawa ke sini? Aku cuma bercanda kok di medsos... Semua temanku juga suka bikin meme ejekan seperti itu, masa aku dibilang pelaku bullying?"
                      </p>
                    </div>
                  )}

                  {interrogationStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#00ADB5', fontWeight: 800 }}>DETEKTIF (ANDA):</div>
                      <p style={{ fontSize: '14px', margin: 0, color: '#fff', lineHeight: 1.5 }}>
                        "Bercanda tapi merugikan orang lain itu bukan lelucon. Kami sudah mendata 30 korban yang kamu rundung siber semester ini. Katakan apa saja bentuk cyberbullying yang pernah kamu lakukan!"
                      </p>
                      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0' }} />
                      <div style={{ fontSize: '11px', color: '#FB7185', fontWeight: 800 }}>PELAKU (KALUNG MERAH):</div>
                      <p style={{ fontSize: '14px', margin: 0, color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "Aku... aku pernah membuat akun Instagram palsu untuk mengejek foto teman sekelas, mengeluarkan mereka dari grup belajar kelas, dan spam stiker kasar di WhatsApp group mereka agar ditertawakan..."
                      </p>
                    </div>
                  )}

                  {interrogationStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#00ADB5', fontWeight: 800 }}>DETEKTIF (ANDA):</div>
                      <p style={{ fontSize: '14px', margin: 0, color: '#fff', lineHeight: 1.5 }}>
                        "Itu adalah tindakan perundungan siber (cyberbullying) yang serius. Komentar kasarmu merusak kesehatan mental korban. Penting untuk memahami kemampuan literasi digital dan menerapkan etika bermedia sosial."
                      </p>
                      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0' }} />
                      <div style={{ fontSize: '11px', color: '#FB7185', fontWeight: 800 }}>PELAKU (KALUNG MERAH):</div>
                      <p style={{ fontSize: '14px', margin: 0, color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "Aku benar-benar tidak menyadari dampaknya seburuk itu... Aku menyesal dan meminta maaf. Aku berjanji tidak akan mengulanginya lagi."
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button className="game-btn game-btn-primary" onClick={handleInterrogationProgress}>
                    {interrogationStep < 2 ? 'Lanjutkan Percakapan →' : (teamId ? 'Vote Lanjut Analisis' : 'Lanjut: Analisis Statistik →')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: STATISTICAL CALCULATIONS ────────────────── */}
          {phase === 'calculation' && (
            <motion.div key="calculation" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="game-card">
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                  TAHAP B: ANALISIS UKURAN PEMUSATAN DATA
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Ukuran Pemusatan Data Korban</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                  Kamu telah mengumpulkan data frekuensi siber dari 30 korban. Lakukan perhitungan <strong>Mean, Median, dan Modus</strong>.
                </p>

                {/* Collected Data Panel */}
                <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--game-border)', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>
                    DATA YANG TERKUMPUL (URUTKAN):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center' }}>
                    {cyberbullyingData.map((val: number, idx: number) => (
                      <div key={idx} style={{ padding: '6px 4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: '#fff' }}>
                        {val}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'right' }}>
                    Jumlah Seluruh Data: <strong>249</strong> • Sampel n = <strong>30</strong>
                  </div>
                </div>

                {/* Calculation Inputs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }} className="tahap-b-reference-grid">
                  
                  {/* Mean */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mean (Rata-rata)</label>
                    <input
                      type="text"
                      placeholder="e.g. 8.3"
                      value={inputMean}
                      onChange={(e) => setInputMean(e.target.value)}
                      disabled={calcSubmitted && !Object.keys(calcErrors).includes('mean')}
                      style={{
                        padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${calcErrors.mean ? '#EF4444' : 'var(--game-border)'}`,
                        borderRadius: '8px', color: '#fff', fontSize: '14px', textAlign: 'center', outline: 'none'
                      }}
                    />
                  </div>

                  {/* Median */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Median (Nilai Tengah)</label>
                    <input
                      type="text"
                      placeholder="e.g. 8.5"
                      value={inputMedian}
                      onChange={(e) => setInputMedian(e.target.value)}
                      disabled={calcSubmitted && !Object.keys(calcErrors).includes('median')}
                      style={{
                        padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${calcErrors.median ? '#EF4444' : 'var(--game-border)'}`,
                        borderRadius: '8px', color: '#fff', fontSize: '14px', textAlign: 'center', outline: 'none'
                      }}
                    />
                  </div>

                  {/* Modus */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Modus (Terbanyak)</label>
                    <input
                      type="text"
                      placeholder="e.g. 4"
                      value={inputModus}
                      onChange={(e) => setInputModus(e.target.value)}
                      disabled={calcSubmitted && !Object.keys(calcErrors).includes('modus')}
                      style={{
                        padding: '10px 12px', background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${calcErrors.modus ? '#EF4444' : 'var(--game-border)'}`,
                        borderRadius: '8px', color: '#fff', fontSize: '14px', textAlign: 'center', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button className="game-btn game-btn-primary" onClick={handleCalculationSubmit}>
                    Periksa Jawaban
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: VERDICT SCREEN ────────────────── */}
          {phase === 'verdict' && (
            <motion.div key="verdict" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="game-card">
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                  TAHAP C: PENARIKAN KESIMPULAN (VERDICT)
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Uji Kebenaran &amp; Laporan Hasil Misi</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                  Berdasarkan nilai statistika ukuran pemusatan data (Mean = <strong>8.3</strong>, Median = <strong>8.5</strong>, Modus = <strong>4</strong>) dari 30 data korban, apa kesimpulan yang paling objektif untuk kamu laporkan?
                </p>

                {/* Options list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                  {[
                    {
                      id: 'LOW_PROBLEM',
                      txt: 'Tingkat cyberbullying di sekolah tergolong sangat rendah karena nilai frekuensi yang paling sering muncul (Modus) hanya sebesar 4 kali.'
                    },
                    {
                      id: 'SERIOUS_PROBLEM',
                      txt: 'Meskipun nilai yang paling sering muncul (Modus) adalah 4 kali, sebagian besar korban mengalami cyberbullying yang jauh lebih intens, ditunjukkan oleh nilai rata-rata (Mean = 8.3) dan Median (8.5) yang jauh lebih tinggi. Masalah ini serius dan menyebar luas.'
                    },
                    {
                      id: 'INVALID_DATA',
                      txt: 'Data tidak dapat disimpulkan karena terdapat perbedaan mencolok antara nilai rata-rata (Mean) dengan nilai Modus.'
                    },
                    {
                      id: 'ISOLATED_INCIDENT',
                      txt: 'Cyberbullying hanya merupakan insiden terisolasi yang dilakukan oleh segelintir pelaku, sehingga tidak perlu ditindaklanjuti secara sistemik.'
                    }
                  ].map((opt) => {
                    const isSelected = selectedVerdict === opt.id
                    let borderStyle = '1px solid var(--game-border)'
                    let bgStyle = 'rgba(255,255,255,0.02)'
                    
                    if (isSelected) {
                      borderStyle = '2px solid var(--accent)'
                      bgStyle = 'var(--accent-dim)'
                    }
                    if (verdictStatus === 'correct' && opt.id === CORRECT_VERDICT) {
                      borderStyle = '2px solid #10B981'
                      bgStyle = 'rgba(16,185,129,0.08)'
                    } else if (verdictStatus === 'wrong' && isSelected) {
                      borderStyle = '2px solid #EF4444'
                      bgStyle = 'rgba(239,68,68,0.08)'
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedVerdict(opt.id)}
                        disabled={verdictStatus === 'correct'}
                        style={{
                          padding: '16px 20px', borderRadius: '12px', border: borderStyle, background: bgStyle,
                          color: '#fff', fontSize: '13.5px', lineHeight: 1.5, textAlign: 'left',
                          cursor: verdictStatus === 'correct' ? 'default' : 'pointer', transition: 'all 0.2s',
                          display: 'flex', gap: '14px', alignItems: 'center'
                        }}
                      >
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%', background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0
                        }}>
                          {isSelected ? '✓' : '•'}
                        </div>
                        {opt.txt}
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  {verdictStatus !== 'correct' ? (
                    <button className="game-btn game-btn-primary" disabled={!selectedVerdict} onClick={handleVerdictSubmit}>
                      Laporkan Verdict
                    </button>
                  ) : (
                    <button className="game-btn game-btn-primary" onClick={handleFinalizeLevel}>
                      Selesaikan Level &amp; Lihat Laporan Misi →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────────────── PHASE: COMPLETED (STAMP / CONFIRM) ────────────────── */}
          {phase === 'completed' && (
            <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center', padding: '40px' }}>
              <div style={{ fontSize: '72px', animation: 'badge-pulse 2s infinite' }}>🛡️</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Investigasi Siber Sukses!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: 1.7, maxWidth: '580px' }}>
                Selamat Detektif! Kamu telah sukses mengumpulkan 30 data, membimbing pelaku siber, dan menyelesaikan analisis pemusatan data cyberbullying di sekolah.
              </p>
              <button className="game-btn game-btn-primary" onClick={handleFinalizeLevel}>
                Lihat Mission Report Lengkap →
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* DiRA guide for Field Dependent style (or all styles during prolog) */}
        {((isFD || phase === 'prolog') && showDira && diraMsg) && (
          <DiRA message={diraMsg} onDismiss={() => setShowDira(false)} />
        )}

        {/* Badge unlock popup queue */}
        {pendingBadges.length > 0 && (
          <BadgeUnlock
            icon={pendingBadges[0].icon}
            name={pendingBadges[0].name}
            desc={pendingBadges[0].desc}
            onDone={dismissBadge}
          />
        )}

      </div>

      {/* ── RIGHT SIDE: Multiplayer Chat & Teammate Sidebar ── */}
      {teamId && phase !== 'prolog' && (
        <div
          style={{
            width: '300px',
            background: 'rgba(25, 23, 21, 0.85)',
            borderLeft: '1px solid rgba(14, 131, 136, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 60px)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Teammates List */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(14, 131, 136, 0.12)' }}>
            <h3 style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
              👥 KELOMPOK DETEKTIF
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teamMembers.map((m) => {
                const isMe = m.id === studentId
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>🕵️</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isMe ? 'var(--accent)' : '#fff' }}>
                        {m.name} {isMe ? '(Anda)' : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                <span style={{ fontSize: '20px' }}>💬</span>
                <p style={{ fontSize: '11px', margin: 0 }}>Belum ada obrolan kelompok.<br/>Yuk sapa teman satu timmu!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.studentId === studentId
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px', padding: '0 4px' }}>
                      {msg.senderName}
                    </span>
                    <div
                      style={{
                        background: isMe ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                        color: isMe ? '#1C1917' : '#fff',
                        padding: '8px 12px',
                        borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        border: isMe ? 'none' : '1px solid rgba(14, 131, 136, 0.1)',
                        fontSize: '12px',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                        boxShadow: isMe ? '0 2px 8px rgba(0, 173, 181, 0.2)' : 'none',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChatMessage} style={{ padding: '12px', borderTop: '1px solid rgba(14, 131, 136, 0.12)', background: 'rgba(15, 13, 11, 0.5)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ketik pesan diskusi..."
              style={{
                flex: 1, background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(14, 131, 136, 0.25)',
                borderRadius: '10px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none'
              }}
            />
            <button type="submit" disabled={!chatInput.trim()} className="game-btn game-btn-primary" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px', flexShrink: 0 }}>
              Kirim
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
