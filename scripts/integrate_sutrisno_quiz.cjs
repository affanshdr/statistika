const fs = require('fs');
const filePath = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
code = code.replace(/\r\n/g, '\n');

// 1. Insert SutrisnoClaimQuiz interface & generator after line 344
const targetQuizGen = `export type SatpamChatStage =`;
const quizGenCode = `export interface SutrisnoClaimQuiz {
  actualMean: number
  claimThreshold: number
  isClaimTrue: boolean
  questionText: string
  options: { label: string; text: string; isCorrect: boolean }[]
  explanation: string
}

export function generatePakSutrisnoClaimQuiz(dataset: number[]): SutrisnoClaimQuiz {
  const validData = dataset && dataset.length > 0 ? dataset : [3, 4, 5, 4, 5, 6, 4, 3, 5, 4, 4, 5, 4, 3, 5, 4, 5, 6, 3, 4, 5, 4, 5, 4]
  const sum = validData.reduce((a, b) => a + b, 0)
  const actualMean = Number((sum / validData.length).toFixed(1))

  // Pick random claim type: true (claim threshold < actualMean) or false (claim threshold > actualMean)
  const isClaimTrue = Math.random() < 0.5

  let claimThreshold = 0
  let correctText = ''
  let distractor1 = ''
  let distractor2 = ''
  let distractor3 = ''

  if (isClaimTrue) {
    const lowPool = [2.5, 2.8, 3.0, 3.2, 3.5].filter(v => v < actualMean)
    claimThreshold = lowPool[Math.floor(Math.random() * lowPool.length)] || 3.0
    correctText = \`Benar, karena rata-rata siswa (\${actualMean} jam) melebihi \${claimThreshold} jam/hari\`
    distractor1 = \`Salah, rata-rata siswa tidak mencapai \${claimThreshold} jam/hari\`
    distractor2 = \`Salah, karena kesimpulan rata-rata hanya berlaku untuk kelas VII saja\`
    distractor3 = \`Tidak dapat disimpulkan dari ukuran pemusatan data\`
  } else {
    const highPool = [6.0, 6.5, 7.0, 7.5, 8.0].filter(v => v > actualMean)
    claimThreshold = highPool[Math.floor(Math.random() * highPool.length)] || 7.0
    correctText = \`Salah, rata-rata siswa sebenarnya hanya \${actualMean} jam/hari\`
    distractor1 = \`Benar, rata-rata siswa terbukti lebih dari \${claimThreshold} jam/hari\`
    distractor2 = \`Benar, karena nilai modus siswa melebihi \${claimThreshold} jam/hari\`
    distractor3 = \`Tidak dapat disimpulkan dari ukuran pemusatan data\`
  }

  const rawOptions = [
    { text: correctText, isCorrect: true },
    { text: distractor1, isCorrect: false },
    { text: distractor2, isCorrect: false },
    { text: distractor3, isCorrect: false },
  ]

  for (let i = rawOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = rawOptions[i]
    rawOptions[i] = rawOptions[j]
    rawOptions[j] = temp
  }

  const labels = ['A', 'B', 'C', 'D']
  const options = rawOptions.map((opt, i) => ({
    label: labels[i],
    text: opt.text,
    isCorrect: opt.isCorrect,
  }))

  return {
    actualMean,
    claimThreshold,
    isClaimTrue,
    questionText: \`Dari rata-rata yang kamu dapat (\${actualMean} jam), apakah klaim bahwa rata-rata screen time siswa kita > \${claimThreshold} jam/hari itu benar?\`,
    options,
    explanation: isClaimTrue
      ? \`Rata-rata sebenarnya adalah \${actualMean} jam, sehingga klaim > \${claimThreshold} jam bernilai BENAR.\`
      : \`Rata-rata sebenarnya hanya \${actualMean} jam, sehingga klaim > \${claimThreshold} jam bernilai SALAH.\`,
  }
}

export type SatpamChatStage =`;

code = code.replace(targetQuizGen, quizGenCode);

// 2. Update teacherCutsceneStage type & add state hooks
const oldCutsceneType = `const [teacherCutsceneStage, setTeacherCutsceneStage] = useState<'anim_wait' | 'teacher_ask' | 'player_explain' | 'teacher_reply' | 'post_stevunt_report' | 'post_pak_thanks' | 'post_conclusion' | null>(null)`;
const newCutsceneType = `const [teacherCutsceneStage, setTeacherCutsceneStage] = useState<'anim_wait' | 'teacher_ask' | 'player_explain' | 'teacher_reply' | 'post_stevunt_report' | 'post_pak_thanks' | 'post_pak_quiz' | 'post_conclusion' | null>(null)
  const [sutrisnoQuiz, setSutrisnoQuiz] = useState<SutrisnoClaimQuiz | null>(null)
  const [sutrisnoQuizWrong, setSutrisnoQuizWrong] = useState(false)
  const [sutrisnoWrongCount, setSutrisnoWrongCount] = useState(0)`;

