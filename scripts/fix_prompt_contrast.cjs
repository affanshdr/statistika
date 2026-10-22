const fs = require('fs');
const path = require('path');

const npathFile = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let content = fs.readFileSync(npathFile, 'utf8');

// 1. Mother Cat Prompt:
// Replace dark stroke and dark text fill
const targetMotherCat = `                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#059669' : '#8C6239'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#059669' : '#362014'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >`;

const replaceMotherCat = `                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >`;

// 2. Kitten Rescue Prompt:
const targetKittenRescue = `                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#059669"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#059669"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >`;

const replaceKittenRescue = `                              <rect
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
                              >`;

// 3. Lab Terminal Prompt:
const targetLabTerminal = `<rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#2D1A12" stroke="#0284C7" strokeWidth={2} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#0284C7" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>`;

const replaceLabTerminal = `<rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#2D1A12" stroke="#38BDF8" strokeWidth={2} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#BAE6FD" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>`;

console.log('Replacing Mother Cat...');
if (content.includes(targetMotherCat)) {
  content = content.replace(targetMotherCat, replaceMotherCat);
  console.log('Mother Cat replaced successfully!');
} else {
  console.log('Target Mother Cat not found directly, checking partial...');
}

console.log('Replacing Kitten Rescue...');
if (content.includes(targetKittenRescue)) {
  content = content.replace(targetKittenRescue, replaceKittenRescue);
  console.log('Kitten Rescue replaced successfully!');
} else {
  console.log('Target Kitten Rescue not found directly...');
}

console.log('Replacing Lab Terminal...');
if (content.includes(targetLabTerminal)) {
  content = content.replace(targetLabTerminal, replaceLabTerminal);
  console.log('Lab Terminal replaced successfully!');
} else {
  console.log('Target Lab Terminal not found directly...');
}

fs.writeFileSync(npathFile, content, 'utf8');
console.log('Done!');
