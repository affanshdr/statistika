const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let c = fs.readFileSync(file, 'utf-8');

const btnIdx = c.indexOf('btn-collect-wali-data');
const end = c.indexOf('</button>', btnIdx);
const spanIdx = c.indexOf('<span>', btnIdx);

const rep = `<span>{isCorrect === true ? '📥' : '🔒'}</span>
            <span>{isCorrect === true ? 'Simpan Data ke Misi ➔' : 'Jawab Tantangan untuk Membuka Data'}</span>
          `;

c = c.slice(0, spanIdx) + rep + c.slice(end);
fs.writeFileSync(file, c, 'utf-8');
console.log('Button patched successfully!');
