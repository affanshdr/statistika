const fs = require('fs');
const path = require('path');

const npathFile = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let code = fs.readFileSync(npathFile, 'utf8');

// 1. Definition of STAGE_TUTORIALS above function PakReportModal
const stageTutorialsCode = `
interface StageTutorialContent {
  stepNum: number
  tag: string
  title: string
  icon: string
  badgeColor: string
  conceptHeading: string
  conceptText: string
  formula?: {
    title: string
    equation: string
    explanation: string
  }
  howToSteps: string[]
  proTip: string
}

const STAGE_TUTORIALS: Record<'sort' | 'modus' | 'median' | 'mean', StageTutorialContent> = {
  sort: {
    stepNum: 1,
    tag: 'Fondasi Statistika',
    title: 'Tahap 1: Mengurutkan Data (Data Terurut)',
    icon: '🔢',
    badgeColor: '#059669',
    conceptHeading: 'Mengapa Data Harus Diurutkan Terlebih Dahulu?',
    conceptText:
      'Dalam statistika, mengurutkan data dari nilai terkecil ke terbesar (ascending order) adalah langkah awal paling mendasar. Dengan data terurut, pola data langsung terlihat jelas, angka kembar berkumpul, serta kita bisa menemukan nilai tengah (median) dan nilai terbanyak (modus) dengan sangat cepat dan akurat.',
    howToSteps: [
      'Ambil bulatan angka dari wadah atas (Drag & Drop atau klik angka untuk mengambil ke tangan).',
      'Letakkan angka ke slot bernomor urut #1 sampai #24 di wadah bawah, dimulai dari nilai terkecil ke terbesar.',
      'Jika ada angka yang bernilai sama, susun berdampingan pada slot yang berurutan.',
      'Setelah semua 24 slot terisi, tekan tombol "Periksa Urutan Data" untuk memverifikasi!'
    ],
    proTip:
      'Perhatikan angka kembar sebelum menaruh! Mengelompokkan angka yang sama akan langsung membantumu menjawab Tahap 2 (Modus) dengan mudah.'
  },
  modus: {
    stepNum: 2,
    tag: 'Ukuran Pemusatan Data',
    title: 'Tahap 2: Menentukan Modus (Mode / Nilai Terbanyak)',
    icon: '📊',
    badgeColor: '#0284C7',
    conceptHeading: 'Apa itu Modus dalam Statistika?',
    conceptText:
      'Modus (Mo) adalah nilai data yang paling sering muncul atau memiliki frekuensi kemunculan tertinggi di dalam sekumpulan data. Modus berguna untuk mengetahui kebiasaan atau tren mayoritas dari kelompok yang kita amati.',
    formula: {
      title: 'Prinsip Menemukan Modus:',
      equation: 'Mo = Nilai data dengan Frekuensi (f) Terbanyak',
      explanation:
        'Karena data sudah diurutkan di Tahap 1, angka yang sama kini berjejer rapat berdampingan. Kamu cukup mencari barisan angka kembar yang paling panjang!'
    },
    howToSteps: [
      'Amati 24 bulatan data terurut di bagian atas layar.',
      'Hitung frekuensi (berapa kali suatu angka muncul) untuk setiap deretan angka yang ada.',
      'Cari nilai yang memiliki jumlah kemunculan terbanyak, lalu pilih opsi jawaban yang tepat.'
    ],
    proTip:
      'Sebuah kumpulan data bisa memiliki satu modus (unimodal), dua modus (bimodal), atau bahkan tidak ada modus jika semua angka muncul sama banyaknya.'
  },
  median: {
    stepNum: 3,
    tag: 'Ukuran Pemusatan Data',
    title: 'Tahap 3: Menentukan Median (Nilai Tengah Data Terurut)',
    icon: '⚖️',
    badgeColor: '#D97706',
    conceptHeading: 'Apa itu Median dan Bagaimana Cara Menghitungnya?',
    conceptText:
      'Median (Me) adalah nilai tengah yang membagi sekumpulan data menjadi dua kelompok sama banyak (50% data di sebelah kiri dan 50% data di sebelah kanan) setelah data diurutkan dari terkecil ke terbesar.',
    formula: {
      title: 'Rumus Median untuk Jumlah Data Genap (n = 24):',
      equation: 'Me = (Data ke-12 + Data ke-13) ÷ 2',
      explanation:
        'Karena n = 24 (genap), posisi tengah berada di antara data ke-(n/2) yaitu data ke-12 dan data ke-(n/2 + 1) yaitu data ke-13. Jumlahkan kedua angka tersebut lalu bagi 2!'
    },
    howToSteps: [
      'Lihat bulatan data di bagian atas. Dua bulatan di tengah telah diberi penanda khusus (#12 dan #13).',
      'Catat nilai data ke-12 dan nilai data ke-13.',
      'Gunakan kalkulator di sebelah kanan untuk menghitung: (Nilai #12 + Nilai #13) ÷ 2.',
      'Pilih salah satu dari 4 pilihan jawaban yang sesuai.'
    ],
    proTip:
      'Median sangat tangguh terhadap nilai ekstrem (pencilan / outlier). Berapa pun besarnya angka di ujung kanan atau kiri, nilai Median tetap stabil di tengah!'
  },
  mean: {
    stepNum: 4,
    tag: 'Ukuran Pemusatan Data',
    title: 'Tahap 4: Menghitung Rata-Rata (Mean / Nilai Representatif)',
    icon: '🧮',
    badgeColor: '#059669',
    conceptHeading: 'Apa itu Mean (Rata-Rata Hitung)?',
    conceptText:
      'Mean (x̄ atau dibaca "x-bar") adalah nilai rata-rata hitung yang mewakili keseluruhan data. Nilai ini diperoleh dengan menjumlahkan seluruh nilai data kemudian membaginya secara merata dengan total banyaknya data.',
    formula: {
      title: 'Rumus Resmi Mean (Statistika SMP):',
      equation: 'x̄ = Σx ÷ n = (Jumlah seluruh nilai data) ÷ (Banyaknya data)',
      explanation:
        'Σx (dibaca "sigma x") adalah hasil penjumlahan seluruh 24 data waktu layar. n adalah banyaknya data (24 siswa).'
    },
    howToSteps: [
      'Gunakan total jumlah nilai data (Σx) yang sudah disediakan atau hitung menggunakan kalkulator.',
      'Bagi nilai total Σx tersebut dengan banyaknya data (n = 24): x̄ = Σx ÷ 24.',
      'Kalkulator di sebelah kanan siap membantumu melakukan operasi pembagian ini.',
      'Pilih jawaban yang tepat dari pilihan yang tersedia.'
    ],
    proTip:
      'Mean sangat dipengaruhi oleh angka ekstrem! Jika ada siswa yang waktu layarnya sangat tinggi (misal 15 jam), rata-rata akan ikut tertarik naik. Fenomena inilah yang akan kita selidiki di level berikutnya!'
  }
}
`;