code = code.replace(oldCutsceneType, newCutsceneType);

// 3. Update handleInteractTeacher & add handleSelectSutrisnoQuizOption
const oldInteractTeacher = `    } else if (currentStage === 'post_stevunt_report') {
      gameAudio.playClick()
      setTeacherCutsceneStage('post_pak_thanks')
    } else if (currentStage === 'post_pak_thanks' || currentStage === 'post_conclusion') {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    }
  }, [])`;

const newInteractTeacher = `    } else if (currentStage === 'post_stevunt_report') {
      gameAudio.playClick()
      setTeacherCutsceneStage('post_pak_thanks')
    } else if (currentStage === 'post_pak_thanks') {
      gameAudio.playClick()
      // Generate randomized claim quiz from active dataset
      const quiz = generatePakSutrisnoClaimQuiz(activeDataset)
      setSutrisnoQuiz(quiz)
      setSutrisnoQuizWrong(false)
      setTeacherCutsceneStage('post_pak_quiz')
    } else if (currentStage === 'post_pak_quiz') {
      // During quiz stage, clicking bubble does not advance; student must click option button
      return
    } else if (currentStage === 'post_conclusion') {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    }
  }, [activeDataset])

  const handleSelectSutrisnoQuizOption = useCallback((isCorrect: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCorrect) {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    } else {
      gameAudio.playWrongBuzz()
      setSutrisnoQuizWrong(true)
      setSutrisnoWrongCount(prev => prev + 1)
      incrementMistake()
    }
  }, [sessionStartTime, incrementMistake])`;

code = code.replace(oldInteractTeacher, newInteractTeacher);

// 4. Update key listener to prevent skipping quiz on Enter/Space/E
const oldKeyListener = `        if (isClass || distToTeacher < 350 || teacherCutsceneStageRef.current) {
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }`;

const newKeyListener = `        if (isClass || distToTeacher < 350 || teacherCutsceneStageRef.current) {
          if (teacherCutsceneStageRef.current === 'post_pak_quiz') {
            return
          }
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }`;

code = code.replace(oldKeyListener, newKeyListener);

// 5. Update bubble dimensions and text in speech bubble renderer
const oldDialogueBranches = `                          } else if (teacherCutsceneStage === 'post_pak_thanks') {
                            bW = 425
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = \`👨‍🏫 Pak Sutrisno (Guru BK)\`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = '[ Selesai & Buka Hasil Misi 🏆 ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#34D399', fontWeight: 900 }}>"Wah, terima kasih banyak ya Stevunt sudah membantu Bapak!"</span>
                                <br />
                                "Hasil analisismu sangat rapi dan teliti. Kerja bagus sekali, Nak!"
                              </>
                            )
                          } else if (teacherCutsceneStage === 'post_conclusion') {`;

const newDialogueBranches = `                          } else if (teacherCutsceneStage === 'post_pak_thanks') {
                            bW = 430
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = \`👨‍🏫 Pak Sutrisno (Guru BK)\`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = '[ Mulai Kuis Evaluasi 🎯 ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#34D399', fontWeight: 900 }}>"Wah, terima kasih banyak ya Stevunt sudah membantu Bapak!"</span>
                                <br />
                                "Sebelum selesai, coba jawab satu pertanyaan evaluasi klaim ini ya."
                              </>
                            )
                          } else if (teacherCutsceneStage === 'post_pak_quiz' && sutrisnoQuiz) {
                            bW = 470
                            bH = sutrisnoQuizWrong ? 165 : 150
                            borderColor = sutrisnoQuizWrong ? '#EF4444' : '#F59E0B'
                            speakerTitle = \`👨‍🏫 Pak Sutrisno (Guru BK)\`
                            speakerBadgeColor = '#FDE047'
                          } else if (teacherCutsceneStage === 'post_conclusion') {`;

code = code.replace(oldDialogueBranches, newDialogueBranches);

