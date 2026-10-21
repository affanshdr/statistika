const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function fixSutrisnoPortrait() {
  const filePath = 'public/Assets/Character/pak-sutrisno-portrait.png';
  const backupPath = 'public/Assets/Character/pak-sutrisno-portrait.backup.png';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  const img = sharp(filePath);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const cleaned = Buffer.from(raw);

  // 1. Clean green fringe & suppress chroma-key spill
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = cleaned[idx];
      const g = cleaned[idx + 1];
      const b = cleaned[idx + 2];
      const a = cleaned[idx + 3];

      if (a > 5) {
        // Green spill condition
        if (g > 70 && g > r * 1.2 && g > b * 1.2) {
          // If on outer edge or semi-transparent, remove completely
          if (a < 180 || y < 6 || x < 6 || x > width - 6) {
            cleaned[idx + 3] = 0;
          } else {
            // Neutralize green cast to hair/skin tone
            cleaned[idx + 1] = Math.round((r + b) / 2);
          }
        }

        // Clean flat cutoff line on the very top rows (y=0..2)
        if (y <= 2 && (r < 30 && g > 60)) {
          cleaned[idx + 3] = 0;
        }
      }
    }
  }

  // Add 12px transparent padding all around so hair is never clamped
  const pad = 12;
  const paddedBuffer = await sharp(cleaned, { raw: { width, height, channels: 4 } })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  fs.writeFileSync(filePath, paddedBuffer);
  console.log('Fixed pak-sutrisno-portrait.png: green fringe removed, padded to', width + pad * 2, 'x', height + pad * 2);
}

async function fixSutrisnoAvatar() {
  const filePath = 'public/Assets/Character/pak-sutrisno-avatar.png';
  const backupPath = 'public/Assets/Character/pak-sutrisno-avatar.backup.png';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  const img = sharp(filePath);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const cleaned = Buffer.from(raw);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = cleaned[idx];
      const g = cleaned[idx + 1];
      const b = cleaned[idx + 2];
      const a = cleaned[idx + 3];

      if (a > 5) {
        // Green spill
        if (g > 70 && g > r * 1.2 && g > b * 1.2) {
          if (a < 180 || y < 5 || x < 5) {
            cleaned[idx + 3] = 0;
          } else {
            cleaned[idx + 1] = Math.round((r + b) / 2);
          }
        }

        // Remove uncropped bottom-left rectangular corner (x < 15 and y > 240)
        // Check distance from avatar center circle or rounded cut
        if (x < 14 && y > 240) {
          cleaned[idx + 3] = 0;
        }
      }
    }
  }

  const outBuffer = await sharp(cleaned, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
  fs.writeFileSync(filePath, outBuffer);
  console.log('Fixed pak-sutrisno-avatar.png: green fringe and bottom-left corner artifact removed');
}

async function fixJokoSatpam() {
  const filePath = 'public/Assets/Character/pak-joko-satpam.png';
  const backupPath = 'public/Assets/Character/pak-joko-satpam.backup.png';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  const img = sharp(filePath);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const cleaned = Buffer.from(raw);

  // Add 16px transparent padding all around so hat, shoes, and sides are never cut off
  const pad = 16;
  const paddedBuffer = await sharp(cleaned, { raw: { width, height, channels: 4 } })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  fs.writeFileSync(filePath, paddedBuffer);
  console.log('Fixed pak-joko-satpam.png: added 16px padding on all borders (new size: ' + (width + pad * 2) + 'x' + (height + pad * 2) + ')');
}

async function fixJokoAvatar() {
  const filePath = 'public/Assets/Character/pak-joko-avatar.png';
  const backupPath = 'public/Assets/Character/pak-joko-avatar.backup.png';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  const img = sharp(filePath);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const cleaned = Buffer.from(raw);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Remove uncropped bottom-right corner artifact (x > 245 and y > 245)
      if (x > 248 && y > 245) {
        cleaned[idx + 3] = 0;
      }
    }
  }

  const outBuffer = await sharp(cleaned, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
  fs.writeFileSync(filePath, outBuffer);
  console.log('Fixed pak-joko-avatar.png: bottom-right corner artifact removed');
}

async function fixGuruOlahraga() {
  const filePath = 'public/Assets/Building/field/GuruOlahraga.png';
  const backupPath = 'public/Assets/Building/field/GuruOlahraga.backup.png';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  const img = sharp(filePath);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();

  // The 5 row bands in the original image:
  const rowBands = [
    { startY: 39, endY: 254 },
    { startY: 289, endY: 505 },
    { startY: 533, endY: 753 },
    { startY: 784, endY: 1003 },
    { startY: 1030, endY: 1238 }
  ];

  const colW = width / 5; // ~249.4

  // Target normalized canvas: 1250x1250 (exactly 250x250 per cell)
  const targetCellSize = 250;
  const targetCanvasSize = targetCellSize * 5; // 1250x1250

  const composites = [];

  for (let r = 0; r < 5; r++) {
    const band = rowBands[r];
    const bH = band.endY - band.startY + 1; // ~216px

    for (let c = 0; c < 5; c++) {
      const startX = Math.round(c * colW);
      const bW = Math.round((c + 1) * colW) - startX;

      // Extract this cell frame
      const frameBuffer = await sharp(filePath)
        .extract({
          left: startX,
          top: band.startY,
          width: bW,
          height: bH
        })
        .png()
        .toBuffer();

      // Place it aligned at the bottom with 12px margin from the cell bottom
      // Target cell top-left:
      const cellLeft = c * targetCellSize;
      const cellTop = r * targetCellSize;

      // Center horizontally in the 250px cell:
      const destX = cellLeft + Math.floor((targetCellSize - bW) / 2);
      // Place near bottom with 12px floor margin:
      const destY = cellTop + (targetCellSize - bH - 12);

      composites.push({
        input: frameBuffer,
        left: destX,
        top: destY
      });
    }
  }

  const normalized = await sharp({
    create: {
      width: targetCanvasSize,
      height: targetCanvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer();

  fs.writeFileSync(filePath, normalized);
  console.log('Fixed GuruOlahraga.png: normalized to 1250x1250 (250x250 per cell) with zero row bleeding');
}

async function run() {
  await fixSutrisnoPortrait();
  await fixSutrisnoAvatar();
  await fixJokoSatpam();
  await fixJokoAvatar();
  await fixGuruOlahraga();
  console.log('\nAll sprite fixes completed!');
}

run().catch(console.error);
