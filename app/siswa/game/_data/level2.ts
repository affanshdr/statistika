export const LEVEL2_CONFIG = {
  id: 2,
  title: 'Level 2 (Misi Pengukuran Lemparan)',
  subtitle: 'Jangkauan, Kuartil, dan IQR',
  description: 'Kumpulkan data jarak lemparan 15 siswa di lapangan sekolah, lalu selesaikan misi statistika: menghitung Jangkauan, menentukan Kuartil (Q1, Q2, Q3), dan menghitung Jangkauan Kuartil (IQR).',
}

// Badges for Level 2
export const BADGES = {
  FIELD_MASTER: { id: 'field-master-l2', icon: '🏅', name: 'Ahli Lapangan', desc: 'Menyelesaikan semua misi pengukuran' },
  PERFECT: { id: 'perfect-stats-l2', icon: '🎯', name: 'Statistisi Sempurna', desc: '3 bintang di Level 2' },
  SPEED: { id: 'speed-stats-l2', icon: '⚡', name: 'Pengukur Cepat', desc: 'Selesai di bawah 50% waktu' },
}

// Verdict for Level 2
export const CORRECT_VERDICT = 'MEASUREMENT_COMPLETE'

export const VERDICT_EXPLANATION = `Kamu berhasil mengumpulkan 15 data lemparan dan menggunakannya untuk memahami Jangkauan (Range), Kuartil (Q1, Q2, Q3), dan Jangkauan Kuartil (IQR). Statistika membantu kita memahami sebaran data, bukan sekadar menghafal rumus!`
