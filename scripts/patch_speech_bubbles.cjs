const fs = require('fs');
const path = require('path');

const npathFile = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let content = fs.readFileSync(npathFile, 'utf8');

// 1. Replace bubbleY calculation
const oldBubbleY = `const isCompleted = unlocked.has(insideRoom.id)\r\n                  const bubbleY = teacherY - (teacherConfig?.spriteUrl ? 220 : 50)`;
const oldBubbleY_LF = `const isCompleted = unlocked.has(insideRoom.id)\n                  const bubbleY = teacherY - (teacherConfig?.spriteUrl ? 220 : 50)`;

const newBubbleY = `const isCompleted = unlocked.has(insideRoom.id)

                  // Computer Vision & Aspect Ratio accurate character head anchoring
                  const teacherHeight = teacherConfig?.size
                    ? (teacherConfig.size * ((teacherConfig as any).aspectRatio ?? (teacherConfig.cols === 1 ? 2.0 : 1)))
                    : 160
                  const teacherHeadY = teacherConfig?.spriteUrl
                    ? (teacherConfig.cols === 1 ? teacherY - teacherHeight * 0.85 : teacherY - (teacherConfig?.size ? teacherConfig.size * 0.65 : 160))
                    : teacherY - 60
                  const bubbleY = teacherHeadY - 4`;

if (content.includes(oldBubbleY)) {
  content = content.replace(oldBubbleY, newBubbleY);
  console.log('Replaced bubbleY (CRLF)');
} else if (content.includes(oldBubbleY_LF)) {
  content = content.replace(oldBubbleY_LF, newBubbleY);
  console.log('Replaced bubbleY (LF)');
} else {
  console.error('Could not find oldBubbleY!');
  process.exit(1);
}

