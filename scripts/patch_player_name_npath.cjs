const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

// 1. Replace hardcoded "Stevunt!" / "Stevunt" in dialogues
content = content.replace(
  /"Stevunt! Bagaimana perkembangan tugasmu\?"/g,
  '`"${playerName}! Bagaimana perkembangan tugasmu?"`'
);

content = content.replace(
  /"Kerja luar biasa, Stevunt!"/g,
  '`"Kerja luar biasa, ${playerName}!"`'
);

content = content.replace(
  /"Wah, terima kasih banyak ya Stevunt sudah membantu Bapak!"/g,
  '`"Wah, terima kasih banyak ya ${playerName} sudah membantu Bapak!"`'
);

// 2. Fix speakerTitle for player
content = content.replace(
  /speakerTitle = `[^`]*Kamu \(\$\{playerName\}\)`/g,
  'speakerTitle = `🎒 ${playerName.toUpperCase()}`'
);

content = content.replace(
  /speakerTitle = `[^`]*Stevunt \(Detektif Siswa\)`/g,
  'speakerTitle = `🎒 ${playerName.toUpperCase()} (Detektif Siswa)`'
);

// 3. Fix corrupted teacher emojis and action arrows
content = content.replace(
  /speakerTitle = `\$\{insideRoom\.id === 'LabKomputer' \? '[^']+' : '[^']+'\}\$\{teacherName\}`/g,
  "speakerTitle = `${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}${teacherName}`"
);

content = content.replace(
  /speakerTitle = `[^`]*Pak Sutrisno \(Guru BK\)`/g,
  'speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`'
);

content = content.replace(
  /actionText = insideRoom\.id === 'RG' \? '\[ Buka Papan Analisis[^\]]+\]' : '\[ Buka Tantangan[^\]]+\]'/g,
  "actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ➔ ]' : '[ Buka Tantangan ➔ ]'"
);

content = content.replace(
  /actionText = '\[ Dengarkan Pak Sutrisno[^\]]+\]'/g,
  "actionText = '[ Dengarkan Pak Sutrisno ➔ ]'"
);

content = content.replace(
  /actionText = '\[ Mulai Kuis Evaluasi[^\]]+\]'/g,
  "actionText = '[ Mulai Kuis Evaluasi ➔ ]'"
);

content = content.replace(
  /actionText = '\[ Selesaikan Investigasi[^\]]+\]'/g,
  "actionText = '[ Selesaikan Investigasi ➔ ]'"
);

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Successfully updated player names and titles in NPath.tsx!');
