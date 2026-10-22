const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

// Replace any corrupted strings in button and timer
content = content.replace(/<span>[^<]*Waktu berpikir:/g, '<span>⏳ Waktu berpikir:');
content = content.replace(/<span style=\{\{ color: '#FEF3C7', opacity: 0\.9 \}\}>[^<]*Perhatikan data/g, "<span style={{ color: '#FEF3C7', opacity: 0.9 }}>• Perhatikan data");
content = content.replace(/<div>[^<]*Jawabanmu sebelumnya kurang tepat!<\/div>/g, '<div>❌ Jawabanmu sebelumnya kurang tepat!</div>');
content = content.replace(/dY'/g, '💡');
content = content.replace(/dYZ%/g, '🎉');
content = content.replace(/\+\? Batal/g, '← Batal');
content = content.replace(/<span>\{isCorrect === true \? 'dY"' : 'dY"''\}<\/span>/g, "<span>{isCorrect === true ? '📥' : '🔒'}</span>");
content = content.replace(/Simpan Data ke Misi [^<]*/g, 'Simpan Data ke Misi ➔');

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Cleaned up Unicode symbols in WaliKelasModal.tsx!');