// 2. Replace teacher_ask
const teacherAskRegex = /\{\/\*\s*3\.\s*Teacher Question Speech Bubble[\s\S]*?teacherCutsceneStage === 'teacher_ask'[\s\S]*?points=\{`\$\{teacherX - 8\},[\s\S]*?<\/g>\s*\)\s*\}\)\(\)\}/;

const newTeacherAsk = `{/* 3. Teacher Question Speech Bubble ('teacher_ask') - ANCHORED DIRECTLY TO TEACHER'S HEAD */}
                      {teacherCutsceneStage === 'teacher_ask' && (() => {
                        const bW = 340
                        const bH = 82
                        const bX = Math.max(20, Math.min(WORLD_VW - bW - 20, teacherX - bW / 2))
                        const bBottomY = teacherHeadY - 12
                        const bY = Math.max(16, bBottomY - bH)
                        const pointerX = Math.max(bX + 35, Math.min(bX + bW - 35, teacherX))
                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            {/* Seamless pointer tail connecting bubble base to teacher's head */}
                            <polygon
                              points={\`\${pointerX - 10},\${bY + bH - 1} \${pointerX + 10},\${bY + bH - 1} \${teacherX},\${teacherHeadY + 2}\`}
                              fill="#2D1A12"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            {/* Speech bubble container */}
                            <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible' }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 14px 6px 14px',
                                background: 'linear-gradient(145deg, rgba(45, 26, 18, 0.96) 0%, rgba(26, 13, 8, 0.98) 100%)',
                                border: '2.5px solid #F59E0B',
                                borderRadius: '14px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.65), inset 0 1px 2px rgba(251, 191, 36, 0.35)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                              }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                  {teacherName}
                                </div>
                                <div style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#FEF3C7',
                                  fontFamily: 'var(--font-ui)',
                                  textAlign: 'center',
                                  lineHeight: 1.35,
                                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                  margin: '2px 0',
                                }}>
                                  {insideRoom.id === 'RG' ? (
                                    <>
                                      <span style={{ color: '#34D399', fontWeight: 900 }}>"Stevunt! Bagaimana perkembangan tugasmu?"</span>
                                      <br />
                                      "Apakah 24 sampel data screen time dari 4 kelas sudah siap?"
                                    </>
                                  ) : insideRoom.id === 'A2' ? (
                                    <>
                                      <span style={{ color: '#9A3412', fontWeight: 900 }}>"LOH?! {playerName.toUpperCase()}?! Kamu kan murid kelas ini!"</span>
                                      <br />
                                      "Kenapa jam pelajaran malah keluyuran di luar?!"
                                    </>
                                  ) : (
                                    \`"Halo! Ada perlu apa kamu datang ke \${insideRoom.label}?"\`
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    [ Klik / Tap ▶ ]
                                  </span>
                                </div>
                              </div>
                            </foreignObject>
                            {/* Seam cover rect to blend box border with polygon tail */}
                            <rect
                              x={pointerX - 9}
                              y={bY + bH - 2}
                              width={18}
                              height={3}
                              fill="#2D1A12"
                            />
                          </g>
                        )
                      })()}`;

if (teacherAskRegex.test(content)) {
  content = content.replace(teacherAskRegex, newTeacherAsk);
  console.log('Replaced teacher_ask regex');
} else {
  console.error('Could not match teacherAskRegex!');
  process.exit(1);
}

// 3. Replace player_explain
const playerExplainRegex = /\{\/\*\s*4\.\s*Player Explanation Speech Bubble[\s\S]*?teacherCutsceneStage === 'player_explain'[\s\S]*?points=\{`\$\{pointerX - 10\},[\s\S]*?<\/g>\s*\)\s*\}\)\(\)\}/;

const newPlayerExplain = `{/* 4. Player Explanation Speech Bubble ('player_explain') - ANCHORED DIRECTLY TO STEVUNT'S HEAD */}
                      {teacherCutsceneStage === 'player_explain' && (() => {
                        const pW = 350
                        const pH = 84
                        // Stevunt visual head Y (character stands at charPos.x, charPos.y)
                        const playerHeadY = charPos.y - 170
                        const pBottomY = playerHeadY - 12
                        const pY = Math.max(16, pBottomY - pH)
                        const pLeft = Math.max(20, Math.min(WORLD_VW - pW - 20, charPos.x - pW / 2))
                        const pointerX = Math.max(pLeft + 35, Math.min(pLeft + pW - 35, charPos.x))
                        const classStudentCount = currentClassStudents[insideRoom.id]?.students?.length || 0

                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            {/* Seamless pointer tail connecting directly to player's head */}
                            <polygon
                              points={\`\${pointerX - 10},\${pY + pH - 1} \${pointerX + 10},\${pY + pH - 1} \${charPos.x},\${playerHeadY + 2}\`}
                              fill="#2D1A12"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            {/* Player speech bubble container */}
                            <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible' }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 14px 6px 14px',
                                background: 'linear-gradient(145deg, rgba(45, 26, 18, 0.96) 0%, rgba(26, 13, 8, 0.98) 100%)',
                                border: '2.5px solid #F59E0B',
                                borderRadius: '14px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.65), inset 0 1px 2px rgba(251, 191, 36, 0.35)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                              }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                  Kamu ({playerName})
                                </div>
                                <div style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#FEF3C7',
                                  fontFamily: 'var(--font-ui)',
                                  textAlign: 'center',
                                  lineHeight: 1.35,
                                  margin: '2px 0',
                                }}>
                                  {insideRoom.id === 'RG' ? (
                                    <>
                                      "Sudah lengkap, Pak Sutrisno! Seluruh 24 data sampel"
                                      <br />
                                      "screen time dari Kelas VII-A, VII-B, VIII-A, dan VIII-B sudah saya kumpulkan!"
                                    </>
                                  ) : insideRoom.id === 'A2' ? (
                                    <>
                                      "A-ampun Pak Bambang! Saya tadi kena sanksi Pak Sutrisno"
                                      <br />
                                      "untuk ngumpulin 24 data screen time sekolah, Pak!"
                                    </>
                                  ) : (
                                    <>
                                      "Saya sedang menjalankan tugas sanksi Pak Sutrisno untuk"
                                      <br />
                                      {\`mengumpulkan sampel data \${classStudentCount} siswa di kelas ini!\`}
                                    </>
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    [ Klik / Tap ▶ ]
                                  </span>
                                </div>
                              </div>
                            </foreignObject>
                            {/* Clean seam cover rect */}
                            <rect
                              x={pointerX - 9}
                              y={pY + pH - 2}
                              width={18}
                              height={3}
                              fill="#2D1A12"
                            />
                          </g>
                        )
                      })()}`;

if (playerExplainRegex.test(content)) {
  content = content.replace(playerExplainRegex, newPlayerExplain);
  console.log('Replaced player_explain regex');
} else {
  console.error('Could not match playerExplainRegex!');
  process.exit(1);
}

// 4. Replace teacher_reply
const teacherReplyRegex = /\{\/\*\s*5\.\s*Teacher Reply Speech Bubble[\s\S]*?teacherCutsceneStage === 'teacher_reply'[\s\S]*?points=\{`\$\{teacherX - 8\},[\s\S]*?<\/g>\s*\)\s*\}\)\(\)\}/;

const newTeacherReply = `{/* 5. Teacher Reply Speech Bubble ('teacher_reply') - ANCHORED DIRECTLY TO TEACHER'S HEAD */}
                      {teacherCutsceneStage === 'teacher_reply' && (() => {
                        const bW = 340
                        const bH = 96
                        const bX = Math.max(20, Math.min(WORLD_VW - bW - 20, teacherX - bW / 2))
                        const bBottomY = teacherHeadY - 12
                        const bY = Math.max(16, bBottomY - bH)
                        const pointerX = Math.max(bX + 35, Math.min(bX + bW - 35, teacherX))
                        const classStudentCount = CLASS_STUDENTS[insideRoom.id]?.students?.length || 0
                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            {/* Seamless pointer tail connecting directly to teacher's head */}
                            <polygon
                              points={\`\${pointerX - 10},\${bY + bH - 1} \${pointerX + 10},\${bY + bH - 1} \${teacherX},\${teacherHeadY + 2}\`}
                              fill="#2D1A12"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            {/* Teacher reply speech bubble */}
                            <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible' }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 14px 6px 14px',
                                background: 'linear-gradient(145deg, rgba(45, 26, 18, 0.96) 0%, rgba(26, 13, 8, 0.98) 100%)',
                                border: '2.5px solid #F59E0B',
                                borderRadius: '14px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.65), inset 0 1px 2px rgba(251, 191, 36, 0.35)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                              }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                  {teacherName}
                                </div>
                                <div style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#FEF3C7',
                                  fontFamily: 'var(--font-ui)',
                                  textAlign: 'center',
                                  lineHeight: 1.35,
                                  margin: '2px 0',
                                }}>
                                  {insideRoom.id === 'RG' ? (
                                    <>
                                      <span style={{ color: '#34D399', fontWeight: 900 }}>"Kerja luar biasa, Stevunt!"</span>
                                      <br />
                                      "Mari kita tempel dan olah data ini di Papan Analisis untuk memeriksa klaim viral tersebut!"
                                    </>
                                  ) : insideRoom.id === 'A2' ? (
                                    <>
                                      "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                      <br />
                                      <span style={{ color: '#9A3412', fontWeight: 800 }}>"Pelajari dengan teliti untuk bahan analisismu nanti ya!"</span>
                                    </>
                                  ) : (
                                    <>
                                      "Oh begitu! Baiklah, ini sampel data"
                                      <br />
                                      {\`screen time \${classStudentCount} siswa dari \${insideRoom.label}.\`}
                                    </>
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    {insideRoom.id === 'RG' ? '[ Buka Papan Analisis ▶ ]' : '[ Ambil Data ▶ ]'}
                                  </span>
                                </div>
                              </div>
                            </foreignObject>
                            {/* Seam cover rect */}
                            <rect
                              x={pointerX - 9}
                              y={bY + bH - 2}
                              width={18}
                              height={3}
                              fill="#2D1A12"
                            />
                          </g>
                        )
                      })()}`;

if (teacherReplyRegex.test(content)) {
  content = content.replace(teacherReplyRegex, newTeacherReply);
  console.log('Replaced teacher_reply regex');
} else {
  console.error('Could not match teacherReplyRegex!');
  process.exit(1);
}

fs.writeFileSync(npathFile, content, 'utf8');
console.log('SUCCESS: All speech bubbles are now seamlessly anchored to character heads!');
