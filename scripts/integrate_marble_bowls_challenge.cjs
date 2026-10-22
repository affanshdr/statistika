const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');

// Start from the clean git HEAD version
const headContent = execSync('git show HEAD:app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx', { encoding: 'utf-8' });

let content = headContent;

// 1. Add import for MarbleBowlsChallenge
const importNeedle = "import { CLASS_STUDENTS, getClassStudents } from '@/app/siswa/game/_levels/level1/data/level1Data'";
const newImport = `import { CLASS_STUDENTS, getClassStudents } from '@/app/siswa/game/_levels/level1/data/level1Data'
import MarbleBowlsChallenge from './MarbleBowlsChallenge'`;

content = content.replace(importNeedle, newImport);

// 2. Update A1 in generatePreLearningQuiz
const oldA1Block = `  if (doorId === 'A1') {
    // ── KELAS VII-A (5 Siswa): Jangkauan Data (Nilai Terbesar - Terkecil) ──
    const maxTime = Math.max(...times)
    const minTime = Math.min(...times)
    const maxStudent = students.find(s => s.time === maxTime)?.name || 'terlama'
    const minStudent = students.find(s => s.time === minTime)?.name || 'tersingkat'
    const diff = maxTime - minTime

    const pool = new Set<number>([diff])
    const candidateOffsets = [1, -1, 2, -2, 3]
    for (const offset of candidateOffsets) {
      if (pool.size >= 4) break
      const cand = diff + offset
      if (cand > 0 && !pool.has(cand)) pool.add(cand)
    }

    return {
      conceptTag: 'PRE-PEMBELAJARAN 1: Jangkauan Data (Nilai Max − Min)',
      introQuote: 'Karena kamu telat datang, jawab dulu tantangan Ibu baru datanya boleh diambil!',
      questionText: \`Amati data 5 siswa di atas! Berapa selisih waktu layar antara \${maxStudent} (\${maxTime} jam) dan \${minStudent} (\${minTime} jam)?\`,
      correctAnswer: diff,
      unit: 'jam',
      options: Array.from(pool).sort((a, b) => a - b),
      hintText: 'Cari angka tertinggi lalu kurangkan dengan angka terendah. Rumus: Rentang = Max − Min.',
      explanation: \`Tepat sekali! Selisih antara nilai tertinggi (\${maxTime} jam) dan terendah (\${minTime} jam) disebut Jangkauan (Range) = \${diff} jam.\`,
    }
  }`;

const newA1Block = `  if (doorId === 'A1') {
    // ─── KELAS VII-A: Tantangan Mangkuk Kelereng (Fair Share / Rata-Rata Intuitif) ───
    return {
      conceptTag: 'PRE-PEMBELAJARAN 1: Logika Pemerataan (Fair Share / Rata-Rata)',
      introQuote: 'Selesaikan tantangan teka-teki kelereng ini dengan tepat untuk membuka data screen time kelas!',
      questionText: 'Setarakan isi ke-4 mangkuk dengan memindahkan kelereng (drag and drop) hingga semua mangkuk sama banyak!',
      correctAnswer: 11,
      unit: 'kelereng',
      options: [9, 10, 11, 12],
      hintText: 'Pindahkan 4 butir dari Mangkuk A ke B, dan 7 butir dari Mangkuk C ke D sampai semuanya seimbang!',
      explanation: 'Tepat sekali! Setiap mangkuk akhirnya berisi 11 kelereng. Konsep meratakan isi seperti ini adalah fondasi intuitif dari Rata-Rata (Mean / Fair Share) dalam statistika!',
    }
  }`;

content = content.replace(oldA1Block, newA1Block);

// 3. Make modal width adaptive: maxWidth: door.id === 'A1' ? 620 : 540
content = content.replace("maxWidth: 540,", "maxWidth: door.id === 'A1' ? 620 : 540,");

// 4. Wrap sample table in {door.id !== 'A1' && (...)}
const tableStart = `{/* 1. Preview Tabel Data Siswa Kelas */}`;
const tableEnd = `{/* 2. Kartu Tantangan Pre-Pembelajaran Guru ("Karena Kamu Telat...") */}`;

const tableSectionIdx = content.indexOf(tableStart);
const cardSectionIdx = content.indexOf(tableEnd);

if (tableSectionIdx !== -1 && cardSectionIdx !== -1) {
  const tableSlice = content.slice(tableSectionIdx, cardSectionIdx);
  const wrappedTable = `{/* 1. Preview Tabel Data Siswa Kelas (Disembunyikan pada Kelas VII-A karena kuis kelereng mandiri) */}
        {door.id !== 'A1' && (
${tableSlice}
        )}

        `;
  content = content.slice(0, tableSectionIdx) + wrappedTable + content.slice(cardSectionIdx);
} else {
  console.error('Could not find table boundaries!');
}

