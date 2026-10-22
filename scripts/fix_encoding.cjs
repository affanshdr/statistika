const fs = require('fs');
const path = require('path');

const npathFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
let content = fs.readFileSync(npathFile, 'utf-8');

// Find lines with speakerTitle
content = content.replace(
  /speakerTitle = `\$\{insideRoom\.id === 'LabKomputer' \? '[^']+' : '[^']+'\}\$\{teacherName\}`/g,
  "speakerTitle = `${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}${teacherName}`"
);

// Fix actionText arrows
content = content.replace(
  /actionText = insideRoom\.id === 'RG' \? '\[ Buka Papan Analisis[^\]]+\]' : '\[ Buka Tantangan[^\]]+\]'/g,
  "actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ➔ ]' : '[ Buka Tantangan ➔ ]'"
);

fs.writeFileSync(npathFile, content, 'utf-8');
console.log('Successfully cleaned up speakerTitle and actionText in NPath.tsx!');