// Insert STAGE_TUTORIALS before PakReportModal
if (!code.includes('const STAGE_TUTORIALS')) {
  code = code.replace(
    /\/\/ [^\n]*Pak Sutrisno Papan Analisis Data[^\n]*\nfunction PakReportModal/,
    `${stageTutorialsCode}\n// Pak Sutrisno Papan Analisis Data (Full Layar 3:1 Split + Kalkulator)\nfunction PakReportModal`
  );
  console.log('Inserted STAGE_TUTORIALS definition!');
}

// 2. Add seenTutorials and showTutorialModal state
const targetState = `  const [stage, setStage] = useState<'sort' | 'modus' | 'median' | 'mean'>('sort')
  const [isSorted, setIsSorted] = useState<boolean>(false)`;

const replacementState = `  const [stage, setStage] = useState<'sort' | 'modus' | 'median' | 'mean'>('sort')
  const [isSorted, setIsSorted] = useState<boolean>(false)
  const [seenTutorials, setSeenTutorials] = useState<Record<string, boolean>>({})
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(true)

  // Otomatis tampilkan tutorial saat masuk tahap baru jika belum pernah dilihat
  useEffect(() => {
    if (!seenTutorials[stage]) {
      setShowTutorialModal(true)
    }
  }, [stage])

  const handleCloseTutorial = () => {
    setSeenTutorials(prev => ({ ...prev, [stage]: true }))
    setShowTutorialModal(false)
    gameAudio.playClick()
  }`;

if (!code.includes('showTutorialModal') && code.includes(targetState)) {
  code = code.replace(targetState, replacementState);
  console.log('Inserted tutorial state and handler in PakReportModal!');
}

