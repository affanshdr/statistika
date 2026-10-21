const fs = require('fs');
const sharp = require('sharp');

async function testGrid(filePath, cols, rows) {
  const img = sharp(filePath);
  const meta = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const { width, height } = meta;

  const cellW = width / cols;
  const cellH = height / rows;

  let clippedFrames = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const minX = Math.floor(c * cellW);
      const maxX = Math.ceil((c + 1) * cellW) - 1;
      const minY = Math.floor(r * cellH);
      const maxY = Math.ceil((r + 1) * cellH) - 1;

      let touchL = 0, touchR = 0, touchT = 0, touchB = 0;
      for (let y = minY; y <= maxY; y++) {
        if (raw[(y * width + minX) * 4 + 3] > 15) touchL++;
        if (raw[(y * width + maxX) * 4 + 3] > 15) touchR++;
      }
      for (let x = minX; x <= maxX; x++) {
        if (raw[(minY * width + x) * 4 + 3] > 15) touchT++;
        if (raw[(maxY * width + x) * 4 + 3] > 15) touchB++;
      }

      if (touchL > 0 || touchR > 0 || touchT > 0 || touchB > 0) {
        clippedFrames.push({
          frame: r * cols + c,
          col: c, row: r,
          touchL, touchR, touchT, touchB
        });
      }
    }
  }

  console.log(`${filePath.padEnd(55)} (${width}x${height}, ${cols}x${rows}) -> Clipped frames: ${clippedFrames.length}`);
  if (clippedFrames.length > 0) {
    clippedFrames.forEach(cf => {
      console.log(`   Frame ${cf.frame} (c:${cf.col}, r:${cf.row}) -> L:${cf.touchL}, R:${cf.touchR}, T:${cf.touchT}, B:${cf.touchB}`);
    });
  }
}

async function run() {
  console.log('=== REAL GRID SPRITESHEET CLIPPING AUDIT ===\n');
  await testGrid('public/Assets/Character/Stevunt-idle.png', 5, 5);
  await testGrid('public/Assets/Character/Stevunt-iso_walk_down.png', 5, 5);
  await testGrid('public/Assets/Character/Stevunt-iso_walk_right.png', 5, 5);
  await testGrid('public/Assets/Character/Stevunt-iso_walk_up-trimmed.png', 5, 5);
  await testGrid('public/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png', 5, 4);
  await testGrid('public/Assets/Building/field/GuruOlahraga.png', 5, 5);
  await testGrid('public/Assets/Building/field/walk_down_clean.png', 5, 5);
  await testGrid('public/Assets/Building/field/walk_right_clean.png', 5, 5);
  await testGrid('public/Assets/Building/field/walk_up_clean.png', 5, 5);
  await testGrid('public/Assets/Building/field/user-throw-trimmed.png', 5, 4);
  await testGrid('public/Assets/CatPack/Idle.png', 10, 1);
  await testGrid('public/Assets/CatPack/Box3.png', 4, 1);
}

run();
