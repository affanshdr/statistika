const fs = require('fs');

const filePath = 'app/siswa/game/_levels/level1/components/NPath.tsx';
let code = fs.readFileSync(filePath, 'utf8');
const isCRLF = code.includes('\r\n');
if (isCRLF) {
  code = code.replace(/\r\n/g, '\n');
}

// 1. All modal container backgrounds
code = code.replaceAll(
  "background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',",
  "background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',"
);

// 2. Corner brackets in modals
code = code.replaceAll("borderTop: '3px solid #8C6239'", "borderTop: '3px solid #F59E0B'");
code = code.replaceAll("borderBottom: '3px solid #8C6239'", "borderBottom: '3px solid #F59E0B'");
code = code.replaceAll("borderLeft: '3px solid #8C6239'", "borderLeft: '3px solid #F59E0B'");
code = code.replaceAll("borderRight: '3px solid #8C6239'", "borderRight: '3px solid #F59E0B'");

// 3. Header border in modals
code = code.replaceAll("borderBottom: '1.5px solid rgba(140, 98, 57, 0.2)'", "borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)'");
code = code.replaceAll("borderBottom: '1.5px solid rgba(140, 98, 57, 0.25)'", "borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)'");

// 4. Modal inner content cards & icon boxes
code = code.replaceAll("background: '#FFFDF7', border: '2.5px solid #F59E0B'", "background: '#3D2419', border: '2.5px solid #F59E0B'");
code = code.replaceAll("background: '#FFFDF7',\n            border: '2.5px solid #F59E0B'", "background: '#3D2419',\n            border: '2.5px solid #F59E0B'");
code = code.replaceAll("background: '#FFFDF7',\n          border: '2.5px solid #F59E0B'", "background: '#3D2419',\n          border: '2.5px solid #F59E0B'");

code = code.replaceAll("background: '#FFFDF7', border: '1.5px solid #B48C50'", "background: 'rgba(255, 255, 255, 0.06)', border: '1.5px solid #F59E0B'");
code = code.replaceAll("background: '#FFFDF7',\n          border: '1.5px solid #B48C50'", "background: 'rgba(255, 255, 255, 0.06)',\n          border: '1.5px solid #F59E0B'");
code = code.replaceAll("background: '#FFFDF7', border: '1.5px solid #8C6239'", "background: 'rgba(255, 255, 255, 0.06)', border: '1.5px solid #F59E0B'");

// 5. Gateway marker
code = code.replaceAll(
  'fill="#FDF8EC"\n                        stroke={isMainLocked ? \'#B45309\' : \'#8C6239\'}',
  'fill="#2D1A12"\n                        stroke={isMainLocked ? \'#F59E0B\' : \'#F59E0B\'}'
);
code = code.replaceAll(
  'fill={isMainLocked ? \'#9A3412\' : \'#362014\'}\n                        fontSize={9.6}',
  'fill={isMainLocked ? \'#FBBF24\' : \'#FEF3C7\'}\n                        fontSize={9.6}'
);

// 6. Remaining dark texts in dialogue cards
code = code.replaceAll("color: '#362014', fontWeight: 600", "color: '#FEF3C7', fontWeight: 600");
code = code.replaceAll("color: '#362014', fontWeight: 900", "color: '#FDE047', fontWeight: 900");
code = code.replaceAll("color: '#6B4226'", "color: '#FEF3C7'");

if (isCRLF) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully finalized all modal & card themes in NPath.tsx!');
