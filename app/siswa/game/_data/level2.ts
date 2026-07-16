export const LEVEL2_CONFIG = {
  id: 2,
  title: 'Level 2 (Cyberbullying Investigation)',
  subtitle: '',
  description: 'Investigasilah kasus Cyberbullying di sekolah. Analisis sebaran frekuensi siswa yang mengalami cyberbullying untuk menentukan pola intervensi yang tepat.',
}

// Raw dataset: frekuensi cyberbullying yang dialami 30 siswa dalam satu semester
export const cyberbullyingData = [
  2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 
  5, 6, 6, 7, 8, 9, 9, 10, 10, 10, 
  11, 12, 12, 13, 13, 14, 15, 16, 16, 16
]

// Interval classes: width = 3 (2-4, 5-7, 8-10, 11-13, 14-16)
export const CLASS_LABELS = ['2 – 4', '5 – 7', '8 – 10', '11 – 13', '14 – 16']

export function getClassIndex(val: number): number {
  if (val >= 2  && val <= 4)  return 0
  if (val >= 5  && val <= 7)  return 1
  if (val >= 8  && val <= 10) return 2
  if (val >= 11 && val <= 13) return 3
  if (val >= 14 && val <= 16) return 4
  return -1
}

// Computed statistics
const total = cyberbullyingData.reduce((a, b) => a + b, 0)
const sorted = [...cyberbullyingData].sort((a, b) => a - b)
const median = sorted.length % 2 === 0
  ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
  : sorted[Math.floor(sorted.length / 2)]

export const STATS = {
  n: 30,
  min: 2,
  max: 16,
  range: 14,
  mean: Number((total / 30).toFixed(2)), // ~8.30
  median,
  numClasses: 5,
  classWidth: 3,
}

// Correct answer: frequency distribution table
export const CORRECT_TABLE = [
  { kelas: '2 – 4',   f: 10, fRel: 33.3, fKum: 10 },
  { kelas: '5 – 7',   f: 4,  fRel: 13.3, fKum: 14 },
  { kelas: '8 – 10',  f: 6,  fRel: 20.0, fKum: 20 },
  { kelas: '11 – 13', f: 5,  fRel: 16.7, fKum: 25 },
  { kelas: '14 – 16', f: 5,  fRel: 16.7, fKum: 30 },
]

// Bar heights as percentage of max frequency (10)
const maxF = Math.max(...CORRECT_TABLE.map(row => row.f))
export const HISTOGRAM_BARS = CORRECT_TABLE.map(row => ({
  label: row.kelas,
  f: row.f,
  heightPct: Math.round((row.f / maxF) * 100),
}))

// Correct verdict / kesimpulan investigasi
export const CORRECT_VERDICT = 'INTERVENTION_NEEDED'

// Verdict explanation
export const VERDICT_EXPLANATION = `Hasil analisis data 30 siswa menunjukkan rata-rata (mean) frekuensi perlakuan cyberbullying adalah <strong>${STATS.mean} kali</strong> per semester dengan median <strong>${STATS.median} kali</strong>. Mayoritas korban (<strong>10 dari 30 siswa atau 33.3%</strong>) terkelompok pada frekuensi rendah <strong>2–4 kali</strong>. Namun, terdapat kelompok korban yang cukup signifikan (<strong>5 dari 30 siswa atau 16.7%</strong>) yang mengalami perlakuan bullying secara ekstrem hingga <strong>14–16 kali</strong> dalam satu semester. Hal ini menunjukkan perlunya <strong>intervensi dini</strong> dan tindakan preventif yang terarah agar kasus perundungan berulang ini dapat dihentikan.`

// Keyword checker untuk refleksi atau analisis (tidak dipakai langsung tapi dideklarasikan agar shape sama)
export const CRITICAL_KEYWORDS_POSITIVE = [
  'intervensi', 'penanganan', 'cegah', 'cyberbullying', 'korban', 'dini', 'pencegahan', 'bantu'
]

export const CRITICAL_KEYWORDS_EVIDENCE = [
  'rata-rata', 'mean', 'median', 'frekuensi', 'histogram', '2-4', '14-16', '16.7%', '33.3%', 'outlier'
]

export const FD_CRITICAL_KEYWORDS_EVIDENCE = [
  'rata-rata', 'mean', 'median', 'frekuensi', 'histogram', '2-4', '14-16', '16.7%', '33.3%', 'outlier',
  'banyak', 'sedikit', 'sering', 'jarang', 'bully'
]

export const MENTOR_DIALOG_AFTER_MYTHBUST = `Selamat, Detektif! 🎉 Penyelidikan cyberbullying ini memberikan bukti konkret bahwa statistika bisa membantu sekolah memetakan masalah kesejahteraan siswa (well-being). Tanpa analisis distribusi frekuensi ini, kita tidak akan tahu bahwa ada kelompok siswa yang menjadi korban cyberbullying berulang secara ekstrem.
  
Sekarang kamu telah memahami materi distribusi frekuensi kelompok dan ukuran pemusatan data (mean, median) secara mendalam. 

Buka kembali "Buku Saku Detektif" untuk mempelajari bagan rangkuman materi ukuran pemusatan data berkelompok!`

export const BADGES = {
  DETECTIVE: { id: 'detective-cyber',       icon: '🕵️‍♂️', name: 'Cyber Detective',       desc: 'Menyelesaikan Level 2' },
  SPEED:     { id: 'speed-analyst-2',       icon: '⚡', name: 'Swift Analyst',           desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator-2',icon: '🎯', name: 'Flawless Investigator',    desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-citizen',      icon: '🧠', name: 'Digital Citizen',        desc: 'Analisis mendalam' },
  MYTHBUST:  { id: 'cyber-bully-buster',    icon: '💥', name: 'Cyber Bully Buster',      desc: 'Berhasil menghentikan bullying' },
}
