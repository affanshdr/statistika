const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. Repair door loop pulse glow at lines 6300-6315
const brokenDoorGlow = `                        enterClassroom(door)
                      }}
                    >
                      ) : (
                          <circle cx={door.x} cy={door.y} r={14} fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth={1} />
                        )
                      ) : !isSaved && (!open || isJustCompleted) ? (`;

const fixedDoorGlow = `                        enterClassroom(door)
                      }}
                    >
                      {/* Interactive Pulse Radar Glow */}
                      {isRG ? (
                        isRGUnlocked ? (
                          <motion.circle
                            cx={door.x}
                            cy={door.y}
                            r={24}
                            fill="#10B98133"
                            animate={{ scale: [1, 1.45, 1], fill: ['#10B98133', '#10B98177', '#10B98133'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ) : (
                          <circle cx={door.x} cy={door.y} r={14} fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth={1} />
                        )
                      ) : !isSaved && (!open || isJustCompleted) ? (`;

if (code.includes(brokenDoorGlow)) {
  code = code.replace(brokenDoorGlow, fixedDoorGlow);
  console.log('✅ Repaired door loop JSX syntax');
} else {
  console.warn('⚠️ Could not match brokenDoorGlow exactly, checking loose...');
  // Regex search
  const regex = /enterClassroom\(door\)\s*\}\}\s*>\s*\)\s*:\s*\(\s*<circle cx=\{door\.x\} cy=\{door\.y\} r=\{14\}[\s\S]*?!\s*isSaved && \(!open \|\| isJustCompleted\)\s*\?\s*\(/m;
  if (regex.test(code)) {
    code = code.replace(regex, fixedDoorGlow);
    console.log('✅ Repaired door loop JSX syntax via regex');
  }
}

// 2. Remove the pulse radar glow specifically from Pak Joko (<motion.circle cx={930} ...)
const pakJokoRadar = `                      {/* Interactive Pulse Radar Glow */}
                      <motion.circle
                        cx={930}
                        cy={412}
                        r={24}
                        fill="rgba(245, 158, 11, 0.2)"
                        animate={{ scale: [1, 1.35, 1], fill: ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.4)', 'rgba(245, 158, 11, 0.15)'] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />`;

if (code.includes(pakJokoRadar)) {
  code = code.replace(pakJokoRadar, '');
  console.log('✅ Removed Pak Joko motion.circle radar glow');
} else {
  const pRegex = /<motion\.circle\s+cx=\{930\}[\s\S]*?\/>\s*/m;
  if (pRegex.test(code)) {
    code = code.replace(pRegex, '');
    console.log('✅ Removed Pak Joko motion.circle radar glow via regex');
  }
}

fs.writeFileSync(path, code, 'utf8');
console.log('🎉 Saved clean NPath.tsx!');
