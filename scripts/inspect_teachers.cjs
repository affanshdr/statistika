const fs = require('fs');
const sharp = require('sharp');

async function inspectTeachers() {
  const teachers = [
    'public/Assets/Building/Ruang VII-A/Bu Sari.webp',
    'public/Assets/Building/Ruang VII-A/Bu Sari.png',
    'public/Assets/Building/Ruang VII-B/Pak Bambang.webp',
    'public/Assets/Building/Ruang VII-B/Pak Bambang.png',
    'public/Assets/Character/Pak Bambang.png',
    'public/Assets/Building/Ruang VIII-A/Bu Rina.webp',
    'public/Assets/Building/Ruang VIII-B/Pak Setiawan.webp',
    'public/Assets/Building/Ruang IX/Pak Joko.webp',
    'public/Assets/Building/field/GuruOlahraga.png',
    'public/Assets/Building/field/walk_down.png',
    'public/Assets/Building/field/walk_down_clean.png',
    'public/Assets/Building/field/walk_right.png',
    'public/Assets/Building/field/walk_right_clean.png',
    'public/Assets/Building/field/walk_up.png',
    'public/Assets/Building/field/walk_up_clean.png',
    'public/Assets/Building/field/user-throw-trimmed.png',
    'public/Assets/Character/Stevunt-idle.png',
    'public/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png'
  ];

  for (const f of teachers) {
    if (!fs.existsSync(f)) continue;
    const img = sharp(f);
    const meta = await img.metadata();
    const raw = await img.ensureAlpha().raw().toBuffer();
    const { width, height } = meta;

    // Check edge 1px boundary
    let edgePixelCount = 0;
    for (let x = 0; x < width; x++) {
      if (raw[(0 * width + x) * 4 + 3] > 10) edgePixelCount++;
      if (raw[((height - 1) * width + x) * 4 + 3] > 10) edgePixelCount++;
    }
    for (let y = 0; y < height; y++) {
      if (raw[(y * width + 0) * 4 + 3] > 10) edgePixelCount++;
      if (raw[(y * width + (width - 1)) * 4 + 3] > 10) edgePixelCount++;
    }

    // Check for chroma key green or magenta or pure white fringes
    let greenFringe = 0;
    let whiteFringe = 0;
    let strayCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = raw[idx];
        const g = raw[idx + 1];
        const b = raw[idx + 2];
        const a = raw[idx + 3];

        if (a > 10) {
          // Strong green spill
          if (g > 110 && g > r * 1.35 && g > b * 1.35) greenFringe++;
          // High white fringe on low-alpha or border
          if (r > 240 && g > 240 && b > 240 && a < 200) whiteFringe++;
        }
      }
    }

    console.log(`${f.padEnd(55)} | ${width}x${height} | EdgeTouches: ${edgePixelCount} | GreenFringe: ${greenFringe} | WhiteFringe: ${whiteFringe}`);
  }
}

inspectTeachers();
