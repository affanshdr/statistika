const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. Remove onClick, cursor: pointer, and pulse radar from pak-joko-npc
const targetPakJokoG = `<g
                    key="pak-joko-npc"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      resetMovement()
                      setGateBubbleStep(2)
                      gameAudio.playDoorOpen()
                      if (hasPassedSatpamQuizR.current) {
                        satpamChatStageR.current = 'pak_pass_2'
                        setSatpamChatStage('pak_pass_2')
                      } else {
                        satpamChatStageR.current = 'pak_stop_1'
                        setSatpamChatStage('pak_stop_1')
                      }
                    }}
                  >`;

const replacementPakJokoG = `<g
                    key="pak-joko-npc"
                    style={{ pointerEvents: 'none' }}
                  >`;

if (code.includes(targetPakJokoG)) {
  code = code.replace(targetPakJokoG, replacementPakJokoG);
  console.log('✅ Replaced pak-joko-npc <g> with non-interactive pointerEvents: none');
} else {
  // Try CRLF / loose replace
  const regex = /<g\s+key="pak-joko-npc"\s+style=\{\{\s*cursor:\s*'pointer'\s*\}\}\s+onClick=\{[\s\S]*?\}\s*>/m;
  if (regex.test(code)) {
    code = code.replace(regex, replacementPakJokoG);
    console.log('✅ Replaced pak-joko-npc <g> via regex');
  } else {
    console.warn('⚠️ Could not match pak-joko-npc <g>');
  }
}

// 1B. Remove interactive pulse radar glow if present
const pulseGlowRegex = /\{\/\*\s*Interactive Pulse Radar Glow\s*\*\/\}[\s\S]*?<motion\.circle[\s\S]*?\/>/m;
if (pulseGlowRegex.test(code)) {
  code = code.replace(pulseGlowRegex, '{/* Non-interactive guard post scenery */}');
  console.log('✅ Removed interactive pulse radar glow from Pak Joko');
}

// 2. Replace satpam prompt button near Pak Joko with Gate Entrance prompt button
const promptRegex = /\{\/\*\s*0B\.\s*Satpam Interaction Prompt Button[\s\S]*?Bicara dgn Pak Joko \(Satpam\)[\s\S]*?\}\)\(\)\}/m;
const newGatePrompt = `{/* 0B. Gate Entrance Prompt Button (Shown only when approaching open school gate) */}
                        {currentZone === 'gate' && !insideRoom && satpamChatStage === 'idle' && (() => {
                          const isNearGate = charPos.y <= 490 && charPos.x >= 450 && charPos.x <= 780
                          if (!isNearGate) return null

                          const buttonW = 200
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + viewVW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key="btn-gate-enter"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={attemptEnterSchoolFromGate}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                [ E ] 🏫 Masuk Gerbang Sekolah
                              </text>
                            </motion.g>
                          )
                        })()}`;

if (promptRegex.test(code)) {
  code = code.replace(promptRegex, newGatePrompt);
  console.log('✅ Replaced satpam proximity button with gate entrance button');
} else {
  console.warn('⚠️ Could not match satpam prompt button');
}

// 3. Remove isNearSatpam from keyboard listener
const keyNearSatpamRegex = /const isNearSatpam = Math\.hypot\(charPosRef\.current\.x - 930, charPosRef\.current\.y - 475\) < 115[\s\S]*?return\s*\}/m;
if (keyNearSatpamRegex.test(code)) {
  code = code.replace(keyNearSatpamRegex, '// Pak Joko is only triggered when attempting to enter the gate');
  console.log('✅ Removed isNearSatpam keyboard trigger');
}

// Ensure isNearGateOpening has good bounds
code = code.replace(
  'const isNearGateOpening = charPosRef.current.y <= 450 && charPosRef.current.x >= 480 && charPosRef.current.x <= 755',
  'const isNearGateOpening = charPosRef.current.y <= 490 && charPosRef.current.x >= 450 && charPosRef.current.x <= 780'
);

fs.writeFileSync(path, code, 'utf8');
console.log('🎉 Successfully updated NPath.tsx!');