// 5. In Kartu Tantangan, if door.id === 'A1', render MarbleBowlsChallenge, else render standard dialogue & options
const challengeContentStart = `{/* Teacher Dialogue & Prompt */}
          <div>
            <p style={{
              margin: '0 0 6px',
              fontSize: 'clamp(10px, 1.1vw, 11.5px)',
              color: '#FDE68A',
              fontWeight: 800,
              fontStyle: 'italic',
            }}>
              &ldquo;{quiz.introQuote}&rdquo;
            </p>
            <h4 style={{
              margin: 0,
              fontSize: 'clamp(12px, 1.4vw, 14px)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.4,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
            }}>
              {quiz.questionText}
            </h4>
          </div>

          {/* Options Grid (4 Pilihan Ganda) dengan Anti-Spam Protection */}
          <motion.div
            key={shake}
            animate={isCorrect === false ? { x: [-6, 6, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'clamp(4px, 0.8vw, 8px)',
            }}
          >
            {currentOptions.map(opt => {
              const isSelected = selectedAnswer === opt
              const isSelectedCorrect = isSelected && isCorrect === true
              const isSelectedWrong = isSelected && isCorrect === false
              return (
                <button
                  key={opt}
                  data-testid={\`wali-quiz-option-\${opt}\`}
                  disabled={isCorrect === true || isLocked}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: 'clamp(7px, 1vh, 11px) 4px',
                    borderRadius: '8px',
                    fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                    fontWeight: 900,
                    cursor: (isCorrect === true || isLocked) ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                    border: isSelectedCorrect
                      ? '2px solid #10B981'
                      : isSelectedWrong
                      ? '2px solid #EF4444'
                      : '1.5px solid #F59E0B',
                    background: isSelectedCorrect
                      ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
                      : isSelectedWrong
                      ? 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: isSelectedCorrect ? '#FFFFFF' : isSelectedWrong ? '#FFFFFF' : '#FEF3C7',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt} {quiz.unit} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                </button>
              )
            })}
          </motion.div>`;

const replacementChallenge = `{door.id === 'A1' ? (
            <MarbleBowlsChallenge
              onSuccess={() => {
                setIsCorrect(true)
                setSelectedAnswer(11)
                setIsLocked(false)
              }}
              isSolved={isCorrect === true}
            />
          ) : (
            <>
              {/* Teacher Dialogue & Prompt */}
              <div>
                <p style={{
                  margin: '0 0 6px',
                  fontSize: 'clamp(10px, 1.1vw, 11.5px)',
                  color: '#FDE68A',
                  fontWeight: 800,
                  fontStyle: 'italic',
                }}>
                  &ldquo;{quiz.introQuote}&rdquo;
                </p>
                <h4 style={{
                  margin: 0,
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.4,
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                }}>
                  {quiz.questionText}
                </h4>
              </div>

              {/* Options Grid (4 Pilihan Ganda) dengan Anti-Spam Protection */}
              <motion.div
                key={shake}
                animate={isCorrect === false ? { x: [-6, 6, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'clamp(4px, 0.8vw, 8px)',
                }}
              >
                {currentOptions.map(opt => {
                  const isSelected = selectedAnswer === opt
                  const isSelectedCorrect = isSelected && isCorrect === true
                  const isSelectedWrong = isSelected && isCorrect === false
                  return (
                    <button
                      key={opt}
                      data-testid={\`wali-quiz-option-\${opt}\`}
                      disabled={isCorrect === true || isLocked}
                      onClick={() => handleSelectOption(opt)}
                      style={{
                        padding: 'clamp(7px, 1vh, 11px) 4px',
                        borderRadius: '8px',
                        fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                        fontWeight: 900,
                        cursor: (isCorrect === true || isLocked) ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1,
                        border: isSelectedCorrect
                          ? '2px solid #10B981'
                          : isSelectedWrong
                          ? '2px solid #EF4444'
                          : '1.5px solid #F59E0B',
                        background: isSelectedCorrect
                          ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
                          : isSelectedWrong
                          ? 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isSelectedCorrect ? '#FFFFFF' : isSelectedWrong ? '#FFFFFF' : '#FEF3C7',
                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt} {quiz.unit} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                    </button>
                  )
                })}
              </motion.div>
            </>
          )}`;

if (content.includes(challengeContentStart)) {
  content = content.replace(challengeContentStart, replacementChallenge);
  console.log('Replaced challenge content with MarbleBowlsChallenge branch!');
} else {
  console.error('Could not find challengeContentStart in content!');
}

// 6. Only show standard feedback box for non-A1 doors, because MarbleBowlsChallenge has its own richer feedback card
const feedbackBox = `{isCorrect === true && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid #10B981',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 10px) clamp(10px, 1.2vw, 14px)',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#A7F3D0',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                🎉 {quiz.explanation}
              </motion.div>
            )}`;

const replacementFeedback = `{isCorrect === true && door.id !== 'A1' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid #10B981',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 10px) clamp(10px, 1.2vw, 14px)',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#A7F3D0',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                🎉 {quiz.explanation}
              </motion.div>
            )}`;

if (content.includes(feedbackBox)) {
  content = content.replace(feedbackBox, replacementFeedback);
  console.log('Adjusted feedback box for door.id !== A1!');
}

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Successfully updated WaliKelasModal.tsx with MarbleBowlsChallenge!');
