const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. Remove interactive pulse radar glow
const radarRegex = /\{\/\*\s*Interactive Pulse Radar Glow\s*\*\/\}[\s\S]*?<motion\.circle[\s\S]*?\/>\s*/m;
if (radarRegex.test(code)) {
  code = code.replace(radarRegex, '');
  console.log('✅ Removed interactive pulse radar glow');
}

// 2. Remove floating nametag badge
const badgeRegex = /\{\/\*\s*Floating Nametag Badge[\s\S]*?👮 Pak Joko \(Satpam\)[\s\S]*?<\/text>\s*<\/>\s*\)\}/m;
if (badgeRegex.test(code)) {
  code = code.replace(badgeRegex, '');
  console.log('✅ Removed floating nametag badge above Pak Joko');
}

fs.writeFileSync(path, code, 'utf8');
console.log('🎉 Done updating Pak Joko elements!');
