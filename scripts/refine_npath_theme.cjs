const fs = require('fs');

const filePath = 'app/siswa/game/_levels/level1/components/NPath.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Gate Intro Bubble text and tail
content = content.replace(
  `                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#362014',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {bubbleText}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#0E8388', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {gateBubbleStep === 0 ? '[ Klik / Spasi ▶ ]' : '[ 🏃 Ayo Masuk! ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={\`\${charPos.x - 8},\${pY + pH} \${charPos.x + 8},\${pY + pH} \${charPos.x},\${btnY + 22}\`}
                                fill="#FFFDF7"
                                stroke="#8C6239"
                                strokeWidth={1.5}
                              />`,
  `                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                  }}>
                                    {bubbleText}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                      {gateBubbleStep === 0 ? '[ Klik / Spasi ▶ ]' : '[ 🏃 Ayo Masuk! ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={\`\${charPos.x - 8},\${pY + pH} \${charPos.x + 8},\${pY + pH} \${charPos.x},\${btnY + 22}\`}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                              />`
);

// 2. Satpam nametag badge (lines 6528-6550)
content = content.replace(
  `<rect
                            x={930 - 65}
                            y={475 - 164}
                            width={130}
                            height={22}
                            rx={11}
                            fill="#FFFDF7"
                            stroke={hasPassedSatpamQuiz ? '#059669' : '#8C6239'}
                            strokeWidth={1.5}
                            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                          />
                          <text
                            x={930}
                            y={475 - 149}
                            textAnchor="middle"
                            fill={hasPassedSatpamQuiz ? '#059669' : '#362014'}
                            fontSize={9.5}
                            fontWeight="900"
                            fontFamily="var(--font-ui)"
                          >`,
  `<rect
                            x={930 - 65}
                            y={475 - 164}
                            width={130}
                            height={22}
                            rx={11}
                            fill="linear-gradient(135deg, #2D1A12 0%, #1A0D08 100%)"
                            fill="#2D1A12"
                            stroke={hasPassedSatpamQuiz ? '#10B981' : '#F59E0B'}
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
                          />
                          <text
                            x={930}
                            y={475 - 149}
                            textAnchor="middle"
                            fill={hasPassedSatpamQuiz ? '#34D399' : '#FEF3C7'}
                            fontSize={9.5}
                            fontWeight="900"
                            fontFamily="var(--font-ui)"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                          >`
);

// 3. Quest Button HUD (lines 5475-5524)
content = content.replace(
  `background: n >= TOTAL_N 
              ? 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)' 
              : 'linear-gradient(180deg, #FDF8EC 0%, #F5E8C7 100%)',
            border: n >= TOTAL_N ? '2px solid #059669' : '2px solid #8C6239',`,
  `background: n >= TOTAL_N 
              ? 'linear-gradient(180deg, #064E3B 0%, #022C22 100%)' 
              : 'linear-gradient(180deg, #2D1A12 0%, #1A0D08 100%)',
            border: n >= TOTAL_N ? '2px solid #10B981' : '2px solid #F59E0B',`
);

// Fix duplicate color in Quest badge
content = content.replace(
  `color: n >= TOTAL_N ? '#FFFFFF' : '#1F130B',
              color: '#FFFFFF',`,
  `color: n >= TOTAL_N ? '#FFFFFF' : '#1F130B',`
);

// 4. Satpam Cloud Chat Bubbles (lines 7220-7305)
content = content.replace(
  `                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#362014',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    margin: '2px 0',
                                  }}>`,
  `                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 700,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    margin: '2px 0',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                  }}>`
);

content = content.replace(
  `<polygon
                                points={\`\${pointerBaseX - 8},\${bTop + bH} \${pointerBaseX + 8},\${bTop + bH} \${jokoX},\${jokoHeadTop + 12}\`}
                                fill="#FFFDF7"
                                stroke={borderColor}
                                strokeWidth={1.5}
                              />`,
  `<polygon
                                points={\`\${pointerBaseX - 8},\${bTop + bH} \${pointerBaseX + 8},\${bTop + bH} \${jokoX},\${jokoHeadTop + 12}\`}
                                fill="#2D1A12"
                                stroke={borderColor === '#059669' ? '#10B981' : borderColor === '#DC2626' ? '#EF4444' : '#F59E0B'}
                                strokeWidth={2}
                              />`
);

// 5. Satpam Quiz Cloud Bubble (lines 7350-7420)
content = content.replace(
  `                                  <div
                                    data-testid="satpam-quiz-question"
                                    style={{
                                      fontSize: '9.8px',
                                      fontWeight: 800,
                                      color: '#362014',
                                      fontFamily: 'var(--font-ui)',
                                      textAlign: 'center',
                                      lineHeight: 1.32,
                                      margin: '3px 0 5px 0',
                                    }}
                                  >`,
  `                                  <div
                                    data-testid="satpam-quiz-question"
                                    style={{
                                      fontSize: '9.8px',
                                      fontWeight: 700,
                                      color: '#FEF3C7',
                                      fontFamily: 'var(--font-ui)',
                                      textAlign: 'center',
                                      lineHeight: 1.32,
                                      margin: '3px 0 5px 0',
                                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                    }}
                                  >`
);

content = content.replace(
  `<polygon
                                points={\`\${pointerBaseX - 8},\${bTop + bH} \${pointerBaseX + 8},\${bTop + bH} \${jokoX},\${jokoHeadTop + 12}\`}
                                fill="#FFFDF7"
                                stroke="#8C6239"
                                strokeWidth={1.5}
                              />`,
  `<polygon
                                points={\`\${pointerBaseX - 8},\${bTop + bH} \${pointerBaseX + 8},\${bTop + bH} \${jokoX},\${jokoHeadTop + 12}\`}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                              />`
);

// 6. Player Reply Cloud Bubble (lines 7460-7495)
content = content.replace(
  `                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#362014',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {satpamChatStage === 'player_excuse_1'
                                      ? '"Eh, pagi Pak Joko! Ampun Pak, tadi alarm HP saya gak bunyi... Jangan dikunci dulu Pak gerbangnya!"'
                                      : '"Siap, terima kasih banyak Pak Joko! Saya lari masuk ke halaman sekarang!"'}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#0E8388', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {satpamChatStage === 'player_thanks' ? '[ 🏃 Masuk Gerbang ▶ ]' : '[ Klik / Tap ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={\`\${charPos.x - 8},\${pY + pH} \${charPos.x + 8},\${pY + pH} \${charPos.x},\${btnY + 22}\`}
                                fill="#FFFDF7"
                                stroke={borderColor}
                                strokeWidth={1.5}
                              />`,
  `                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 700,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                  }}>
                                    {satpamChatStage === 'player_excuse_1'
                                      ? '"Eh, pagi Pak Joko! Ampun Pak, tadi alarm HP saya gak bunyi... Jangan dikunci dulu Pak gerbangnya!"'
                                      : '"Siap, terima kasih banyak Pak Joko! Saya lari masuk ke halaman sekarang!"'}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                      {satpamChatStage === 'player_thanks' ? '[ 🏃 Masuk Gerbang ▶ ]' : '[ Klik / Tap ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={\`\${charPos.x - 8},\${pY + pH} \${charPos.x + 8},\${pY + pH} \${charPos.x},\${btnY + 22}\`}
                                fill="#2D1A12"
                                stroke={borderColor === '#059669' ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                              />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Precision replacements applied successfully to NPath.tsx!');