// 6. Update bubble onClick & foreignObject contents for post_pak_quiz
const oldForeignObject = `<foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 14px 6px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                  pointerEvents: 'auto',
                                }}>
                                  <div style={{
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    color: speakerBadgeColor,
                                    fontFamily: 'var(--font-ui)',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}>
                                    {speakerTitle}
                                  </div>

                                  <div style={{
                                    fontSize: '10.8px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                    margin: '2px 0',
                                  }}>
                                    {dialogueText}
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{
                                      fontSize: '9.5px',
                                      fontWeight: 900,
                                      color: actionColor,
                                      fontFamily: 'var(--font-ui)',
                                      letterSpacing: '0.3px',
                                      background: 'rgba(0, 0, 0, 0.4)',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      border: \`1px solid \${actionColor}55\`,
                                    }}>
                                      {actionText}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>`;

const newForeignObject = `<foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                {teacherCutsceneStage === 'post_pak_quiz' && sutrisnoQuiz ? (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 6px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        👨‍🏫 Pak Sutrisno — Uji Klaim Rata-Rata
                                      </span>
                                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#FDE68A', fontFamily: 'var(--font-ui)' }}>
                                        Pilih A / B / C / D
                                      </span>
                                    </div>

                                    <div
                                      data-testid="sutrisno-quiz-question"
                                      style={{
                                        fontSize: '10.2px',
                                        fontWeight: 800,
                                        color: '#FEF3C7',
                                        fontFamily: 'var(--font-ui)',
                                        lineHeight: 1.32,
                                        margin: '2px 0',
                                        textAlign: 'left',
                                      }}
                                    >
                                      "{sutrisnoQuiz.questionText}"
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', pointerEvents: 'auto' }}>
                                      {sutrisnoQuiz.options.map((opt, idx) => (
                                        <button
                                          key={\`sutrisno-opt-\${idx}\`}
                                          data-testid={\`sutrisno-opt-\${idx}\`}
                                          onClick={(e) => handleSelectSutrisnoQuizOption(opt.isCorrect, e)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 7px',
                                            borderRadius: '7px',
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            border: '1.5px solid #F59E0B',
                                            color: '#FEF3C7',
                                            fontSize: '9px',
                                            fontWeight: 800,
                                            fontFamily: 'var(--font-ui)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            boxShadow: '0 1px 3px rgba(140, 98, 57, 0.1)',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)' }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
                                        >
                                          <span style={{
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '4px',
                                            background: '#F59E0B',
                                            border: '1px solid #FDE047',
                                            color: '#1F130B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8.5px',
                                            fontWeight: 900,
                                            flexShrink: 0,
                                          }}>
                                            {opt.label}
                                          </span>
                                          <span style={{ flex: 1, lineHeight: 1.2 }}>{opt.text}</span>
                                        </button>
                                      ))}
                                    </div>

                                    {sutrisnoQuizWrong && (
                                      <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#FCA5A5', textAlign: 'center', marginTop: '1px' }}>
                                        ⚠️ Kurang tepat! Bandingkan rata-rata \${sutrisnoQuiz.actualMean} jam dengan klaim &gt; \${sutrisnoQuiz.claimThreshold} jam ya.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 14px 6px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                  }}>
                                    <div style={{
                                      fontSize: '11px',
                                      fontWeight: 900,
                                      color: speakerBadgeColor,
                                      fontFamily: 'var(--font-ui)',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                    }}>
                                      {speakerTitle}
                                    </div>

                                    <div style={{
                                      fontSize: '10.8px',
                                      fontWeight: 800,
                                      color: '#FEF3C7',
                                      fontFamily: 'var(--font-ui)',
                                      textAlign: 'center',
                                      lineHeight: 1.35,
                                      textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                      margin: '2px 0',
                                    }}>
                                      {dialogueText}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <span style={{
                                        fontSize: '9.5px',
                                        fontWeight: 900,
                                        color: actionColor,
                                        fontFamily: 'var(--font-ui)',
                                        letterSpacing: '0.3px',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        border: \`1px solid \${actionColor}55\`,
                                      }}>
                                        {actionText}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </foreignObject>`;

code = code.replace(oldForeignObject, newForeignObject);

// 7. Bubble onClick guard for post_pak_quiz
const oldBubbleOnClick = `onClick={e => {
                                e.stopPropagation()
                                handleInteractTeacher(insideRoom)
                              }}`;
const newBubbleOnClick = `onClick={e => {
                                e.stopPropagation()
                                if (teacherCutsceneStage === 'post_pak_quiz') return
                                handleInteractTeacher(insideRoom)
                              }}`;

code = code.replace(oldBubbleOnClick, newBubbleOnClick);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully integrated Pak Sutrisno Claim Cloud Chat Quiz into NPath.tsx!');
