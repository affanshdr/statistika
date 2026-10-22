const fs = require('fs');
const path = require('path');

const npathFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/corkboard/PakReportModal.tsx');

const content = fs.readFileSync(npathFile, 'utf-8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.startsWith('function PakReportModal({ dataset, onProceed }:'));
if (startIndex === -1) {
  console.error('Could not find start of PakReportModal');
  process.exit(1);
}

// Find end of PakReportModal (before MissionCompleteModal)
const endIndex = lines.findIndex((l, idx) => idx > startIndex && l.startsWith('// 🏆 MODAL POPUP MISI SELESAI') || l.includes('function MissionCompleteModal'));
if (endIndex === -1) {
  console.error('Could not find end of PakReportModal');
  process.exit(1);
}

// Exact closing brace of PakReportModal is right before MissionCompleteModal comments
let actualEnd = endIndex - 1;
while (actualEnd > startIndex && lines[actualEnd].trim() !== '}') {
  actualEnd--;
}

console.log('PakReportModal starts at line:', startIndex + 1, 'and ends at line:', actualEnd + 1);

// Find the tutorial modal block inside PakReportModal
const tutStart = lines.findIndex((l, idx) => idx >= startIndex && idx <= actualEnd && l.includes('{showTutorialModal && STAGE_TUTORIALS[stage] && ('));
const tutEnd = lines.findIndex((l, idx) => idx > tutStart && idx <= actualEnd && l.trim() === ')}' && lines[idx+1] && lines[idx+1].includes('</AnimatePresence>'));

console.log('Tutorial modal block inside PakReportModal:', tutStart + 1, 'to', tutEnd + 1);

const part1 = lines.slice(startIndex, tutStart);
part1[0] = 'export default function PakReportModal({ dataset, onProceed }: { dataset: number[]; onProceed: () => void }) {';

const part2 = [
  '        {showTutorialModal && STAGE_TUTORIALS[stage] && (',
  '          <StageTutorialModal stage={stage} onClose={handleCloseTutorial} />',
  '        )}'
];
const part3 = lines.slice(tutEnd + 1, actualEnd + 1);

const output = [
  "'use client'",
  "",
  "import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'",
  "import { motion, AnimatePresence } from 'framer-motion'",
  "import { gameAudio } from '@/lib/utils/gameAudio'",
  "import { useGameStore } from '@/lib/store/gameStore'",
  "import DeskCalculator from './DeskCalculator'",
  "import StageTutorialModal from './StageTutorialModal'",
  "import { SortToken, useFitGrid, STAGE_TUTORIALS } from './corkboardData'",
  "",
  ...part1,
  ...part2,
  ...part3
].join('\n');

fs.writeFileSync(targetFile, output, 'utf-8');
console.log('Successfully written PakReportModal.tsx! Total lines:', output.split('\n').length);