// 3. Add Panduan Materi button in Header Bar before btn-dev-instant-win
const targetHeader = `<div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button
            data-testid="btn-dev-instant-win"`;

const replacementHeader = `<div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.7vw, 8px)', flexShrink: 0 }}>
          {/* Tombol Panduan Materi / Tutorial untuk Tahap Aktif */}
          <button
            data-testid="btn-open-tutorial-header"
            onClick={() => {
              setShowTutorialModal(true)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(7px, 1vw, 12px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #60A5FA',
              background: 'linear-gradient(180deg, #1E3A8A 0%, #172554 100%)',
              color: '#EFF6FF',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka Panel Panduan & Tutorial Konsep Belajar"
          >
            <span style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}>💡</span>
            <span>Panduan Materi</span>
          </button>

          <button
            data-testid="btn-dev-instant-win"`;

if (!code.includes('btn-open-tutorial-header') && code.includes(targetHeader)) {
  code = code.replace(targetHeader, replacementHeader);
  console.log('Inserted header tutorial button!');
}

// 4. Add mini tutorial banner in Tahap 1 Sort
const targetSortPool = `{/* BAGIAN ATAS (50%): 24 DATA ACAK POOL */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDropOnPool}`;

const replacementSortPool = `{/* BAGIAN ATAS (50%): 24 DATA ACAK POOL */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(5, 150, 105, 0.22)',
                border: '1px solid rgba(52, 211, 153, 0.45)',
                borderRadius: '8px',
                padding: '2px 10px',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 'clamp(8px, 1vw, 10px)', color: '#D1FAE5', fontWeight: 800 }}>
                  🔢 <strong>Tahap 1:</strong> Susun 24 data waktu layar dari nilai terkecil (slot #1) hingga terbesar (slot #24).
                </span>
                <button
                  data-testid="btn-open-tutorial-sort"
                  onClick={() => {
                    setShowTutorialModal(true)
                    gameAudio.playClick()
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FDE68A',
                    fontSize: 'clamp(8px, 1vw, 10px)',
                    fontWeight: 900,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <span>💡 Panduan Tutorial</span>
                </button>
              </div>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDropOnPool}`;

if (!code.includes('btn-open-tutorial-sort') && code.includes(targetSortPool)) {
  code = code.replace(targetSortPool, replacementSortPool);
  console.log('Inserted Tahap 1 sort mini tutorial banner!');
}

// 5. Add mini button to Tahap 2 Modus
const targetModusHead = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                          TAHAP 2 DARI 4
                        </span>
                        <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#0284C7', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                          MODUS (NILAI TERBANYAK)
                        </span>
                      </div>`;

const replacementModusHead = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 2 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#0284C7', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            MODUS (NILAI TERBANYAK)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-modus"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(2, 132, 199, 0.1)',
                            border: '1px solid rgba(2, 132, 199, 0.35)',
                            color: '#0284C7',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>`;

if (!code.includes('btn-open-tutorial-modus') && code.includes(targetModusHead)) {
  code = code.replace(targetModusHead, replacementModusHead);
  console.log('Inserted Tahap 2 modus mini tutorial button!');
}

// 6. Add mini button to Tahap 3 Median
const targetMedianHead = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                          TAHAP 3 DARI 4
                        </span>
                        <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#D97706', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                          MEDIAN (NILAI TENGAH)
                        </span>
                      </div>`;

const replacementMedianHead = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 3 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#D97706', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            MEDIAN (NILAI TENGAH)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-median"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(217, 119, 6, 0.1)',
                            border: '1px solid rgba(217, 119, 6, 0.35)',
                            color: '#B45309',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>`;

if (!code.includes('btn-open-tutorial-median') && code.includes(targetMedianHead)) {
  code = code.replace(targetMedianHead, replacementMedianHead);
  console.log('Inserted Tahap 3 median mini tutorial button!');
}

// 7. Add mini button to Tahap 4 Mean
const targetMeanHead = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                          TAHAP 4 DARI 4
                        </span>
                        <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#059669', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                          RATA-RATA (MEAN)
                        </span>
                      </div>`;

const replacementMeanHead = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 4 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#059669', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            RATA-RATA (MEAN)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-mean"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(5, 150, 105, 0.1)',
                            border: '1px solid rgba(5, 150, 105, 0.35)',
                            color: '#059669',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>`;

