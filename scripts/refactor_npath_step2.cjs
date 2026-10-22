const fs = require('fs');
const path = require('path');

const npathFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
const content = fs.readFileSync(npathFile, 'utf-8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.startsWith('// Helper to generate choice pool for answers'));
const endIndex = lines.findIndex(l => l.startsWith('export default function NPath('));

console.log('Replacing from line', startIndex + 1, 'to line', endIndex);

const part1 = lines.slice(0, startIndex);
const part2 = lines.slice(endIndex);

const newLines = [
  ...part1,
  "import CounterResult from '@/app/siswa/game/_levels/level1/components/modals/CounterResult'",
  "",
  ...part2
];

fs.writeFileSync(npathFile, newLines.join('\n'), 'utf-8');
console.log('Step 2 complete! Old lines:', lines.length, '-> New lines:', newLines.length);
console.log('Further reduced by:', lines.length - newLines.length, 'lines!');
