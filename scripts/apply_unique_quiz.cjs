const fs = require('fs');

// 1. UPDATE WaliKelasModal.tsx
const waliModalFile = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx';
let waliContent = fs.readFileSync(waliModalFile, 'utf8');

// A. Update QuizData interface
waliContent = waliContent.replace(
  /interface QuizData \{[\s\S]*?explanation: string\s*\}/,
  `interface QuizData {
  conceptTag: string
  introQuote: string
  questionText: string
  hintText: string
  correctAnswer: number
  unit: string
  options: number[]
  explanation: string
}`
);

// B. Update generatePreLearningQuiz for A1
waliContent = waliContent.replace(
  /explanation:\s*`Tepat sekali! Selisih antara nilai tertinggi[\s\S]*?diff\} jam\.`,\s*\}/,
  `hintText: 'Cari angka tertinggi lalu kurangkan dengan angka terendah. Rumus: Rentang = Max − Min.',
      explanation: \`Tepat sekali! Selisih antara nilai tertinggi (\${maxTime} jam) dan terendah (\${minTime} jam) disebut Jangkauan (Range) = \${diff} jam.\`,
    }`
);

// C. Update generatePreLearningQuiz for A2
waliContent = waliContent.replace(
  /explanation:\s*`Benar! Ada \$\{matching\} siswa dengan waktu layar[\s\S]*?Frekuensi \(f\)\.`,\s*\}/,
  `hintText: \`Amati kartu siswa di atas. Hitung berapa banyak siswa yang memiliki waktu layar > \${cutoff} jam.\`,
      explanation: \`Benar! Ada \${matching} siswa dengan waktu layar > \${cutoff} jam. Menghitung banyaknya data seperti ini disebut menentukan Frekuensi (f).\`,
    }`
);

// D. Update generatePreLearningQuiz for B1
waliContent = waliContent.replace(
  /explanation:\s*`Luar biasa! Total seluruh nilai data[\s\S]*?mempelajari rata-rata!`,\s*\}/,
  `hintText: \`Jumlahkan keempat angka jam waktu layar siswa: \${formulaStr}.\`,
      explanation: \`Luar biasa! Total seluruh nilai data (Σx) adalah \${sum} jam. Nilai total ini adalah modal penting sebelum kita mempelajari rata-rata!\`,
    }`
);

// E. Update generatePreLearningQuiz for B2
waliContent = waliContent.replace(
  /explanation:\s*`Tepat sekali! Selisihnya \$\{targetVal\} jam\.[\s\S]*?Pencilan \(Outlier\)\.`,\s*\}/,
  `hintText: \`Kurangkan angka pencilan \${outlier.name} (\${outlier.time} jam) dengan \${secondHighest.name} (\${secondHighest.time} jam). Rumus: \${outlier.time} − \${secondHighest.time}.\`,
      explanation: \`Tepat sekali! Selisihnya \${targetVal} jam. Nilai \${outlier.time} jam yang melonjak sangat jauh dari kelompok data ini disebut Pencilan (Outlier).\`,
    }`
);

// F. Update WaliKelasModal state & handleSelectOption
const oldStateBlock = `  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [shake, setShake] = useState<number>(0)

  const handleSelectOption = useCallback((choice: number) => {
    if (!quiz || isCorrect === true) return
    setSelectedAnswer(choice)

    if (choice === quiz.correctAnswer) {
      setIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setIsCorrect(false)
      setShake(prev => prev + 1)
      gameAudio.playError()
    }
  }, [quiz, isCorrect])`;

const newStateBlock = `  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [shake, setShake] = useState<number>(0)
  const [currentOptions, setCurrentOptions] = useState<number[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)
  const [wrongAttempts, setWrongAttempts] = useState<number>(0)

  // Initialize and reshuffle options when quiz loads
  useEffect(() => {
    if (quiz) {
      setCurrentOptions([...quiz.options].sort(() => Math.random() - 0.5))
      setSelectedAnswer(null)
      setIsCorrect(null)
      setIsLocked(false)
      setCooldownRemaining(0)
      setWrongAttempts(0)
    }
  }, [quiz])

  const handleSelectOption = useCallback((choice: number) => {
    if (!quiz || isCorrect === true || isLocked) return
    setSelectedAnswer(choice)

    if (choice === quiz.correctAnswer) {
      setIsCorrect(true)
      setIsLocked(false)
      gameAudio.playSuccess()
    } else {
      setIsCorrect(false)
      setIsLocked(true)
      setShake(prev => prev + 1)
      setWrongAttempts(prev => prev + 1)
      gameAudio.playError()

      // Anti-spam 2-second cooldown penalty
      setCooldownRemaining(2)
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsLocked(false)
            // Reshuffle options so the player cannot blindly click the same spot or in order
            setCurrentOptions(opts => [...opts].sort(() => Math.random() - 0.5))
            setSelectedAnswer(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [quiz, isCorrect, isLocked])`;

waliContent = waliContent.replace(oldStateBlock, newStateBlock);

