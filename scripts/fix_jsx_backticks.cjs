const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
let c = fs.readFileSync(targetFile, 'utf-8');

c = c.replace(/>`"Kerja luar biasa, \${playerName}!"`</g, '>{`"Kerja luar biasa, ${playerName}!"`}<');
c = c.replace(/>`"Wah, terima kasih banyak ya \${playerName} sudah membantu Bapak!"`</g, '>{`"Wah, terima kasih banyak ya ${playerName} sudah membantu Bapak!"`}<');
c = c.replace(/>`"\${playerName}! Bagaimana perkembangan tugasmu\?"`</g, '>{`"${playerName}! Bagaimana perkembangan tugasmu?"`}<');

fs.writeFileSync(targetFile, c, 'utf-8');
console.log('Fixed backticks in JSX successfully!');
