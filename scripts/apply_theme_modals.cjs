const fs = require('fs');

function updateFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) return;
  const backup = filePath + '.theme.backup';
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(filePath, backup);
  }
  let content = fs.readFileSync(filePath, 'utf8');
  transforms.forEach(([from, to]) => {
    content = content.replaceAll(from, to);
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
}

// 1. WaliKelasModal.tsx
updateFile('app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx', [
  [
    "background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',",
    "background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',"
  ],
  [
    "border: '2.5px solid #8C6239',",
    "border: '2.5px solid #F59E0B',"
  ],
  [
    "color: '#2C1A10',",
    "color: '#FEF3C7',"
  ],
  [
    "borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239'",
    "borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B'"
  ],
  [
    "borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239'",
    "borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B'"
  ],
  [
    "background: '#FFFDF7',\n              border: '1.5px solid #8C6239',\n              borderRadius: '999px',\n              padding: '3px 12px',\n              fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',\n              fontWeight: 900,\n              color: '#362014',",
    "background: 'rgba(255, 255, 255, 0.08)',\n              border: '1.5px solid #F59E0B',\n              borderRadius: '999px',\n              padding: '3px 12px',\n              fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',\n              fontWeight: 900,\n              color: '#FEF3C7',"
  ],
  [
    "border: '1.5px solid #8C6239',",
    "border: '1.5px solid #F59E0B',"
  ]
]);

// 2. CatQuestModal.tsx
updateFile('app/siswa/game/_levels/level1/components/modals/CatQuestModal.tsx', [
  [
    "background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',",
    "background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',"
  ],
  [
    "border: '2.5px solid #8C6239',",
    "border: '2.5px solid #F59E0B',"
  ],
  [
    "color: '#362014',",
    "color: '#FEF3C7',"
  ],
  [
    "borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239'",
    "borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B'"
  ],
  [
    "borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239'",
    "borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B'"
  ],
  [
    "background: '#FFFDF7',\n            border: isReward ? '2px solid #059669' : '2px solid #8C6239',",
    "background: 'rgba(255, 255, 255, 0.08)',\n            border: isReward ? '2px solid #10B981' : '2px solid #F59E0B',"
  ],
  [
    "border: '2px solid #8C6239',",
    "border: '2px solid #F59E0B',"
  ]
]);

// 3. Cutscene.tsx
updateFile('app/siswa/game/_levels/level1/components/Cutscene.tsx', [
  [
    "background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',",
    "background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',"
  ],
  [
    "border: '2.5px solid #8C6239',",
    "border: '2.5px solid #F59E0B',"
  ],
  [
    "color: '#362014',",
    "color: '#FEF3C7',"
  ],
  [
    "borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239'",
    "borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B'"
  ],
  [
    "border: '1.5px solid #8C6239',",
    "border: '1.5px solid #F59E0B',"
  ]
]);

// 4. QuizModal.tsx
updateFile('app/siswa/game/_levels/level1/components/modals/QuizModal.tsx', [
  [
    "background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',",
    "background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',"
  ],
  [
    "border: '2.5px solid #8C6239',",
    "border: '2.5px solid #F59E0B',"
  ],
  [
    "border: '2px solid #8C6239',",
    "border: '2px solid #F59E0B',"
  ],
  [
    "color: '#362014',",
    "color: '#FEF3C7',"
  ],
  [
    "color: '#2C1A10',",
    "color: '#FEF3C7',"
  ],
  [
    "borderTop: '3px solid #8C6239'",
    "borderTop: '3px solid #F59E0B'"
  ],
  [
    "borderBottom: '3px solid #8C6239'",
    "borderBottom: '3px solid #F59E0B'"
  ]
]);

console.log('All modals updated successfully!');
