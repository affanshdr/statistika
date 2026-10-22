const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const src = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/pixel_art_ceramic_bowls_1792650092923.jpg';
const outDir = path.join(__dirname, '../public/Assets/Bowls');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Use sharp to crop and remove green background
// The image is ~1408x816. Each bowl is roughly 1/4 width.
// Bowl positions (approx): A=70-380, B=380-680, C=680-1010, D=1010-1340

const script = `
const sharp = require('sharp');
const path = require('path');

const src = '${src.replace(/\\/g, '/')}';
const outDir = '${outDir.replace(/\\/g, '/')}';

async function cropBowl(name, left, top, width, height) {
  const buf = await sharp(src)
    .extract({ left, top, width, height })
    .toBuffer();

  // Remove green (#00FF00) background by converting to PNG with alpha
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Replace green pixels with transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // Green chroma key: high green, low red and blue
    if (g > 180 && r < 120 && b < 120) {
      data[i+3] = 0; // make transparent
    }
    // Also handle edge blending with green
    if (g > 150 && r < 80 && b < 80) {
      data[i+3] = 0;
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(path.join(outDir, name + '.png'));

  console.log('Saved:', name + '.png', info.width, 'x', info.height);
}

(async () => {
  const img = await sharp(src).metadata();
  console.log('Source:', img.width, 'x', img.height);

  const bowlW = Math.floor(img.width / 4);
  const margin = 20;

  await cropBowl('bowl_A', 0 * bowlW + margin, 80, bowlW - margin * 2, img.height - 160);
  await cropBowl('bowl_B', 1 * bowlW + margin, 80, bowlW - margin * 2, img.height - 160);
  await cropBowl('bowl_C', 2 * bowlW + margin, 80, bowlW - margin * 2, img.height - 160);
  await cropBowl('bowl_D', 3 * bowlW + margin, 80, bowlW - margin * 2, img.height - 160);

  console.log('All bowls cropped and saved!');
})();
`;

fs.writeFileSync(path.join(__dirname, '_crop_bowls.cjs'), script);
try {
  execSync('node scripts/_crop_bowls.cjs', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
} catch (e) {
  console.error('Sharp crop failed, using fallback copy');
  // Fallback: just copy the full spritesheet
  fs.copyFileSync(src, path.join(outDir, 'bowls_spritesheet.jpg'));
  console.log('Copied spritesheet to', outDir);
}
