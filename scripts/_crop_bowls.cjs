const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const src = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/pixel_art_ceramic_bowls_1792650092923.jpg';
const outDir = path.join(__dirname, '../public/Assets/Bowls');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function cropBowl(name, left, top, width, height) {
  const buf = await sharp(src)
    .extract({ left, top, width, height })
    .toBuffer();

  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Aggressive green chroma key removal
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // Pure green and near-green
    if (g > 100 && g > r * 1.3 && g > b * 1.3) {
      data[i+3] = 0;
    }
    // Edge blending - semi-transparent for fringe
    if (g > 80 && g > r * 1.15 && g > b * 1.15 && r < 130 && b < 130) {
      data[i+3] = Math.min(data[i+3], Math.max(0, 255 - (g - Math.max(r, b)) * 3));
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .trim()  // auto-trim transparent edges
    .toFile(path.join(outDir, name + '.png'));

  console.log('Saved:', name + '.png');
}

(async () => {
  const img = await sharp(src).metadata();
  console.log('Source:', img.width, 'x', img.height);

  const bowlW = Math.floor(img.width / 4);

  // Crop each bowl with more generous bounds, trim will remove excess
  await cropBowl('bowl_A', 0, 0, bowlW, img.height);
  await cropBowl('bowl_B', bowlW, 0, bowlW, img.height);
  await cropBowl('bowl_C', bowlW * 2, 0, bowlW, img.height);
  await cropBowl('bowl_D', bowlW * 3, 0, bowlW - 10, img.height);

  console.log('All bowls cropped with clean transparency!');
})();