// G. Update options grid and feedback
const oldOptionsGrid = `{/* Options Grid (4 Pilihan Ganda) */}
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
            {quiz.options.map(opt => {
              const isSelected = selectedAnswer === opt
              const isSelectedCorrect = isSelected && isCorrect === true
              const isSelectedWrong = isSelected && isCorrect === false
              return (
                <button
                  key={opt}
                  data-testid={\`wali-quiz-option-\${opt}\`}
                  disabled={isCorrect === true}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: 'clamp(7px, 1vh, 11px) 4px',
                    borderRadius: '8px',
                    fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                    fontWeight: 900,
                    cursor: isCorrect === true ? 'default' : 'pointer',
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

          {/* Feedback & Penjelasan */}
          <AnimatePresence>
            {isCorrect === false && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: 'clamp(5px, 0.7vh, 8px) clamp(8px, 1vw, 12px)',
                  fontSize: 'clamp(9.5px, 1.1vw, 11.5px)',
                  color: '#FECACA',
                  fontWeight: 800,
                }}
              >
                ❌ Jawabanmu kurang tepat! Amati kembali baris angka pada tabel data di atas.
              </motion.div>
            )}`;

const newOptionsGrid = `{/* Options Grid (4 Pilihan Ganda) dengan Anti-Spam Protection */}
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

          {/* Cooldown Timer Bar when Locked (Anti-Spam) */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 9px) 12px',
                  color: '#FECACA',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  fontWeight: 800,
                }}
              >
                <span>⏳ Waktu berpikir: <strong style={{ color: '#FCD34D', fontSize: '13px' }}>{cooldownRemaining}s</strong></span>
                <span style={{ color: '#FEF3C7', opacity: 0.9 }}>• Perhatikan data dengan cermat sebelum menjawab!</span>
              </motion.div>
            )}

            {isCorrect === false && !isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 9px) clamp(8px, 1vw, 12px)',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#FECACA',
                  fontWeight: 800,
                }}
              >
                <div>❌ Jawabanmu sebelumnya kurang tepat!</div>
                <div style={{ marginTop: '3px', color: '#FDE047', fontWeight: 700 }}>
                  💡 {quiz.hintText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>`;

waliContent = waliContent.replace(oldOptionsGrid, newOptionsGrid);

fs.writeFileSync(waliModalFile, waliContent, 'utf8');
console.log('SUCCESS: WaliKelasModal.tsx updated with unique questions & anti-spam cooldown!');

// 2. UPDATE QuizModal.tsx
const quizModalFile = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/modals/QuizModal.tsx';
let quizContent = fs.readFileSync(quizModalFile, 'utf8');

const oldQuizState = `  const [shake, setShake] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [choices, setChoices] = useState<(number | string)[]>([])
  const [placedChoice, setPlacedChoice] = useState<number | string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    if (door.choices) {
      setChoices([...door.choices].sort(() => Math.random() - 0.5))
    } else {
      setChoices(generateAnswerPool(Number(door.quizA)))
    }
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setWrongCount(0)
  }, [door])

  const handlePlaceAnswer = (val: number | string) => {
    if (val === door.quizA) {
      setPlacedChoice(val)
      setIsCorrect(true)
      setIsWrong(false)
    } else {
      setPlacedChoice(val)
      setIsWrong(true)
      setIsCorrect(false)
      setShake(k => k + 1)
      setWrongCount(prev => prev + 1)
      setTimeout(() => {
        setPlacedChoice(null)
        setIsWrong(false)
      }, 800)
    }
  }`;

const newQuizState = `  const [shake, setShake] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [choices, setChoices] = useState<(number | string)[]>([])
  const [placedChoice, setPlacedChoice] = useState<number | string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    if (door.choices) {
      setChoices([...door.choices].sort(() => Math.random() - 0.5))
    } else {
      setChoices(generateAnswerPool(Number(door.quizA)))
    }
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setIsLocked(false)
    setCooldownRemaining(0)
    setWrongCount(0)
  }, [door])

  const handlePlaceAnswer = (val: number | string) => {
    if (isLocked || isCorrect) return
    if (val === door.quizA) {
      setPlacedChoice(val)
      setIsCorrect(true)
      setIsWrong(false)
      setIsLocked(false)
    } else {
      setPlacedChoice(val)
      setIsWrong(true)
      setIsCorrect(false)
      setIsLocked(true)
      setShake(k => k + 1)
      setWrongCount(prev => prev + 1)

      // Anti-spam 2-second cooldown penalty
      setCooldownRemaining(2)
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsLocked(false)
            setPlacedChoice(null)
            setIsWrong(false)
            // Reshuffle choices
            if (door.choices) {
              setChoices([...door.choices].sort(() => Math.random() - 0.5))
            } else {
              setChoices(generateAnswerPool(Number(door.quizA)))
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }`;

quizContent = quizContent.replace(oldQuizState, newQuizState);

// Update Choice Selection Grid in QuizModal
quizContent = quizContent.replace(
  /<button\s*key=\{idx\}\s*onClick=\{\(\) => handlePlaceAnswer\(c\)\}/,
  `<button
                  key={idx}
                  disabled={isCorrect || isLocked}
                  onClick={() => handlePlaceAnswer(c)}`
);

quizContent = quizContent.replace(
  /cursor:\s*'pointer',/,
  `cursor: (isCorrect || isLocked) ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.6 : 1,`
);

// Add Cooldown Bar in QuizModal above action footer
quizContent = quizContent.replace(
  /\{\/\*\s*Action Footer\s*\*\/\}/,
  `{/* Cooldown Timer Bar when Locked (Anti-Spam) */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#FECACA',
                  fontSize: '12px',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              >
                <span>⏳ Waktu berpikir: <strong style={{ color: '#FCD34D' }}>{cooldownRemaining}s</strong></span>
                <span style={{ color: '#FEF3C7', opacity: 0.9 }}>• Hitung kembali dengan teliti!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}`
);

fs.writeFileSync(quizModalFile, quizContent, 'utf8');
console.log('SUCCESS: QuizModal.tsx updated with anti-spam cooldown!');
