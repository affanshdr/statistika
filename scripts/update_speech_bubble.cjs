const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'siswa', 'game', '_levels', 'level1', 'components', 'NPath.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Remove old speech bubbles from room-objects
const startTag = "                      {/* 2. Teacher Animation Waiting Stage ('anim_wait') */}";
const startIdx = c.indexOf(startTag);
const endTagLiteral = '                      })()}\n                    </g>';
const endIdx = c.indexOf(endTagLiteral);

if (startIdx === -1 || endIdx === -1) {
  console.error('Error finding old speech bubble block!', { startIdx, endIdx });
  process.exit(1);
}

const replacementOld = "                      {/* (Classroom dialogue speech bubbles rendered in top-level Dialogue Overlay Layer below for correct z-index) */}";
c = c.slice(0, startIdx) + replacementOld + '\n' + c.slice(endIdx + '                      })()}'.length);

console.log('Step 1 complete (old bubbles removed). Current length:', c.length);

// 2. Insert new unified speech bubbles before </AnimatePresence>
const targetMarker = '📦 [ E ] Buka Kardus & Selamatkan Mochi!\n                              </text>\n                            </motion.g>\n                          )\n                        })()}';
const markerIdx = c.indexOf(targetMarker);
if (markerIdx === -1) {
  console.error('Error finding targetMarker!');
  process.exit(1);
}

const insertPos = markerIdx + targetMarker.length;

