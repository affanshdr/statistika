const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Creating detailed showcase collage...');
  const modusTop = path.join(ARTIFACTS_DIR, 'tutorial_panel_2_modus.png');
  const modusBtm = path.join(ARTIFACTS_DIR, 'tutorial_panel_2_modus_scrolled.png');
  const medianTop = path.join(ARTIFACTS_DIR, 'tutorial_panel_3_median.png');
  const medianBtm = path.join(ARTIFACTS_DIR, 'tutorial_panel_3_median_scrolled.png');

  if (!fs.existsSync(medianBtm) || !fs.existsSync(modusBtm)) {
    console.log('Waiting for scrolled files...');
    return;
  }

  // Crop the modal dialog area (approx center: left 320 to 960, top 20 to 700)
  // Let's crop modal area directly:
  const cropModal = async (filePath) => {
    // 1280x720 canvas
    // Modal is approx 640px wide, centered at 640 -> left = 320, width = 640, top = 25, height = 670
    return await sharp(filePath)
      .extract({ left: 320, top: 25, width: 640, height: 670 })
      .toBuffer();
  };

  const modusTopCrop = await cropModal(modusTop);
  const modusBtmCrop = await cropModal(modusBtm);
  const medianTopCrop = await cropModal(medianTop);
  const medianBtmCrop = await cropModal(medianBtm);

  const cardW = 480;
  const cardH = 502; // 670 * (480/640)

  const m1 = await sharp(modusTopCrop).resize(cardW, cardH).toBuffer();
  const m2 = await sharp(modusBtmCrop).resize(cardW, cardH).toBuffer();
  const med1 = await sharp(medianTopCrop).resize(cardW, cardH).toBuffer();
  const med2 = await sharp(medianBtmCrop).resize(cardW, cardH).toBuffer();

  const totalW = cardW * 2 + 50;
  const totalH = cardH * 2 + 130;

  const svgHeader = `
    <svg width="${totalW}" height="${totalH}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0B1329" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="${totalW / 2}" y="42" font-family="sans-serif" font-size="22" font-weight="900" fill="#F8FAFC" text-anchor="middle">
        PEMBARUAN EDUKASI MATERI: 2 CONTOH LENGKAP (GANJIL &amp; GENAP)
      </text>
      <text x="${totalW / 2}" y="68" font-family="sans-serif" font-size="13.5" font-weight="600" fill="#38BDF8" text-anchor="middle">
        Tahap 2 (Modus): 2 Kasus Frekuensi Terbanyak  |  Tahap 3 (Median): Nilai Tengah Sangat Jelas Dipertegas
      </text>
      <!-- Sub-headers -->
      <text x="${cardW / 2 + 20}" y="98" font-family="sans-serif" font-size="14" font-weight="bold" fill="#38BDF8" text-anchor="middle">
        Tahap 2: Modus (Ganjil &amp; Genap)
      </text>
      <text x="${cardW + 30 + cardW / 2}" y="98" font-family="sans-serif" font-size="14" font-weight="bold" fill="#F59E0B" text-anchor="middle">
        Tahap 3: Median (Sorotan Nilai Tengah Tunggal &amp; Rata-rata 2 Tengah)
      </text>
    </svg>
  `;

  const finalImg = await sharp(Buffer.from(svgHeader))
    .composite([
      { input: m1, top: 110, left: 20 },
      { input: med1, top: 110, left: cardW + 30 },
      { input: m2, top: 110 + cardH + 10, left: 20 },
      { input: med2, top: 110 + cardH + 10, left: cardW + 30 }
    ])
    .png()
    .toBuffer();

  const outPath = path.join(ARTIFACTS_DIR, 'showcase_contoh_ganjil_genap_lengkap.png');
  fs.writeFileSync(outPath, finalImg);
  console.log(`Saved detailed showcase -> ${outPath}`);
})();
