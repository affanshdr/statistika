const fs = require('fs');
const sharp = require('sharp');

async function analyzeGuruCells() {
  const img = sharp('public/Assets/Building/field/GuruOlahraga.png');
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();

  const cols = 5;
  const rows = 5;
  const cellW = width / cols;
  const cellH = height / rows;

  console.log(`Analyzing GuruOlahraga (${width}x${height}) into 5x5 cells (${cellW.toFixed(1)}x${cellH.toFixed(1)})`);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const startX = Math.round(c * cellW);
      const endX = Math.min(width, Math.round((c + 1) * cellW));
      const startY = Math.round(r * cellH);
      const endY = Math.min(height, Math.round((r + 1) * cellH));

      let minX = endX, maxX = startX, minY = endY, maxY = startY;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const a = raw[(y * width + x) * 4 + 3];
          if (a > 15) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const frameIdx = r * cols + c;
      if (count > 0) {
        console.log(`Frame ${frameIdx} (r:${r}, c:${c}): pixels=${count}, bounds=[X:${minX - startX}..${maxX - startX} of ${endX - startX}, Y:${minY - startY}..${maxY - startY} of ${endY - startY}]`);
      } else {
        console.log(`Frame ${frameIdx} (r:${r}, c:${c}): EMPTY`);
      }
    }
  }
}

analyzeGuruCells();
