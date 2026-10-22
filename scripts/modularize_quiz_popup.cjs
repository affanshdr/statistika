const fs = require('fs');
const path = require('path');

const npathFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/NPath.tsx');
const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/QuizPopup.tsx');

const content = fs.readFileSync(npathFile, 'utf-8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.startsWith('// Helper to generate choice pool for answers'));
const endIndex = lines.findIndex(l => l.includes('function CounterResult'));

console.log('QuizPopup starts at line:', startIndex + 1, 'and ends at line:', endIndex);

const popupLines = lines.slice(startIndex, endIndex);
// Export QuizPopup
const exportIndex = popupLines.findIndex(l => l.startsWith('function QuizPopup('));
if (exportIndex !== -1) {
  popupLines[exportIndex] = 'export default ' + popupLines[exportIndex];
}

const output = [
  "'use client'",
  "",
  "import React, { useState, useEffect } from 'react'",
  "import { motion, AnimatePresence } from 'framer-motion'",
  "import { QuizDoor } from '@/app/siswa/game/_levels/level1/data/level1Data'",
  "import { gameAudio } from '@/lib/utils/gameAudio'",
  "",
  ...popupLines
].join('\n');

fs.writeFileSync(targetFile, output, 'utf-8');
console.log('Successfully written QuizPopup.tsx! Total lines:', output.split('\n').length);
