const fs = require('fs');
const filePath = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let content = fs.readFileSync(filePath, 'utf8');
if (content.includes('__DEV_SET_POS__')) { console.log('already'); process.exit(0); }
const re = /(\(window as any\)\.__DEV_EXIT_ROOM__ = \(\) => \{\r?\n\s*handleExitClassroom\(\)\r?\n(\s*)\})/;
const m = content.match(re);
if (!m) { console.error('not found'); process.exit(1); }
const ind = m[2];
content = content.replace(re, `$1\r\n${ind}// Dev/test helper: teleport Stevunt to a world position\r\n${ind};(window as any).__DEV_SET_POS__ = (x: number, y: number) => {\r\n${ind}  const p = { x, y }\r\n${ind}  charPosRef.current = p\r\n${ind}  setCharPos(p)\r\n${ind}}`);
fs.writeFileSync(filePath, content, 'utf8');
console.log('dev hook added');
