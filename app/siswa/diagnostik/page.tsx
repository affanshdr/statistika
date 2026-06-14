'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTIONS = [
  {
    id: 1,
    text: 'Sebuah diagram batang menunjukkan data tinggi badan siswa. Jika batang untuk tinggi 150 cm menunjuk ke angka 8 pada sumbu tegak, apa arti dari informasi tersebut?',
    options: [
      'Ada 8 siswa yang memiliki tinggi badan 150 cm.',
      'Tinggi badan rata-rata siswa adalah 150 cm.',
      'Siswa yang paling tinggi berukuran 158 cm.',
      'Selisih tinggi badan siswa adalah 8 cm.',
    ],
    correct: 0,
  },
  {
    id: 2,
    text: 'Perhatikan data nilai tugas beberapa siswa berikut: 70, 85, 60, 90, 75. Berapakah selisih antara nilai tertinggi dan nilai terendah dari data tersebut?',
    options: ['20', '25', '30', '35'],
    correct: 2,
  },
  {
    id: 3,
    text: 'Mengapa data yang jumlahnya sangat banyak dan bervariasi (misalnya nilai ujian 100 siswa dari angka 35 sampai 100) kurang cocok jika langsung dibuat diagram batang tunggal satu per satu nilainya?',
    options: [
      'Karena diagram batang tidak bisa digambar di kertas.',
      'Karena diagram batang akan menjadi terlalu panjang, penuh, dan sulit untuk disimpulkan secara cepat.',
      'Karena diagram batang hanya boleh digunakan untuk data di bawah 10 sampel.',
      'Karena diagram batang hanya boleh digunakan untuk data nama orang.',
    ],
    correct: 1,
  },
  {
    id: 4,
    text: 'Jika kita mengelompokkan nilai matematika menjadi beberapa bagian, manakah di bawah ini yang menunjukkan pengelompokkan yang adil dan tidak tumpang tindih?',
    options: [
      'Kelompok A: 60-70, Kelompok B: 70-80, Kelompok C: 80-90',
      'Kelompok A: 61-70, Kelompok B: 71-80, Kelompok C: 81-90',
      'Kelompok A: 60-65, Kelompok B: 66-70, Kelompok C: 71-85',
      'Kelompok A: Kurang dari 70, Kelompok B: Lebih dari 65',
    ],
    correct: 1,
  },
  {
    id: 5,
    text: 'Dalam diagram batang yang biasa kalian pelajari di SMP, terdapat jarak atau celah yang memisahkan antar batang. Jarak tersebut menunjukkan bahwa...',
    options: [
      'Data yang satu dengan data yang lain bersifat terpisah (kategori berbeda).',
      'Guru salah membuat gambar grafik.',
      'Nilai frekuensi data tersebut bernilai nol.',
      'Data tersebut merupakan data yang berlanjut terus-menerus.',
    ],
    correct: 0,
  },
  {
    id: 6,
    text: 'Jika sebuah kelompok nilai ditulis sebagai "71 - 80", berapakah banyaknya kemungkinan nilai bulat yang masuk ke dalam kelompok tersebut?',
    options: ['9', '10', '11', '8'],
    correct: 1,
  },
  {
    id: 7,
    text: 'Di bawah ini, manakah yang merupakan contoh pengumpulan data yang menghasilkan data berupa angka kontinu (bisa berbentuk desimal/diukur), bukan sekadar dihitung?',
    options: [
      'Menghitung jumlah sepeda motor di tempat parkir sekolah.',
      'Mendata jenis olahraga yang disukai siswa kelas IX.',
      'Mengukur waktu yang ditempuh siswa untuk berlari 100 meter.',
      'Mencatat jumlah anak dalam suatu keluarga.',
    ],
    correct: 2,
  },
  {
    id: 8,
    text: 'Saat melihat sebuah diagram batang di majalah dinding sekolah, apa hal pertama yang harus kita lihat untuk mengetahui apa yang sedang dibahas oleh diagram tersebut?',
    options: [
      'Warna pensil warna yang digunakan untuk menggambar.',
      'Judul diagram serta keterangan pada sumbu mendatar dan sumbu tegak.',
      'Nama siswa yang menggambar diagram tersebut.',
      'Ukuran kertas yang digunakan untuk membuat grafik.',
    ],
    correct: 1,
  },
  {
    id: 9,
    text: 'Jika kita membulatkan angka desimal 6,3 dan 6,8 ke bilangan bulat terdekat, hasil pembulatan yang benar berturut-turut adalah...',
    options: ['6 dan 7', '6 dan 6', '7 dan 7', '6 dan 8'],
    correct: 0,
  },
  {
    id: 10,
    text: 'Ketika membaca informasi dalam bentuk grafik di internet, sikap awal yang paling bijak dan kritis sebagai pengguna media digital adalah...',
    options: [
      'Langsung mempercayai dan menyebarkannya ke grup WhatsApp karena gambarnya bagus.',
      'Memeriksa kembali apakah skala angkanya benar, sumber datanya jelas, dan masuk akal.',
      'Mengabaikannya sama sekali karena matematika di internet pasti membosankan.',
      'Menghapus postingan tersebut karena menganggap semua grafik di internet adalah palsu.',
    ],
    correct: 1,
  },
  {
    id: 11,
    text: 'Mengapa sebuah grafik atau histogram di media sosial yang tidak mencantumkan "Sumber Data" yang jelas harus kita waspadai?',
    options: [
      'Karena tanpa sumber data, warna-warni pada grafik tersebut menjadi tidak sah.',
      'Karena bisa jadi data tersebut hanyalah karangan atau hoaks yang dibuat untuk menggiring opini publik.',
      'Karena grafik tanpa sumber data biasanya memiliki ukuran file gambar yang terlalu besar.',
      'Karena platform media sosial akan otomatis menghapus grafik yang tidak memiliki sumber.',
    ],
    correct: 1,
  },
  {
    id: 12,
    text: 'Seseorang menyebarkan histogram tentang peningkatan kasus penyakit di suatu daerah, tetapi ia sengaja memotong sumbu vertikal (frekuensi) dari angka 50 langsung ke 500 tanpa skala yang konsisten agar grafiknya terlihat melonjak tajam. Tindakan digital ini disebut sebagai...',
    options: [
      'Keamanan siber (Cyber security)',
      'Desain grafis estetis',
      'Manipulasi visual data (Disinformasi berbasis data)',
      'Penghematan ruang digital',
    ],
    correct: 2,
  },
  {
    id: 13,
    text: 'Di bawah ini, manakah contoh etika yang benar ketika kita ingin menggunakan data atau grafik hasil penelitian orang lain untuk konten edukasi di media sosial kita?',
    options: [
      'Mengambil screenshot grafik tersebut, menghapus nama penelitinya, lalu mengakuinya sebagai hasil survei sendiri.',
      'Mengubah angka-angka pada grafik agar sesuai dengan keinginan netizen di kolom komentar.',
      'Menampilkan grafik secara utuh tanpa mengubah maknanya dan menuliskan nama pemilik data/sumber aslinya secara jelas.',
      'Menyebarkan grafik tersebut hanya di grup chat rahasia agar tidak ketahuan oleh pembuat aslinya.',
    ],
    correct: 2,
  },
  {
    id: 14,
    text: 'Mengapa menyajikan data kelompok dalam bentuk histogram yang jujur dan akurat termasuk dalam bentuk kontribusi positif (etika baik) di ruang digital?',
    options: [
      'Karena data yang jujur membantu masyarakat digital (netizen) mengambil keputusan atau kesimpulan yang benar berdasarkan fakta.',
      'Karena netizen hanya menyukai postingan yang menggunakan istilah-istilah matematika yang rumit.',
      'Karena akun media sosial kita akan langsung mendapatkan centang biru (verified) dari platform.',
      'Karena hal itu membuat orang lain tidak berani mendebat atau memberikan komentar di postingan kita.',
    ],
    correct: 0,
  },
  {
    id: 15,
    text: 'Ketika kamu melihat sebuah infografis atau histogram di Instagram yang membandingkan dua data kelompok, tetapi kelompok yang satu memiliki rentang interval yang jauh lebih sempit dibanding kelompok lainnya sehingga visualisasinya terlihat tidak seimbang, kemampuan berpikir kritis apa yang sedang kamu gunakan?',
    options: [
      'Literasi finansial',
      'Literasi data dan media (Digital data literacy)',
      'Kemampuan algoritma pemrograman',
      'Etika netiket dasar',
    ],
    correct: 1,
  },
]

