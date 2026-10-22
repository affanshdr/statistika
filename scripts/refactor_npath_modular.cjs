const fs = require('fs');
const path = require('path');

const npathFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
const content = fs.readFileSync(npathFile, 'utf-8');
const lines = content.split('\n');

// 1. Identify Sections to remove and replace
// Section A: Lines 58 (export interface FacilityDoor) to line 657 (end of getSpeechBubblePath)
const secAStart = lines.findIndex(l => l.startsWith('export interface FacilityDoor'));
const secAEnd = lines.findIndex(l => l.startsWith('// Helper to generate choice pool for answers'));

console.log('Section A (Facility, Quizzes, Joystick, BubblePath): line', secAStart + 1, 'to line', secAEnd);

// Section B: PakSanctionModal
const secBStart = lines.findIndex(l => l.includes('Pak Sutrisno Sanction Modal'));
const secBEnd = lines.findIndex(l => l.includes('Desk Calculator Component for Pak Sutrisno'));

console.log('Section B (PakSanctionModal): line', secBStart + 1, 'to line', secBEnd);

// Section C: Corkboard & PakReportModal
const secCStart = secBEnd;
const secCEnd = lines.findIndex(l => l.includes('MODAL POPUP MISI SELESAI'));

console.log('Section C (DeskCalc & PakReportModal): line', secCStart + 1, 'to line', secCEnd);

// Section D: MissionCompleteModal
const secDStart = secCEnd;
const secDEnd = lines.findIndex(l => l.startsWith('export default function NPath('));

console.log('Section D (MissionCompleteModal): line', secDStart + 1, 'to line', secDEnd);

// New Imports to inject at the top
const newImports = [
  "import { FacilityModal, LibraryBookModal, LabTerminalModal, FACILITY_DOORS, type FacilityDoor } from '@/app/siswa/game/_levels/level1/components/modals/FacilityModal'",
  "import { type SatpamTimeQuiz, SATPAM_WRONG_TEASES, generateSatpamTimeQuiz } from '@/app/siswa/game/_levels/level1/utils/satpamQuizGenerator'",
  "import { type SutrisnoClaimQuiz, generatePakSutrisnoClaimQuiz } from '@/app/siswa/game/_levels/level1/utils/sutrisnoQuizGenerator'",
  "import { getSpeechBubblePath } from '@/app/siswa/game/_levels/level1/utils/bubbleUtils'",
  "import Joystick from '@/app/siswa/game/_levels/level1/components/ui/Joystick'",
  "import PakSanctionModal from '@/app/siswa/game/_levels/level1/components/modals/PakSanctionModal'",
  "import PakReportModal from '@/app/siswa/game/_levels/level1/components/corkboard/PakReportModal'",
  "import MissionCompleteModal from '@/app/siswa/game/_levels/level1/components/modals/MissionCompleteModal'",
];

// Reassemble lines
const part1 = lines.slice(0, secAStart);
const part2 = lines.slice(secAEnd, secBStart);
const part3 = lines.slice(secDEnd);

const newLines = [
  ...part1,
  ...newImports,
  "",
  ...part2,
  ...part3
];

const newContent = newLines.join('\n');
fs.writeFileSync(npathFile, newContent, 'utf-8');
console.log('Refactoring NPath.tsx complete!');
console.log('Old line count:', lines.length);
console.log('New line count:', newLines.length);
console.log('Reduced by:', lines.length - newLines.length, 'lines!');