if (!code.includes('btn-open-tutorial-mean') && code.includes(targetMeanHead)) {
  code = code.replace(targetMeanHead, replacementMeanHead);
  console.log('Inserted Tahap 4 mean mini tutorial button!');
}

// 8. Add the TutorialModal JSX right before the last closing </div> of PakReportModal
const tutorialModalJSX = `
      {/* 📘 MODAL PANDUAN TUTORIAL EDUKASI PER TAHAP */}
      <AnimatePresence>
        {showTutorialModal && STAGE_TUTORIALS[stage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 800,
              background: 'rgba(15, 8, 4, 0.75)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(10px, 2vh, 20px) clamp(12px, 2vw, 24px)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseTutorial()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 24, stiffness: 340 }}
              data-testid="stage-tutorial-modal"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 'clamp(360px, 60vw, 640px)',
                maxHeight: '92vh',
                background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF3E6 100%)',
                border: '2.5px solid #8C6239',
                borderRadius: 'clamp(12px, 1.8vw, 18px)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
                display: 'flex',
                flexDirection: 'column',
                color: '#1E1B18',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Push Pin Hiasan */}
              <div style={{ position: 'absolute', top: '10px', left: '16px', zIndex: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.5 10.5 17 12 18.5C13.5 17 18 11.5 18 8C18 4.68629 15.3137 2 12 2Z" fill="#B45309" />
                  <circle cx="12" cy="8" r="3" fill="#FDE68A" />
                  <line x1="12" y1="18.5" x2="12" y2="23" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Header Modal */}
              <div style={{
                padding: 'clamp(12px, 1.8vh, 18px) clamp(16px, 2.2vw, 24px) clamp(8px, 1.2vh, 12px) clamp(44px, 5vw, 56px)',
                borderBottom: '1.5px solid rgba(140, 98, 57, 0.25)',
                background: 'rgba(140, 98, 57, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                position: 'relative',
              }}>
                {/* Tombol Tutup Silang */}
                <button
                  data-testid="btn-close-tutorial"
                  onClick={handleCloseTutorial}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '14px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(140, 98, 57, 0.35)',
                    background: '#FFFDF7',
                    color: '#78350F',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    transition: 'all 0.15s ease',
                  }}
                  title="Tutup panduan materi"
                >
                  ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 'clamp(8.5px, 1vw, 10px)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    background: '#362014',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    letterSpacing: '0.5px',
                  }}>
                    TAHAP {STAGE_TUTORIALS[stage].stepNum} DARI 4
                  </span>
                  <span style={{
                    fontSize: 'clamp(8.5px, 1vw, 10px)',
                    fontWeight: 900,
                    color: STAGE_TUTORIALS[stage].badgeColor,
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: \`1.5px solid \${STAGE_TUTORIALS[stage].badgeColor}\`,
                    padding: '1.5px 8px',
                    borderRadius: '999px',
                  }}>
                    {STAGE_TUTORIALS[stage].tag.toUpperCase()}
                  </span>
                </div>

                <h3 style={{
                  margin: '4px 0 0',
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  fontWeight: 900,
                  color: '#27150B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span>{STAGE_TUTORIALS[stage].icon}</span>
                  <span>{STAGE_TUTORIALS[stage].title}</span>
                </h3>
              </div>

              {/* Scrollable Body Modal */}
              <div
                className="corkboard-scroll-area"
                style={{
                  padding: 'clamp(12px, 1.8vh, 18px) clamp(16px, 2.2vw, 24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(10px, 1.5vh, 14px)',
                  overflowY: 'auto',
                  maxHeight: 'calc(92vh - 130px)',
                  boxSizing: 'border-box',
                }}
              >
                {/* Card 1: Konsep Inti */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(140, 98, 57, 0.28)',
                  borderRadius: '10px',
                  padding: 'clamp(10px, 1.5vh, 14px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}>
                  <h4 style={{
                    margin: '0 0 6px',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 900,
                    color: '#362014',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span>📖</span>
                    <span>{STAGE_TUTORIALS[stage].conceptHeading}</span>
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(9.5px, 1.15vw, 12px)',
                    color: '#475569',
                    lineHeight: 1.5,
                  }}>
                    {STAGE_TUTORIALS[stage].conceptText}
                  </p>
                </div>

                {/* Card 2: Rumus / Prinsip Matematis (jika ada) */}
                {STAGE_TUTORIALS[stage].formula && (
                  <div style={{
                    background: 'linear-gradient(180deg, #1E1B18 0%, #2A2420 100%)',
                    border: '2px solid #B48C50',
                    borderRadius: '10px',
                    padding: 'clamp(10px, 1.5vh, 14px)',
                    color: '#FEF3C7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}>
                    <div style={{
                      fontSize: 'clamp(8.5px, 1vw, 10.5px)',
                      fontWeight: 900,
                      color: '#FDE68A',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <span>📐</span>
                      <span>{STAGE_TUTORIALS[stage].formula.title}</span>
                    </div>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px dashed rgba(253, 230, 138, 0.4)',
                      borderRadius: '6px',
                      padding: 'clamp(6px, 1vh, 8px) 12px',
                      fontFamily: 'monospace',
                      fontSize: 'clamp(11.5px, 1.4vw, 14.5px)',
                      fontWeight: 900,
                      color: '#86EFAC',
                      textAlign: 'center',
                      margin: '6px 0',
                      letterSpacing: '0.4px',
                    }}>
                      {STAGE_TUTORIALS[stage].formula.equation}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(9px, 1.1vw, 11px)',
                      color: '#E2E8F0',
                      lineHeight: 1.4,
                    }}>
                      {STAGE_TUTORIALS[stage].formula.explanation}
                    </p>
                  </div>
                )}

                {/* Card 3: Cara Pengerjaan di Game */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(140, 98, 57, 0.28)',
                  borderRadius: '10px',
                  padding: 'clamp(10px, 1.5vh, 14px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}>
                  <h4 style={{
                    margin: '0 0 8px',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 900,
                    color: '#362014',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span>🎮</span>
                    <span>Langkah Pengerjaan di Game:</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {STAGE_TUTORIALS[stage].howToSteps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#362014',
                          color: '#FEF3C7',
                          fontSize: '10px',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{
                          fontSize: 'clamp(9.5px, 1.15vw, 12px)',
                          color: '#334155',
                          lineHeight: 1.45,
                        }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 4: Tips Detektif Statistik */}
                <div style={{
                  background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
                  border: '1.5px solid #F59E0B',
                  borderRadius: '10px',
                  padding: 'clamp(8px, 1.3vh, 12px) 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                }}>
                  <span style={{ fontSize: 'clamp(16px, 2vw, 20px)', flexShrink: 0, marginTop: '1px' }}>💡</span>
                  <div>
                    <div style={{ fontSize: 'clamp(9px, 1.1vw, 11px)', fontWeight: 900, color: '#92400E', marginBottom: '2px' }}>
                      TIPS DETEKTIF STATISTIK:
                    </div>
                    <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#78350F', lineHeight: 1.4, fontWeight: 600 }}>
                      {STAGE_TUTORIALS[stage].proTip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Modal: Tombol Paham / Mulai */}
              <div style={{
                padding: 'clamp(10px, 1.5vh, 14px) clamp(16px, 2.2vw, 24px)',
                borderTop: '1.5px solid rgba(140, 98, 57, 0.25)',
                background: 'rgba(140, 98, 57, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 'clamp(8.5px, 1vw, 10.5px)', color: '#78350F', fontWeight: 700 }}>
                  Kamu bisa membuka panduan ini lagi kapan saja via tombol 💡 di atas.
                </span>
                <button
                  data-testid="btn-confirm-tutorial"
                  onClick={handleCloseTutorial}
                  style={{
                    padding: 'clamp(8px, 1.2vh, 12px) clamp(16px, 2.2vw, 24px)',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    border: '1.5px solid #34D399',
                    color: '#FFFFFF',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>🚀</span>
                  <span>Paham, Mulai Mengerjakan!</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

// Insert tutorialModalJSX before the closing </div> of PakReportModal
const targetModalEnd = `              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default function NPath`;

const replacementModalEnd = `              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
${tutorialModalJSX}
    </div>
  )
}

export default function NPath`;

if (!code.includes('stage-tutorial-modal') && code.includes(targetModalEnd)) {
  code = code.replace(targetModalEnd, replacementModalEnd);
  console.log('Inserted tutorial modal JSX into PakReportModal!');
}

fs.writeFileSync(npathFile, code, 'utf8');
console.log('NPath.tsx updated successfully!');