export default function DiagnostikPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(15).fill(null))
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const student = JSON.parse(data)
    // Cek sudah pernah ambil tes
    if (student.diagnosticScore !== null && student.diagnosticScore !== undefined) {
      router.push('/siswa/geft')
    }
  }, [router])

  const handleAnswer = (optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
  }

  const handleNext = useCallback(() => {
    const newAnswers = [...answers]
    newAnswers[currentQ] = selected
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      // Hitung skor
      const totalScore = newAnswers.reduce<number>((acc, ans, i) => {
        return acc + (ans === QUESTIONS[i].correct ? 1 : 0)
      }, 0)

      setPhase('result')

      // Simpan ke API
      setSaving(true)
      const student = JSON.parse(localStorage.getItem('student') ?? '{}')
      fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, score: totalScore }),
      }).then(r => r.json()).then(data => {
        // Update localStorage
        const updated = { ...student, diagnosticScore: data.diagnosticScore, diagnosticLevel: data.diagnosticLevel }
        localStorage.setItem('student', JSON.stringify(updated))
      }).catch(console.error).finally(() => setSaving(false))
    }
  }, [selected, currentQ, answers])

  const q = QUESTIONS[currentQ]

  const renderNavbar = () => (
    <header style={{
      width: '100%',
      background: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 255, 136, 0.08)',
      margin: '-24px -16px 24px -16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div
            animate={{ filter: ['drop-shadow(0 0 6px #00FF88)', 'drop-shadow(0 0 14px #00FF88)', 'drop-shadow(0 0 6px #00FF88)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ fontSize: '24px', lineHeight: 1 }}
          >
            🕵️
          </motion.div>
          <div>
            <div style={{
              fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #00FF88, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-heading), sans-serif',
            }}>
              Skeptikos
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
              INVESTIGASI DATA
            </div>
          </div>
        </div>
      </div>
    </header>
  )

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}>
      {/* Background grid + glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {renderNavbar()}

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              style={{
                width: '100%', maxWidth: '560px',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '28px',
                padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
                zIndex: 10,
                textAlign: 'center',
                color: '#fff',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                style={{ fontSize: '64px', marginBottom: '20px' }}
              >
                🕵️
              </motion.div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#00FF88', marginBottom: '12px' }}>
                TES DIAGNOSTIK AWAL
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
                Ukur Kemampuan Statistika Awalmu!
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 28px' }}>
                Sebelum memulai petualangan sebagai Detektif Data, kami perlu mengetahui kemampuan awal statistika kamu. Jawab <strong style={{ color: '#00FF88' }}>15 pertanyaan</strong> singkat dengan jujur — tidak ada yang benar atau salah!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', textAlign: 'left' }}>
                {[
                  { icon: '⏱', text: '15 soal pilihan ganda — tidak ada batas waktu' },
                  { icon: '📊', text: 'Hasil menentukan jalur belajar terbaikmu' },
                  { icon: '🔒', text: 'Tes ini hanya dilakukan sekali' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,255,136,0.04)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.12)' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPhase('test')}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(90deg, #00FF88, #06b6d4)',
                  color: '#000', fontSize: '15px', fontWeight: 800,
                  cursor: 'pointer', letterSpacing: '0.5px',
                  boxShadow: '0 4px 20px rgba(0,255,136,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                Mulai Tes Diagnostik 🚀
              </button>
            </motion.div>
          )}

          {/* ── TEST ── */}
          {phase === 'test' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '100%', maxWidth: '680px', zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: '20px',
              }}
            >
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #00FF88, #00cc6a)', borderRadius: '3px', boxShadow: '0 0 8px rgba(0,255,136,0.4)' }}
                    animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>

              {/* Question card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)',
                color: '#fff',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#00FF88', marginBottom: '14px' }}>
                  SOAL {currentQ + 1} / {QUESTIONS.length}
                </div>
                <p style={{ fontSize: '16px', lineHeight: 1.7, margin: '0 0 24px', fontWeight: 600 }}>
                  {q.text}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, i) => {
                    const isSelected = selected === i
                    const isCorrect = selected !== null && i === q.correct
                    const isWrong = selected === i && i !== q.correct

                    let bg = 'rgba(255,255,255,0.03)'
                    let border = '1px solid rgba(255,255,255,0.08)'
                    let color = 'rgba(255,255,255,0.8)'

                    if (isSelected && isCorrect) { bg = 'rgba(0,255,136,0.1)'; border = '1px solid rgba(0,255,136,0.5)'; color = '#00FF88' }
                    else if (isWrong) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.35)'; color = '#f87171' }
                    else if (isSelected) { bg = 'rgba(0,255,136,0.06)'; border = '1px solid rgba(0,255,136,0.3)'; color = 'rgba(255,255,255,0.9)' }
                    else if (selected !== null && isCorrect) { bg = 'rgba(0,255,136,0.08)'; border = '1px solid rgba(0,255,136,0.3)'; color = '#6ee7b7' }

                    return (
                      <motion.button
                        key={i}
                        whileHover={selected === null ? { scale: 1.01, x: 4 } : {}}
                        whileTap={selected === null ? { scale: 0.99 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={selected !== null}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '14px',
                          border, background: bg, color,
                          fontSize: '14px', fontWeight: 600, textAlign: 'left',
                          cursor: selected === null ? 'pointer' : 'default',
                          transition: 'all 0.2s', display: 'flex', gap: '12px', alignItems: 'center',
                          minHeight: '52px', touchAction: 'manipulation',
                        }}
                      >
                        <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                          {['A', 'B', 'C', 'D'][i]}
                        </span>
                        <span style={{ lineHeight: 1.5 }}>{opt}</span>
                        {isSelected && isCorrect && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✅</span>}
                        {isWrong && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>❌</span>}
                        {selected !== null && !isSelected && isCorrect && <span style={{ marginLeft: 'auto', fontSize: '14px' }}>✓</span>}
                      </motion.button>
                    )
                  })}
                </div>

                {selected !== null && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    style={{
                      width: '100%', marginTop: '20px', padding: '14px', borderRadius: '14px',
                      border: 'none', background: 'linear-gradient(90deg, #00FF88, #06b6d4)',
                      color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,255,136,0.3)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    {currentQ < QUESTIONS.length - 1 ? 'Lanjut Soal Berikutnya →' : 'Lihat Hasil →'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                width: '100%', maxWidth: '560px', zIndex: 10,
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '28px',
                padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
                textAlign: 'center', color: '#fff',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                style={{ fontSize: '72px', marginBottom: '16px' }}
              >
                🎉
              </motion.div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#00FF88', marginBottom: '10px' }}>
                TES DIAGNOSTIK SELESAI
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>
                Terima kasih sudah mengerjakan!
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  margin: '20px 0',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(0,255,136,0.06)',
                  border: '1px solid rgba(0,255,136,0.2)',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>🕵️</div>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                  Jawabanmu sudah direkam dan akan digunakan untuk menyesuaikan <strong style={{ color: '#00FF88' }}>pengalaman belajarmu</strong> secara personal. Setiap detektif punya kekuatan yang berbeda — dan kamu punya potensimu sendiri!
                </p>
              </motion.div>

              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.6 }}>
                Selanjutnya, ikuti <strong style={{ color: '#fff' }}>Tes GEFT</strong> untuk menentukan gaya kognitifmu (Field Independent / Field Dependent). Ini akan menentukan cara game memandumu!
              </p>

              <button
                onClick={() => router.push('/siswa/geft')}
                disabled={saving}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: saving ? 'rgba(0,255,136,0.3)' : 'linear-gradient(90deg, #00FF88, #06b6d4)',
                  color: '#000', fontSize: '15px', fontWeight: 800,
                  cursor: saving ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(0,255,136,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Menyimpan...' : 'Lanjut ke Tes GEFT →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
