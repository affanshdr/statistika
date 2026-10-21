const fs = require('fs');
const sharp = require('sharp');

async function checkPakJoko() {
  const filePath = 'public/Assets/Character/pak-joko-satpam.png';
  const img = sharp(filePath);
  const meta = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const { width, height } = meta;

  console.log(`Pak Joko dimensions: ${width}x${height}`);

  // Find where non-zero alpha occurs along the border
  console.log('--- Top border (y=0) ---');
  for (let x = 0; x < width; x++) {
    const a = raw[(0 * width + x) * 4 + 3];
    if (a > 10) {
      console.log(`y=0, x=${x}, rgba=(${raw[(0 * width + x) * 4]}, ${raw[(0 * width + x) * 4 + 1]}, ${raw[(0 * width + x) * 4 + 2]}, ${a})`);
    }
  }

  console.log('--- Bottom border (y=height-1) ---');
  for (let x = 0; x < width; x++) {
    const a = raw[((height - 1) * width + x) * 4 + 3];
    if (a > 10) {
      console.log(`y=${height - 1}, x=${x}, rgba=(${raw[((height - 1) * width + x) * 4]}, ${raw[((height - 1) * width + x) * 4 + 1]}, ${raw[((height - 1) * width + x) * 4 + 2]}, ${a})`);
    }
  }

  console.log('--- Left border (x=0) ---');
  for (let y = 0; y < height; y++) {
    const a = raw[(y * width + 0) * 4 + 3];
    if (a > 10) {
      console.log(`x=0, y=${y}, rgba=(${raw[(y * width + 0) * 4]}, ${raw[(y * width + 0) * 4 + 1]}, ${raw[(y * width + 0) * 4 + 2]}, ${a})`);
    }
  }

  console.log('--- Right border (x=width-1) ---');
  for (let y = 0; y < height; y++) {
    const a = raw[(y * width + (width - 1)) * 4 + 3];
    if (a > 10) {
      console.log(`x=${width - 1}, y=${y}, rgba=(${raw[(y * width + (width - 1)) * 4]}, ${raw[(y * width + (width - 1)) * 4 + 1]}, ${raw[(y * width + (width - 1)) * 4 + 2]}, ${a})`);
    }
  }
}

checkPakJoko();
