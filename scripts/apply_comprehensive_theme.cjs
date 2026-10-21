const fs = require('fs');
const path = require('path');

function processFile(filePath, transformer) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  // Detect original line endings
  const isCRLF = original.includes('\r\n');
  const normalized = original.replace(/\r\n/g, '\n');
  
  const modified = transformer(normalized);
  
  const result = isCRLF ? modified.replace(/\n/g, '\r\n') : modified;
  if (result !== original) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`[UPDATED] ${filePath}`);
  } else {
    console.log(`[NO CHANGE] ${filePath}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. level/[id]/page.tsx (Kembali, Audio Toggle, Exit Confirm Modal)
// ─────────────────────────────────────────────────────────────────────────────
processFile('app/siswa/game/level/[id]/page.tsx', (content) => {
  // Update Kembali button
  content = content.replace(
    /style=\{\{[\s\S]*?background:\s*'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)',[\s\S]*?border:\s*'1\.5px solid #8C6239',[\s\S]*?color:\s*'#362014',[\s\S]*?\}\}/,
    `style={{
                background: 'linear-gradient(145deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)',
                backdropFilter: 'blur(12px)',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                color: '#FEF3C7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(4px, 0.6vw, 6px)',
                padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 14px)',
                fontSize: 'clamp(10.5px, 1.1vw, 12px)',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(251, 191, 36, 0.3)',
                transition: 'all 0.2s',
              }}`
  );

  content = content.replace(
    /e\.currentTarget\.style\.background = '#FFFDF7'[\s\S]*?e\.currentTarget\.style\.borderColor = '#6E4720'/,
    `e.currentTarget.style.background = '#3D2419'\n                e.currentTarget.style.borderColor = '#FBBF24'`
  );
  content = content.replace(
    /e\.currentTarget\.style\.background = 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)'[\s\S]*?e\.currentTarget\.style\.borderColor = '#8C6239'/,
    `e.currentTarget.style.background = 'linear-gradient(145deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)'\n                e.currentTarget.style.borderColor = '#F59E0B'`
  );
  content = content.replace(
    /<span style=\{\{ fontWeight: 900, color: '#8C6239' \}\}>←<\/span>/,
    `<span style={{ fontWeight: 900, color: '#FBBF24' }}>←</span>`
  );

  // Update Audio Toggle button
  content = content.replace(
    /background: isMuted \? '#FEE2E2' : 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)',[\s\S]*?border: `1\.5px solid \$\{isMuted \? '#EF4444' : '#8C6239'\}`,[\s\S]*?color: isMuted \? '#DC2626' : '#8C6239',/,
    `background: isMuted ? 'rgba(69, 10, 10, 0.9)' : 'linear-gradient(145deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)',
                backdropFilter: 'blur(12px)',
                border: \`2px solid \${isMuted ? '#EF4444' : '#F59E0B'}\`,
                color: isMuted ? '#FCA5A5' : '#FEF3C7',`
  );

  // Update Exit Confirm Modal
  content = content.replace(
    /background: 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)',\s*border: '2\.5px solid #8C6239',[\s\S]*?color: '#362014',/,
    `background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 25px rgba(251, 191, 36, 0.25)',
            borderRadius: '24px',
            padding: '28px 24px',
            textAlign: 'center',
            color: '#FEF3C7',`
  );

  content = content.replace(/solid #8C6239/g, 'solid #F59E0B');
  content = content.replace(/color: '#9A3412'/g, "color: '#FBBF24'");
  content = content.replace(/color: '#991B1B'/g, "color: '#FDE047'");
  content = content.replace(/color: '#362014'/g, "color: '#FEF3C7'");
  content = content.replace(
    /border: '1\.5px solid #8C6239',\s*background: '#F5E8C7',\s*color: '#6B4226',/,
    `border: '1.5px solid #F59E0B',
                  background: '#3D2419',
                  color: '#FEF3C7',`
  );

  return content;
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GameHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
processFile('app/siswa/game/_components/GameHeader.tsx', (content) => {
  content = content.replace(
    /background: 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)',\s*border: '2\.5px solid #8C6239',[\s\S]*?color: '#362014',/,
    `background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 25px rgba(251, 191, 36, 0.25)',
            borderRadius: '24px',
            padding: '28px 24px',
            textAlign: 'center',
            color: '#FEF3C7',`
  );
  content = content.replace(/solid #8C6239/g, 'solid #F59E0B');
  content = content.replace(/color: '#9A3412'/g, "color: '#FBBF24'");
  content = content.replace(/color: '#991B1B'/g, "color: '#FDE047'");
  content = content.replace(/color: '#362014'/g, "color: '#FEF3C7'");
  content = content.replace(
    /border: '1\.5px solid #8C6239',\s*background: '#F5E8C7',\s*color: '#6B4226',/,
    `border: '1.5px solid #F59E0B',
                  background: '#3D2419',
                  color: '#FEF3C7',`
  );
  return content;
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. NPath.tsx
// ─────────────────────────────────────────────────────────────────────────────
processFile('app/siswa/game/_levels/level1/components/NPath.tsx', (content) => {
  // A. Stevunt Gate Monologue Bubble:
  // Text color & prompt & tail
  content = content.replace(
    /color: '#362014',\s*fontFamily: 'var\(--font-ui\)',\s*textAlign: 'center',\s*lineHeight: 1\.35,/,
    `color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',`
  );

  content = content.replace(
    /<span style=\{\{ fontSize: '9px', fontWeight: 900, color: '#0E8388', fontFamily: 'var\(--font-ui\)', letterSpacing: '0\.3px' \}\}>\s*\{gateBubbleStep === 0 \? '\[ Klik \/ Spasi ▶ \]' : '\[ 🏃 Ayo Masuk! ▶ \]'\}\s*<\/span>/,
    `<span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                      {gateBubbleStep === 0 ? '[ Klik / Spasi ▶ ]' : '[ 🏃 Ayo Masuk! ▶ ]'}
                                    </span>`
  );

  content = content.replace(
    /<polygon\s+points=\{`\$\{charPos\.x - 8\},\$\{pY \+ pH\} \$\{charPos\.x \+ 8\},\$\{pY \+ pH\} \$\{charPos\.x\},\$\{btnY \+ 22\}`\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{1\.5\}\s*\/>/,
    `<polygon
                                points={\`\${charPos.x - 8},\${pY + pH} \${charPos.x + 8},\${pY + pH} \${charPos.x},\${btnY + 22}\`}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                              />`
  );

  // B. Satpam Pak Joko Cloud Chat:
  content = content.replace(
    /satpamChatStage === 'pak_pass_1' \|\| satpamChatStage === 'pak_pass_2'\s*\?\s*'#059669'\s*:\s*'#8C6239'/,
    `satpamChatStage === 'pak_pass_1' || satpamChatStage === 'pak_pass_2'\n                            ? '#10B981'\n                            : '#F59E0B'`
  );

  // Satpam highlights in cloud chat
  content = content.replace(/<span style=\{\{ color: '#B45309' \}\}>/g, `<span style={{ color: '#FDE68A' }}>`);
  content = content.replace(/<span style=\{\{ color: '#0369A1' \}\}>/g, `<span style={{ color: '#7DD3FC' }}>`);
  content = content.replace(/<span style=\{\{ color: '#DC2626', fontWeight: 900 \}\}>/g, `<span style={{ color: '#F87171', fontWeight: 900 }}>`);
  content = content.replace(/<span style=\{\{ color: '#059669', fontWeight: 900 \}\}>/g, `<span style={{ color: '#34D399', fontWeight: 900 }}>`);
  content = content.replace(/color: '#0E8388', fontFamily: 'var\(--font-ui\)'/g, `color: '#FBBF24', fontFamily: 'var(--font-ui)'`);

  // Satpam cloud tail polygon
  content = content.replace(
    /<polygon\s+points=\{`\$\{pointerBaseX - 8\},\$\{bTop \+ bH\} \$\{pointerBaseX \+ 8\},\$\{bTop \+ bH\} \$\{jokoX\},\$\{jokoHeadTop \+ 12\}`\}\s+fill="#FFFDF7"\s+stroke=\{borderColor\}\s+strokeWidth=\{1\.5\}\s*\/>/,
    `<polygon
                                points={\`\${pointerBaseX - 8},\${bTop + bH} \${pointerBaseX + 8},\${bTop + bH} \${jokoX},\${jokoHeadTop + 12}\`}
                                fill="#2D1A12"
                                stroke={borderColor === '#8C6239' ? '#F59E0B' : borderColor}
                                strokeWidth={2}
                              />`
  );

  // C. Satpam Quiz Cloud:
  content = content.replace(/color: '#6B4226', fontFamily: 'var\(--font-ui\)'/, `color: '#FDE68A', fontFamily: 'var(--font-ui)'`);
  
  // Option buttons in satpam quiz
  content = content.replace(
    /background: '#FFFDF7',\s*border: '1\.2px solid #B48C50',\s*color: '#362014',/,
    `background: 'rgba(255, 255, 255, 0.08)',
                                          border: '1.5px solid #F59E0B',
                                          color: '#FEF3C7',`
  );
  content = content.replace(
    /background: '#FEF3C7',\s*border: '1px solid #8C6239',\s*color: '#9A3412',/,
    `background: '#F59E0B',
                                          border: '1px solid #FDE047',
                                          color: '#1F130B',`
  );
  content = content.replace(
    /<polygon\s+points=\{`\$\{pointerBaseX - 8\},\$\{bTop \+ bH\} \$\{pointerBaseX \+ 8\},\$\{bTop \+ bH\} \$\{jokoX\},\$\{jokoHeadTop \+ 12\}`\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{1\.5\}\s*\/>/,
    `<polygon
                                points={\`\${pointerBaseX - 8},\${bTop + bH} \${pointerBaseX + 8},\${bTop + bH} \${jokoX},\${jokoHeadTop + 12}\`}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                              />`
  );

  // D. Stevunt Reply Cloud to Satpam:
  content = content.replace(
    /const borderColor = satpamChatStage === 'player_thanks' \? '#059669' : '#8C6239'/,
    `const borderColor = satpamChatStage === 'player_thanks' ? '#10B981' : '#F59E0B'`
  );
  content = content.replace(
    /<polygon\s+points=\{`\$\{charPos\.x - 8\},\$\{pY \+ pH\} \$\{charPos\.x \+ 8\},\$\{pY \+ pH\} \$\{charPos\.x\},\$\{btnY \+ 22\}`\}\s+fill="#FFFDF7"\s+stroke=\{borderColor\}\s+strokeWidth=\{1\.5\}\s*\/>/,
    `<polygon
                                points={\`\${charPos.x - 8},\${pY + pH} \${charPos.x + 8},\${pY + pH} \${charPos.x},\${btnY + 22}\`}
                                fill="#2D1A12"
                                stroke={borderColor === '#8C6239' ? '#F59E0B' : borderColor}
                                strokeWidth={2}
                              />`
  );

  // E. Pak Joko Nametag Pill:
  content = content.replace(
    /<rect\s+x=\{930 - 65\}\s+y=\{475 - 164\}\s+width=\{130\}\s+height=\{22\}\s+rx=\{11\}\s+fill="#FFFDF7"\s+stroke=\{hasPassedSatpamQuiz \? '#059669' : '#8C6239'\}\s+strokeWidth=\{1\.5\}\s+style=\{\{ filter: 'drop-shadow\(0 2px 6px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>/,
    `<rect
                            x={930 - 65}
                            y={475 - 164}
                            width={130}
                            height={22}
                            rx={11}
                            fill="#2D1A12"
                            stroke={hasPassedSatpamQuiz ? '#10B981' : '#F59E0B'}
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
                          />`
  );
  content = content.replace(
    /fill=\{hasPassedSatpamQuiz \? '#059669' : '#362014'\}\s+fontSize=\{9\.5\}\s+fontWeight="900"\s+fontFamily="var\(--font-ui\)"\s*>\s*👮 Pak Joko \(Satpam\)/,
    `fill={hasPassedSatpamQuiz ? '#34D399' : '#FEF3C7'}
                            fontSize={9.5}
                            fontWeight="900"
                            fontFamily="var(--font-ui)"
                          >
                            👮 Pak Joko (Satpam)`
  );

  // F. Prompt Buttons [ E ]
  // Satpam Prompt Button:
  content = content.replace(
    /<rect\s+x=\{buttonLeft - 10\}\s+y=\{btnY\}\s+width=\{buttonW \+ 20\}\s+height=\{28\}\s+rx=\{6\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0px 3px 8px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{textX\}\s+y=\{btnTextY \+ 2\}\s+textAnchor="middle"\s+dominantBaseline="middle"\s+fill="#362014"\s+fontSize=\{10\.5\}/,
    `<rect
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
                                fontSize={10.5}`
  );

  // Classroom Door prompt:
  content = content.replace(
    /<rect\s+x=\{buttonLeft - 10\}\s+y=\{btnY\}\s+width=\{buttonW \+ 20\}\s+height=\{28\}\s+rx=\{6\}\s+fill="#FFFDF7"\s+stroke=\{isRG \? \(isRGUnlocked \? '#059669' : '#B45309'\) : isSaved \? '#059669' : '#8C6239'\}\s+strokeWidth=\{2\}/,
    `<rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}`
  );
  content = content.replace(
    /fill=\{isRG \? \(isRGUnlocked \? '#059669' : '#B45309'\) : isSaved \? '#059669' : '#362014'\}/,
    `fill={isRG ? (isRGUnlocked ? '#34D399' : '#FBBF24') : isSaved ? '#34D399' : '#FEF3C7'}`
  );

  // Facility door prompt:
  content = content.replace(
    /<rect\s+x=\{buttonLeft - 10\}\s+y=\{btnY\}\s+width=\{buttonW \+ 20\}\s+height=\{28\}\s+rx=\{6\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0px 3px 8px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{textX\}\s+y=\{btnTextY \+ 2\}\s+textAnchor="middle"\s+dominantBaseline="middle"\s+fill="#362014"/,
    `<rect
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
                                fill="#FEF3C7"`
  );

  // In-room talk prompt:
  content = content.replace(
    /<rect\s+x=\{buttonLeft\}\s+y=\{btnY\}\s+width=\{buttonW\}\s+height=\{26\}\s+rx=\{13\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0px 3px 8px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{textX\}\s+y=\{btnTextY\}\s+textAnchor="middle"\s+dominantBaseline="middle"\s+fill="#362014"/,
    `<rect
                                x={buttonLeft}
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"`
  );

  // Mother cat prompt:
  content = content.replace(
    /<rect\s+x=\{buttonLeft - 10\}\s+y=\{btnY\}\s+width=\{buttonW \+ 20\}\s+height=\{28\}\s+rx=\{6\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0px 3px 8px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{textX\}\s+y=\{btnTextY \+ 2\}\s+textAnchor="middle"\s+dominantBaseline="middle"\s+fill="#362014"/,
    `<rect
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
                                fill="#FEF3C7"`
  );

  // Cardboard kitten prompt:
  content = content.replace(
    /<rect\s+x=\{buttonLeft - 10\}\s+y=\{btnY\}\s+width=\{buttonW \+ 20\}\s+height=\{28\}\s+rx=\{6\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0px 3px 8px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{textX\}\s+y=\{btnTextY \+ 2\}\s+textAnchor="middle"\s+dominantBaseline="middle"\s+fill="#362014"/,
    `<rect
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
                                fill="#FEF3C7"`
  );

  // Zone transition prompt:
  content = content.replace(
    /<rect\s+x=\{buttonLeft - 10\}\s+y=\{btnY\}\s+width=\{buttonW \+ 20\}\s+height=\{28\}\s+rx=\{6\}\s+fill="#FFFDF7"\s+stroke="#8C6239"\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0px 3px 8px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{textX\}\s+y=\{btnTextY \+ 2\}\s+textAnchor="middle"\s+dominantBaseline="middle"\s+fill="#362014"/,
    `<rect
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
                                fill="#FEF3C7"`
  );

  // G. Teacher Nametag in classroom / Ruang Guru:
  content = content.replace(
    /<rect\s+x=\{teacherX - 90\}\s+y=\{bubbleY - 48\}\s+width=\{180\}\s+height=\{38\}\s+rx=\{8\}\s+fill="#FFFDF7"\s+stroke=\{isCompleted \? '#059669' : '#8C6239'\}\s+strokeWidth=\{2\}\s+style=\{\{ filter: 'drop-shadow\(0 4px 12px rgba\(140, 98, 57, 0\.35\)\)' \}\}\s*\/>\s*<polygon\s+points=\{`\$\{teacherX - 7\},\$\{bubbleY - 10\} \$\{teacherX \+ 7\},\$\{bubbleY - 10\} \$\{teacherX\},\$\{bubbleY\}`\}\s+fill="#FFFDF7"\s+stroke=\{isCompleted \? '#059669' : '#8C6239'\}\s+strokeWidth=\{2\}\s+strokeLinejoin="round"\s*\/>\s*<rect\s+x=\{teacherX - 8\}\s+y=\{bubbleY - 12\}\s+width=\{16\}\s+height=\{4\}\s+fill="#FFFDF7"\s*\/>\s*<text\s+x=\{teacherX\}\s+y=\{bubbleY - 34\}\s+textAnchor="middle"\s+fill="#362014"/,
    `<rect
                              x={teacherX - 90}
                              y={bubbleY - 48}
                              width={180}
                              height={38}
                              rx={8}
                              fill="#2D1A12"
                              stroke={isCompleted ? '#10B981' : '#F59E0B'}
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))' }}
                            />
                            <polygon
                              points={\`\${teacherX - 7},\${bubbleY - 10} \${teacherX + 7},\${bubbleY - 10} \${teacherX},\${bubbleY}\`}
                              fill="#2D1A12"
                              stroke={isCompleted ? '#10B981' : '#F59E0B'}
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            <rect
                              x={teacherX - 8}
                              y={bubbleY - 12}
                              width={16}
                              height={4}
                              fill="#2D1A12"
                            />
                            <text
                              x={teacherX}
                              y={bubbleY - 34}
                              textAnchor="middle"
                              fill="#FDE047"`
  );

  content = content.replace(
    /fill=\{isCompleted \? '#059669' : '#9A3412'\}\s+fontSize=\{9\}\s+fontWeight="800"\s+fontFamily="var\(--font-ui\)"/,
    `fill={isCompleted ? '#34D399' : '#FBBF24'}
                              fontSize={9}
                              fontWeight="800"
                              fontFamily="var(--font-ui)"`
  );

  // H. Mother cat nametag:
  content = content.replace(
    /<rect\s+x=\{motherCatPos\.x - 55\}\s+y=\{motherCatPos\.y - 82\}\s+width=\{110\}\s+height=\{20\}\s+rx=\{10\}\s+fill="#FFFDF7"\s+stroke=\{catQuestStage === 'completed' \? '#059669' : '#8C6239'\}\s+strokeWidth=\{1\.5\}\s+style=\{\{ filter: 'drop-shadow\(0 2px 6px rgba\(0,0,0,0\.25\)\)' \}\}\s*\/>\s*<text\s+x=\{motherCatPos\.x\}\s+y=\{motherCatPos\.y - 68\}\s+textAnchor="middle"\s+fill=\{catQuestStage === 'completed' \? '#059669' : '#362014'\}/,
    `<rect
                            x={motherCatPos.x - 55}
                            y={motherCatPos.y - 82}
                            width={110}
                            height={20}
                            rx={10}
                            fill="#2D1A12"
                            stroke={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
                          />
                          <text
                            x={motherCatPos.x}
                            y={motherCatPos.y - 68}
                            textAnchor="middle"
                            fill={catQuestStage === 'completed' ? '#34D399' : '#FEF3C7'}`
  );

  // I. Quest HUD Button on Right:
  content = content.replace(
    /background: n >= TOTAL_N \? 'linear-gradient\(180deg, #ECFDF5 0%, #D1FAE5 100%\)' : 'linear-gradient\(180deg, #FDF8EC 0%, #F5E8C7 100%\)',[\s\S]*?border: n >= TOTAL_N \? '2px solid #059669' : '2px solid #8C6239',/,
    `background: n >= TOTAL_N 
              ? 'linear-gradient(180deg, #064E3B 0%, #022C22 100%)' 
              : 'linear-gradient(180deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)',
            border: n >= TOTAL_N ? '2.5px solid #10B981' : '2.5px solid #F59E0B',`
  );

  content = content.replace(
    /boxShadow: n >= TOTAL_N \? '0 6px 20px rgba\(0, 0, 0, 0\.25\), 0 0 15px rgba\(16, 185, 129, 0\.25\)' : '0 6px 20px rgba\(0, 0, 0, 0\.4\), inset 0 1px 2px rgba\(251, 191, 36, 0\.25\)',/,
    `boxShadow: n >= TOTAL_N ? '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.35)' : '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.35)',`
  );

  // J. Quest Log Inventory Drawer Modal:
  content = content.replace(
    /background: 'linear-gradient\(180deg, #FDF8EC 0%, #F5E8C7 100%\)',\s*borderLeft: '3px solid #8C6239',[\s\S]*?color: '#362014',/,
    `background: 'linear-gradient(180deg, #2D1A12 0%, #1A0D08 100%)',
                borderLeft: '3px solid #F59E0B',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(251, 191, 36, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                gap: 16,
                overflowY: 'auto',
                color: '#FEF3C7',`
  );

  content = content.replace(
    /borderBottom: '1\.5px solid rgba\(140, 98, 57, 0\.25\)', paddingBottom: 14/,
    `borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14`
  );

  content = content.replace(
    /color: '#9A3412', letterSpacing: '2px', textTransform: 'uppercase'/g,
    `color: '#FBBF24', letterSpacing: '2px', textTransform: 'uppercase'`
  );
  content = content.replace(
    /h3 style=\{\{ margin: 0, fontSize: 18, fontWeight: 900, color: '#362014'/g,
    `h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FDE047'`
  );
  content = content.replace(
    /color: '#6B4226', borderRadius: '50%'/g,
    `color: '#FEF3C7', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', borderRadius: '50%'`
  );

  // Quest cards inside drawer
  content = content.replace(
    /background: '#FFFDF7',\s*border: '1\.5px solid #B48C50',/g,
    `background: 'rgba(255, 255, 255, 0.05)',\n                    border: '1.5px solid #F59E0B',`
  );
  content = content.replace(
    /color: '#5C3D1E'/g,
    `color: '#FEF3C7'`
  );
  content = content.replace(
    /color: '#362014'/g,
    `color: '#FEF3C7'`
  );

  // K. PakSanctionModal
  content = content.replace(
    /background: 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)',\s*border: '2\.5px solid #F59E0B',[\s\S]*?color: '#362014'/,
    `background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
          border: '2.5px solid #F59E0B',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 25px rgba(251, 191, 36, 0.25)',
          borderRadius: 24,
          padding: '26px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#FEF3C7'`
  );

  return content;
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Modals (WaliKelasModal, CatQuestModal, QuizModal)
// ─────────────────────────────────────────────────────────────────────────────
processFile('app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx', (content) => {
  content = content.replace(/solid #8C6239/g, 'solid #F59E0B');
  content = content.replace(/border: '2\.5px solid #8C6239'/g, "border: '2.5px solid #F59E0B'");
  content = content.replace(/background: 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)'/g, "background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)'");
  content = content.replace(/background: '#FFFDF7'/g, "background: 'rgba(255, 255, 255, 0.06)'");
  content = content.replace(/color: '#362014'/g, "color: '#FEF3C7'");
  content = content.replace(/color: '#9A3412'/g, "color: '#FBBF24'");
  content = content.replace(/color: '#6B4226'/g, "color: '#FEF3C7'");
  return content;
});

processFile('app/siswa/game/_levels/level1/components/modals/CatQuestModal.tsx', (content) => {
  content = content.replace(/solid #8C6239/g, 'solid #F59E0B');
  content = content.replace(/border: '2\.5px solid #8C6239'/g, "border: '2.5px solid #F59E0B'");
  content = content.replace(/background: 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)'/g, "background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)'");
  content = content.replace(/background: '#FFFDF7'/g, "background: 'rgba(255, 255, 255, 0.06)'");
  content = content.replace(/color: '#362014'/g, "color: '#FEF3C7'");
  content = content.replace(/color: '#9A3412'/g, "color: '#FBBF24'");
  content = content.replace(/color: '#6B4226'/g, "color: '#FEF3C7'");
  return content;
});

processFile('app/siswa/game/_levels/level1/components/modals/QuizModal.tsx', (content) => {
  content = content.replace(/solid #8C6239/g, 'solid #F59E0B');
  content = content.replace(/border: '2\.5px solid #8C6239'/g, "border: '2.5px solid #F59E0B'");
  content = content.replace(/background: 'linear-gradient\(135deg, #FDF8EC 0%, #F5E8C7 100%\)'/g, "background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)'");
  content = content.replace(/background: '#FFFDF7'/g, "background: 'rgba(255, 255, 255, 0.06)'");
  content = content.replace(/color: '#362014'/g, "color: '#FEF3C7'");
  content = content.replace(/color: '#9A3412'/g, "color: '#FBBF24'");
  content = content.replace(/color: '#6B4226'/g, "color: '#FEF3C7'");
  return content;
});

console.log('Finished comprehensive UI theme processing.');