const newBubbleBlock = `

                        {/* 1B. Unified Comic Speech Bubble (Cutscenes for Teacher & Player inside Classroom) */}
                        {insideRoom && teacherCutsceneStage && (() => {
                          const currentMap = LEVEL1_MAPS[insideRoom.id]
                          const teacherConfig = currentMap?.teacher
                          const teacherX = teacherConfig?.x ?? 617
                          const teacherY = teacherConfig?.y ?? 415
                          const teacherName = currentClassStudents[insideRoom.id]?.teacher || teacherConfig?.name || 'Wali Kelas'
                          const classStudentCount = currentClassStudents[insideRoom.id]?.students?.length || 0

                          // Accurate visual head position of the Teacher
                          const teacherAspect = (teacherConfig as any)?.aspectRatio ?? (teacherConfig?.cols === 1 && teacherConfig?.rows === 1 ? 2.0 : 1)
                          const teacherHeight = teacherConfig?.size ? (teacherConfig.size * teacherAspect) : 160
                          // NPCCharacter renders with posY = teacherY - teacherHeight * 0.85
                          // Visual top of head is ~78% of height above feet
                          const teacherHeadTop = teacherConfig?.spriteUrl
                            ? (teacherConfig.cols === 1 && teacherConfig.rows === 1 ? teacherY - teacherHeight * 0.78 : teacherY - (teacherConfig.size || 160) * 0.78)
                            : teacherY - 60

                          // Accurate visual head position of the Player (Stevunt)
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const playerHeadX = charPos.x

                          const isPlayerSpeaking = teacherCutsceneStage === 'player_explain'
                          const speakerX = isPlayerSpeaking ? playerHeadX : teacherX
                          const speakerHeadTop = isPlayerSpeaking ? playerHeadTop : teacherHeadTop

                          // Bubble dimensions based on content
                          let bW = 380
                          let bH = 88
                          let borderColor = '#F59E0B'
                          let speakerTitle = ''
                          let speakerBadgeColor = '#FDE047'
                          let dialogueText: React.ReactNode = null
                          let actionText = '[ Klik / Spasi ▶ ]'
                          let actionColor = '#FBBF24'

                          if (teacherCutsceneStage === 'anim_wait') {
                            bW = 240
                            bH = 46
                            speakerTitle = \`\${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}\${teacherName}\`
                            dialogueText = <span style={{ color: '#FDE68A', fontWeight: 800 }}>Sedang menyapa...</span>
                            actionText = '...'
                          } else if (teacherCutsceneStage === 'teacher_ask') {
                            bW = 380
                            bH = 90
                            speakerTitle = \`\${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}\${teacherName}\`
                            speakerBadgeColor = '#FDE047'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>"Stevunt! Bagaimana perkembangan tugasmu?"</span>
                                  <br />
                                  "Apakah 24 sampel data screen time dari 4 kelas sudah siap?"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#F87171', fontWeight: 900 }}>"LOH?! \${playerName.toUpperCase()}?! Kamu kan murid kelas ini!"</span>
                                  <br />
                                  "Kenapa jam pelajaran malah keluyuran di luar?!"
                                </>
                              )
                            } else {
                              dialogueText = \`"Halo! Ada perlu apa kamu datang ke \${insideRoom.label}?"\`
                            }
                          } else if (teacherCutsceneStage === 'player_explain') {
                            bW = 400
                            bH = 92
                            speakerTitle = \`🎒 Kamu (\${playerName})\`
                            speakerBadgeColor = '#38BDF8'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  "Sudah lengkap, Pak Sutrisno! Seluruh 24 data sampel"
                                  <br />
                                  "screen time dari Kelas VII-A, VII-B, VIII-A, dan VIII-B sudah saya kumpulkan!"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "A-ampun Pak Bambang! Saya tadi kena sanksi Pak Sutrisno"
                                  <br />
                                  "untuk ngumpulin 24 data screen time sekolah, Pak!"
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  "Saya sedang menjalankan tugas sanksi Pak Sutrisno untuk"
                                  <br />
                                  {\`mengumpulkan sampel data \${classStudentCount} siswa di kelas ini!\`}
                                </>
                              )
                            }
                          } else if (teacherCutsceneStage === 'teacher_reply') {
                            bW = 390
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = \`\${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}\${teacherName}\`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ▶ ]' : '[ Ambil Data ▶ ]'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>"Kerja luar biasa, Stevunt!"</span>
                                  <br />
                                  "Mari kita olah seluruh data ini di Papan Analisis untuk memeriksa klaim viral tersebut!"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                  <br />
                                  <span style={{ color: '#93C5FD', fontWeight: 800 }}>"Pelajari dengan teliti untuk bahan analisismu nanti ya!"</span>
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  "Oh begitu! Baiklah, ini sampel data"
                                  <br />
                                  {\`screen time \${classStudentCount} siswa dari \${insideRoom.label}.\`}
                                </>
                              )
                            }
                          }

                          // Anchor bubble cleanly centered horizontally above the speaker's head
                          const bX = Math.max(20, Math.min(WORLD_VW - bW - 20, speakerX - bW / 2))
                          const bBottomY = speakerHeadTop - 14
                          const bY = Math.max(16, bBottomY - bH)
                          const tailTipY = speakerHeadTop + 2

                          const bubblePath = getSpeechBubblePath(bX, bY, bW, bH, 14, speakerX, tailTipY, 22)

                          return (
                            <motion.g
                              key={\`room-cutscene-bubble-\${teacherCutsceneStage}-\${insideRoom.id}\`}
                              id={\`room-cutscene-bubble-\${teacherCutsceneStage}\`}
                              initial={{ opacity: 0, scale: 0.94, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.94, y: 5 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              style={{ cursor: 'pointer' }}
                              onClick={e => {
                                e.stopPropagation()
                                handleInteractTeacher(insideRoom)
                              }}
                            >
                              {/* 1. Single Seamless Comic Speech Bubble Shape (Body + Tail) */}
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 12px 30px rgba(0, 0, 0, 0.75))' }}
                              />

                              {/* 2. Text and Interactive Elements inside ForeignObject */}
                              <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
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
                              </foreignObject>
                            </motion.g>
                          )
                        })()}`;

c = c.slice(0, insertPos) + newBubbleBlock + c.slice(insertPos);

fs.writeFileSync(filePath, c, 'utf8');
console.log('Successfully updated NPath.tsx! New length:', c.length);
