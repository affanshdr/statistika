export const LEVEL2_CONFIG = {
  id: 2,
  title: 'Level 2 (Kasus: Cyberbullying)',
  subtitle: '',
  description: 'Investigasi kasus perundungan siber (Cyberbullying) di sekolah. Kumpulkan bukti dari korban dan pelaku, lalu lakukan analisis pemusatan data.',
}

// Raw dataset: frekuensi perundungan siber yang dialami korban dalam satu semester terakhir
export const cyberbullyingData = [
  2, 2, 2, 2, 3, 4, 4, 4, 4, 4,
  5, 6, 6, 7, 8, 9, 9, 10, 10, 10,
  11, 12, 12, 13, 13, 14, 15, 16, 16, 16
]

// Computed statistics
export const STATS = {
  n: 30,
  min: 2,
  max: 16,
  range: 14,
  mean: 8.3,     // ~249 / 30
  median: 8.5,   // (8 + 9) / 2
  modus: 4,
}

// Correct verdict value
export const CORRECT_VERDICT = 'SERIOUS_PROBLEM'

// Verdict explanation
export const VERDICT_EXPLANATION = `Hasil perhitungan menunjukkan rata-rata (Mean) tindakan perundungan siber adalah <strong>8.3 kali</strong> dan nilai tengahnya (Median) <strong>8.5 kali</strong> per semester. Meskipun frekuensi perundungan yang paling sering muncul (Modus) hanya <strong>4 kali</strong>, ukuran rata-rata dan median membuktikan adanya penyebaran perundungan intensitas tinggi (hingga 16 kali) yang dialami oleh cukup banyak korban. Ini membuktikan bahwa perundungan siber di sekolah merupakan <strong>MASALAH SERIUS YANG MENYEBAR LUAS</strong> dan membutuhkan penanganan terstruktur, tidak bisa diremehkan hanya berdasarkan nilai modusnya saja.`

// dialog setelah verifikasi kasus
export const MENTOR_DIALOG_AFTER_CASE = `Luar biasa, Detektif! 🎉 Analisismu telah membongkar pola tersembunyi dari perundungan siber di sekolah. Melalui Mean, Median, dan Modus, kita tahu bahwa masalah ini jauh lebih mendalam daripada yang terlihat di permukaan!

Kamu juga telah memberikan nasihat yang sangat berharga kepada pelaku tentang literasi digital dan etika bermedia sosial. Ini adalah langkah awal yang besar untuk menciptakan ruang digital yang lebih sehat.

Sebelum petualangan berikutnya, pastikan kamu mengunduh "Buku Saku Detektif Level 2" dan mengerjakan Post Test untuk menguji pemahamanmu!`

// Badges
export const BADGES = {
  DETECTIVE: { id: 'detective-cyberbullying', icon: '🛡️', name: 'Cyber Guard',     desc: 'Menyelesaikan Level 2' },
  SPEED:     { id: 'speed-analyst-l2',       icon: '⚡', name: 'Speed Analyst',   desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator-l2',icon: '🎯', name: 'Perfect Investigator', desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-thinker-l2',    icon: '🧠', name: 'Critical Thinker', desc: 'Analisis mendalam' },
  LITERACY_ADVISOR: { id: 'literacy-advisor',icon: '💡', name: 'Digital Advisor', desc: 'Membimbing pelaku cyberbullying' },
}
