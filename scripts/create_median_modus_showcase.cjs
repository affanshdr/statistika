const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Generating comparison / showcase for Median & Modus dual examples...');
  const modusPath = path.join(ARTIFACTS_DIR, 'tutorial_panel_2_modus.png');
  const medianPath = path.join(ARTIFACTS_DIR, 'tutorial_panel_3_median.png');

  if (!fs.existsSync(modusPath) || !fs.existsSync(medianPath)) {
    console.error('One or both tutorial images missing, skipping composite until screenshots ready.');
    return;
  }

  // Create high-res side-by-side comparison
  const width = 1280;
  const height = 720;
  const targetW = 960;
  const targetH = 540;

  const modusResized = await sharp(modusPath).resize(targetW, targetH, { fit: 'inside' }).toBuffer();
  const medianResized = await sharp(medianPath).resize(targetW, targetH, { fit: 'inside' }).toBuffer();

  const modusMeta = await sharp(modusResized).metadata();
  const medianMeta = await sharp(medianResized).metadata();

  const compositeH = Math.max(modusMeta.height, medianMeta.height) + 100;
  const compositeW = modusMeta.width + medianMeta.width + 40;

  const svgHeader = `
    <svg width="${compositeW}" height="${compositeH}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="${compositeW / 2}" y="45" font-family="sans-serif" font-size="24" font-weight="bold" fill="#F8FAFC" text-anchor="middle">
        Pembaruan Edukasi Statistika: 2 Contoh Konkret (Data Ganjil &amp; Data Genap)
      </text>
      <text x="${compositeW / 2}" y="75" font-family="sans-serif" font-size="15" fill="#94A3B8" text-anchor="middle">
        Visualisasi Nilai Tengah (Median) Diberi Sorotan Emas &amp; Nilai Terbanyak (Modus) Diberi Sorotan Biru
      </text>
    </svg>
  `;

  const finalBuffer = await sharp(Buffer.from(svgHeader))
    .composite([
      { input: modusResized, top: 90, left: 15 },
      { input: medianResized, top: 90, left: modusMeta.width + 25 }
    ])
    .png()
    .toBuffer();

  const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_contoh_ganjil_genap.png');
  fs.writeFileSync(outPath, finalBuffer);
  console.log(`Saved showcase to ${outPath}`);
})();
