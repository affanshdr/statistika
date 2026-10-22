const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

const broken = `            <span>{isCorrect === true ? 'dY"' : 'dY"''}</span>
            <span>{isCorrect === true ? 'Simpan Data ke Misi z"</span>`;

const correct = `            <span>{isCorrect === true ? '📥' : '🔒'}</span>
            <span>{isCorrect === true ? 'Simpan Data ke Misi ➔' : 'Jawab Tantangan untuk Membuka Data'}</span>`;

// Replace using regex in case of encoding variation
content = content.replace(/<span>\{isCorrect === true \? 'dY[^<]*<\/span>\s*<span>\{isCorrect === true \? 'Simpan Data ke Misi[^<]*<\/span>/g, correct);

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Fixed button JSX in WaliKelasModal.tsx!');
