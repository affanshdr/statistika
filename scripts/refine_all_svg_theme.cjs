const fs = require('fs');

const filePath = 'app/siswa/game/_levels/level1/components/NPath.tsx';
let code = fs.readFileSync(filePath, 'utf8');
const isCRLF = code.includes('\r\n');
if (isCRLF) {
  code = code.replace(/\r\n/g, '\n');
}

// 1. All polygons with fill="#FFFDF7"
code = code.replace(/<polygon([\s\S]*?)fill="#FFFDF7"([\s\S]*?)\/>/g, (match, before, after) => {
  // Replace stroke="#8C6239" with stroke="#F59E0B"
  let res = `<polygon${before}fill="#2D1A12"${after}/>`;
  res = res.replace(/stroke="#8C6239"/g, 'stroke="#F59E0B"');
  res = res.replace(/stroke=\{borderColor\}/g, "stroke={borderColor === '#8C6239' ? '#F59E0B' : borderColor}");
  return res;
});

// 2. All rects with fill="#FFFDF7" in interaction prompts and nametags
code = code.replace(/<rect([\s\S]*?)fill="#FFFDF7"([\s\S]*?)\/>/g, (match, before, after) => {
  let res = `<rect${before}fill="#2D1A12"${after}/>`;
  res = res.replace(/stroke="#8C6239"/g, 'stroke="#F59E0B"');
  res = res.replace(/stroke=\{hasPassedSatpamQuiz \? '#059669' : '#8C6239'\}/g, "stroke={hasPassedSatpamQuiz ? '#10B981' : '#F59E0B'}");
  res = res.replace(/stroke=\{isCompleted \? '#059669' : '#8C6239'\}/g, "stroke={isCompleted ? '#10B981' : '#F59E0B'}");
  res = res.replace(/stroke=\{catQuestStage === 'completed' \? '#059669' : '#8C6239'\}/g, "stroke={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}");
  res = res.replace(/stroke=\{isRG \? \(isRGUnlocked \? '#059669' : '#B45309'\) : isSaved \? '#059669' : '#8C6239'\}/g, "stroke={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10B981' : '#F59E0B'}");
  return res;
});

// 3. Small seam cover rects that were fill="#FFFDF7"
code = code.replace(/<rect\s+x=\{teacherX - 8\}\s+y=\{bubbleY - 12\}\s+width=\{16\}\s+height=\{4\}\s+fill="#FFFDF7"\s*\/>/g,
  `<rect x={teacherX - 8} y={bubbleY - 12} width={16} height={4} fill="#2D1A12" />`);

// 4. Texts in interaction prompts:
// fill="#362014" -> fill="#FEF3C7"
code = code.replace(/fill="#362014"\s+fontSize=\{10\.5\}/g, `fill="#FEF3C7" fontSize={10.5}`);
code = code.replace(/fill="#362014"\s+fontSize=\{10\}/g, `fill="#FEF3C7" fontSize={10}`);
code = code.replace(/fill="#362014"\s+fontSize=\{11\}/g, `fill="#FEF3C7" fontSize={11}`);
code = code.replace(/fill=\{hasPassedSatpamQuiz \? '#059669' : '#362014'\}/g, `fill={hasPassedSatpamQuiz ? '#34D399' : '#FEF3C7'}`);
code = code.replace(/fill=\{catQuestStage === 'completed' \? '#059669' : '#362014'\}/g, `fill={catQuestStage === 'completed' ? '#34D399' : '#FEF3C7'}`);
code = code.replace(/fill=\{isRG \? \(isRGUnlocked \? '#059669' : '#B45309'\) : isSaved \? '#059669' : '#362014'\}/g, `fill={isRG ? (isRGUnlocked ? '#34D399' : '#FBBF24') : isSaved ? '#34D399' : '#FEF3C7'}`);

// 5. Restore CRLF if needed and write back
if (isCRLF) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully refined all SVG elements in NPath.tsx!');
