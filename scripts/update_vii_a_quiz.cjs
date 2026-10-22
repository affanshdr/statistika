const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update QuizData interface to include optional visualBowls
const oldInterface = `interface QuizData {
  conceptTag: string
  introQuote: string
  questionText: string
  hintText: string
  correctAnswer: number
  unit: string
  options: number[]
  explanation: string
}`;

const newInterface = `interface QuizData {
  conceptTag: string
  introQuote: string
  questionText: string
  hintText: string
  correctAnswer: number
  unit: string
  options: number[]
  explanation: string
  visualBowls?: { label: string; count: number }[]
}`;

if (content.includes(oldInterface)) {
  content = content.replace(oldInterface, newInterface);
  console.log('QuizData interface updated!');
} else {
  console.error('Could not find oldInterface');
}

// 2. Update doorId === 'A1' block
const a1Start = content.indexOf("if (doorId === 'A1') {");
const a2Start = content.indexOf("if (doorId === 'A2') {");

if (a1Start !== -1 && a2Start !== -1) {
  const newA1Block = `if (doorId === 'A1') {
    // ─── KELAS VII-A: Tantangan Mangkuk Kelereng (Fair Share / Rata-Rata Intuitif) ───
    const bowls = [
      { label: 'Mangkuk A', count: 15 },
      { label: 'Mangkuk B', count: 7 },
      { label: 'Mangkuk C', count: 18 },
      { label: 'Mangkuk D', count: 4 },
    ]
    const correctAnswer = 11 // (15 + 7 + 18 + 4) / 4 = 11

    return {
      conceptTag: 'PRE-PEMBELAJARAN 1: Logika Pemerataan (Fair Share / Rata-Rata)',
      introQuote: 'Karena kamu telat datang, selesaikan dulu tantangan teka-teki kelereng Ibu baru datanya boleh diambil!',
      questionText: 'Ada 4 mangkuk di atas meja yang berisi kelereng dengan jumlah berbeda-beda: A (15), B (7), C (18), dan D (4). Tanpa menghitung total lalu membaginya dengan angka 4, pindahkan kelereng antar-mangkuk agar setiap mangkuk memiliki jumlah yang sama banyak. Berapa jumlah kelereng di setiap mangkuk pada akhirnya?',
      correctAnswer,
      unit: 'kelereng',
      options: [9, 10, 11, 12],
      visualBowls: bowls,
      hintText: 'Pindahkan 4 kelereng dari Mangkuk A ke B, dan 7 kelereng dari Mangkuk C ke D sampai semuanya seimbang!',
      explanation: 'Tepat sekali! Setiap mangkuk akhirnya berisi 11 kelereng. Konsep meratakan isi seperti ini adalah fondasi intuitif dari Rata-Rata (Mean / Fair Share) dalam statistika!',
    }
  }

  `;

  content = content.slice(0, a1Start) + newA1Block + content.slice(a2Start);
  console.log('doorId A1 quiz logic updated!');
} else {
  console.error('Could not find doorId A1 or A2');
}

// 3. Inject visualBowls cards in UI right after introQuote
const targetQuote = `&ldquo;{quiz.introQuote}&rdquo;
            </p>`;

const visualBowlsJSX = `&ldquo;{quiz.introQuote}&rdquo;
            </p>
            {quiz.visualBowls && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'clamp(6px, 1vw, 10px)',
                margin: '8px 0 10px',
              }}>
                {quiz.visualBowls.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1.5px solid #F59E0B',
                      borderRadius: '10px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>🥣</div>
                    <div style={{ fontSize: '10.5px', color: '#FEF3C7', fontWeight: 800 }}>{b.label}</div>
                    <div style={{ fontSize: '13.5px', color: '#FDE047', fontWeight: 900, marginTop: '2px' }}>
                      {b.count} <span style={{ fontSize: '9.5px', fontWeight: 600 }}>butir</span>
                    </div>
                  </div>
                ))}
              </div>
            )}`;

if (content.includes(targetQuote)) {
  content = content.replace(targetQuote, visualBowlsJSX);
  console.log('visualBowls UI added!');
} else {
  console.error('Could not find targetQuote');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully written updated WaliKelasModal.tsx!');
