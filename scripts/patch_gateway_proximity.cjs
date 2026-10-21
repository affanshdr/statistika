const fs = require('fs');
const filePath = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const re = /const boxWidth = isMainLocked \? 336 : 290(\r?\n)(\r?\n)(\s*)return \(\r?\n(\s*)<g\r?\n(\s*)key=\{`gateway-\$\{currentZone\}`\}\r?\n\s*id=\{`gateway-\$\{currentZone\}`\}\r?\n\s*data-testid="gateway-marker"\r?\n\s*style=\{\{ cursor: 'pointer' \}\}\r?\n\s*onClick=\{currentZone === 'main' \? goToFacilityZone : goToMainZone\}\r?\n/;

const m = content.match(re);
if (!m) {
  console.error('Gateway marker block not found');
  process.exit(1);
}
const nl = m[1];
const retIndent = m[3];
const gIndent = m[4];
const propIndent = m[5];

const replacement = [
  `const boxWidth = isMainLocked ? 336 : 290`,
  `${retIndent}// Realistic interaction: marker is only a signpost until Stevunt walks near the bottom edge`,
  `${retIndent}const isNearGateway = charPos.y >= 590 && Math.abs(charPos.x - 625) < 220`,
  ``,
  `${retIndent}return (`,
  `${gIndent}<g`,
  `${propIndent}key={\`gateway-\${currentZone}\`}`,
  `${propIndent}id={\`gateway-\${currentZone}\`}`,
  `${propIndent}data-testid="gateway-marker"`,
  `${propIndent}data-near={isNearGateway ? 'true' : 'false'}`,
  `${propIndent}style={{`,
  `${propIndent}  cursor: isNearGateway ? 'pointer' : 'default',`,
  `${propIndent}  pointerEvents: isNearGateway ? 'auto' : 'none',`,
  `${propIndent}  opacity: isNearGateway ? 1 : 0.7,`,
  `${propIndent}  transition: 'opacity 0.25s ease',`,
  `${propIndent}}}`,
  `${propIndent}onClick={isNearGateway ? (currentZone === 'main' ? goToFacilityZone : goToMainZone) : undefined}`,
  ``,
].join(nl);

content = content.replace(re, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Gateway marker patched: proximity-only interaction.');
