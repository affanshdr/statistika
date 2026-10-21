const fs = require('fs');
const sharp = require('sharp');

async function inspectEdges(filePath) {
  const image = sharp(filePath);
  const { width, height } = await image.metadata();
  const raw = await image.ensureAlpha().raw().toBuffer();

  console.log(`\n=== INSPECTING: ${filePath} (${width}x${height}) ===`);

  // Check top 3 rows
  let topRowsAlpha = [];
  for (let y = 0; y < 3; y++) {
    let nonZero = 0;
    for (let x = 0; x < width; x++) {
      if (raw[(y * width + x) * 4 + 3] > 10) nonZero++;
    }
    topRowsAlpha.push({ row: y, nonZero });
  }

  // Check bottom 3 rows
  let bottomRowsAlpha = [];
  for (let y = height - 3; y < height; y++) {
    let nonZero = 0;
    for (let x = 0; x < width; x++) {
      if (raw[(y * width + x) * 4 + 3] > 10) nonZero++;
    }
    bottomRowsAlpha.push({ row: y, nonZero });
  }

  // Check left 3 cols
  let leftColsAlpha = [];
  for (let x = 0; x < 3; x++) {
    let nonZero = 0;
    for (let y = 0; y < height; y++) {
      if (raw[(y * width + x) * 4 + 3] > 10) nonZero++;
    }
    leftColsAlpha.push({ col: x, nonZero });
  }

  // Check right 3 cols
  let rightColsAlpha = [];
  for (let x = width - 3; x < width; x++) {
    let nonZero = 0;
    for (let y = 0; y < height; y++) {
      if (raw[(y * width + x) * 4 + 3] > 10) nonZero++;
    }
    rightColsAlpha.push({ col: x, nonZero });
  }

  console.log('Top rows non-zero alpha pixels:', topRowsAlpha);
  console.log('Bottom rows non-zero alpha pixels:', bottomRowsAlpha);
  console.log('Left cols non-zero alpha pixels:', leftColsAlpha);
  console.log('Right cols non-zero alpha pixels:', rightColsAlpha);

  // Check sample border pixel values if any
  let edgeSamples = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        const idx = (y * width + x) * 4;
        const a = raw[idx + 3];
        if (a > 10 && edgeSamples.length < 10) {
          edgeSamples.push({ x, y, r: raw[idx], g: raw[idx + 1], b: raw[idx + 2], a });
        }
      }
    }
  }
  console.log('Edge sample pixels (x,y,r,g,b,a):', edgeSamples);

  // Check green pixels samples
  let greenSamples = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];
      const a = raw[idx + 3];
      if (a > 10 && g > 100 && g > r * 1.35 && g > b * 1.35 && greenSamples.length < 10) {
        greenSamples.push({ x, y, r, g, b, a });
      }
    }
  }
  console.log('Green fringe sample pixels:', greenSamples);
}

async function run() {
  await inspectEdges('public/Assets/Character/pak-joko-satpam.png');
  await inspectEdges('public/Assets/Character/pak-sutrisno-portrait.png');
  await inspectEdges('public/Assets/Character/pak-sutrisno-avatar.png');
  await inspectEdges('public/Assets/Character/pak-joko-avatar.png');
}

run();
