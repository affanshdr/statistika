const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const RG_IMG_PATH = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang Guru/Ruang Guru.png';

(async () => {
  const WORLD_VW = 1235;
  const WORLD_VH = 650;

  // Let's analyze pixel coordinates in 1235x650 space
  // We will map out key furniture in Ruang Guru:
  // 1. Water Dispenser & Table: x: 0 to 80, y: 380 to 650
  // 2. Left Low Cabinet: x: 145 to 375, y: 440 to 540
  //    - Shoes in front: x: 165 to 215, y: 550
  // 3. Desk 1 (Left desk with book stacks): x: 275 to 490, y: 440 to 555
  //    - Backpack on floor: x: 250 to 325, y: 580
  //    - Shoes: x: 320 to 360, y: 585
  //    - Trash can: x: 435 to 475, y: 560 to 600
  // 4. Desk 2 (Center desk with CRT monitor & documents): x: 485 to 685, y: 440 to 555
  //    - Swivel Chair 1: x: 555 to 625, y: 540 to 620
  // 5. Desk 3 (Right desk with modern LCD monitor & PC): x: 685 to 870, y: 440 to 555
  //    - Swivel Chair 2: x: 745 to 815, y: 540 to 620
  // 6. Right Corner Plants: x: 850 to 1235, y: 440 to 650
  //    - Big Monstera Plant: x: 855 to 945, y: 500 to 630
  //    - Fern & Plant Pots: x: 920 to 1010, y: 560 to 650
  //
  // Now let's calculate the CLEAR, UNOBSTRUCTED FLOOR REGIONS:
  // Floor Region A: Foreground Walkway (in front of all desks and chairs)
  //   - Y: 590 to 640 (runs from x: 100 to x: 900)
  // Floor Region B: Center-Left Consultation Aisle (between left cabinet/bag and Desk 1 / trash can)
  //   - X: 350 to 430, Y: 570 to 630
  // Floor Region C: Wide Open Foreground (Front Center-Left)
  //   - X: 450 to 550, Y: 595 to 640 (completely clean floor tiles with sunlight)
  // Floor Region D: Left Room Entrance Floor (between dispenser and shoes)
  //   - X: 90 to 160, Y: 530 to 630

  console.log('Generating annotated floor analysis map...');

  const svgVisualizer = `
    <svg width="${WORLD_VW}" height="${WORLD_VH}">
      <!-- Obstacles Highlight (Red semi-transparent) -->
      <!-- Dispenser -->
      <rect x="0" y="400" width="85" height="250" fill="rgba(239, 68, 68, 0.3)" stroke="#DC2626" stroke-width="1.5" />
      <text x="42" y="430" fill="#FCA5A5" font-size="10" text-anchor="middle">Dispenser</text>

      <!-- Left Low Cabinet -->
      <rect x="145" y="440" width="230" height="100" fill="rgba(239, 68, 68, 0.3)" stroke="#DC2626" stroke-width="1.5" />
      <text x="260" y="490" fill="#FCA5A5" font-size="11" text-anchor="middle">Lemari Arsip</text>

      <!-- Desk 1 + 2 + 3 -->
      <rect x="275" y="440" width="595" height="115" fill="rgba(239, 68, 68, 0.35)" stroke="#DC2626" stroke-width="2" />
      <text x="572" y="500" fill="#FEE2E2" font-size="14" font-weight="bold" text-anchor="middle">DERETAN MEJA GURU (y: 440 - 555)</text>

      <!-- Chairs -->
      <rect x="555" y="540" width="70" height="75" fill="rgba(239, 68, 68, 0.4)" stroke="#B91C1C" stroke-width="1.5" />
      <text x="590" y="585" fill="#FECACA" font-size="10" text-anchor="middle">Kursi 1</text>

      <rect x="745" y="540" width="70" height="75" fill="rgba(239, 68, 68, 0.4)" stroke="#B91C1C" stroke-width="1.5" />
      <text x="780" y="585" fill="#FECACA" font-size="10" text-anchor="middle">Kursi 2</text>

      <!-- Backpack & Trash Can -->
      <rect x="245" y="540" width="115" height="50" fill="rgba(239, 68, 68, 0.3)" stroke="#DC2626" stroke-width="1" />
      <rect x="435" y="555" width="45" height="45" fill="rgba(239, 68, 68, 0.3)" stroke="#DC2626" stroke-width="1" />
      <text x="457" y="580" fill="#FCA5A5" font-size="9" text-anchor="middle">Tong</text>

      <!-- Plants on Right -->
      <rect x="850" y="500" width="385" height="150" fill="rgba(239, 68, 68, 0.3)" stroke="#DC2626" stroke-width="1.5" />
      <text x="960" y="570" fill="#FCA5A5" font-size="12" text-anchor="middle">Tanaman Hias &amp; Jendela</text>

      <!-- GREEN ZONES: 100% CLEAR WALKABLE FLOOR -->
      <!-- Zone 1: Entrance Walkway (Left) -->
      <rect x="85" y="540" width="75" height="85" fill="rgba(34, 197, 94, 0.3)" stroke="#16A34A" stroke-width="2" rx="6" />
      <text x="122" y="585" fill="#DCFCE7" font-size="10" font-weight="bold" text-anchor="middle">Pintu Masuk</text>

      <!-- Zone 2: Aisle between Bag & Trash Can -->
      <rect x="360" y="550" width="70" height="75" fill="rgba(34, 197, 94, 0.3)" stroke="#16A34A" stroke-width="2" rx="6" />
      <text x="395" y="590" fill="#DCFCE7" font-size="10" font-weight="bold" text-anchor="middle">Lorong</text>

      <!-- Zone 3: Wide Sunny Foreground (BEST INTERACTION STAGE) -->
      <rect x="180" y="595" width="670" height="45" fill="rgba(34, 197, 94, 0.35)" stroke="#16A34A" stroke-width="2" rx="6" />
      <text x="515" y="622" fill="#DCFCE7" font-size="12" font-weight="bold" text-anchor="middle">
        Lantai Terbuka Bersih (y: 595 - 640) - ZERO ASSET OVERLAP
      </text>

      <!-- CANDIDATE PROPOSALS -->
      <!-- Candidate A: Pak Sutrisno at x: 420, y: 600 (Standing beside desk facing right) & Stevunt at x: 620, y: 600 -->
      <!-- Or Candidate B: Pak Sutrisno at x: 680, y: 600 & Stevunt at x: 480, y: 600 -->
      <!-- Or Candidate C: Pak Sutrisno at x: 380, y: 585 (facing Stevunt) & Stevunt at x: 220, y: 585 -->
    </svg>
  `;

  const bg = await sharp(RG_IMG_PATH).resize(WORLD_VW, WORLD_VH, { fit: 'fill' }).toBuffer();
  const annotated = await sharp(bg)
    .composite([{ input: Buffer.from(svgVisualizer), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const out = path.join(ARTIFACTS_DIR, 'ruang_guru_obstacle_map.png');
  fs.writeFileSync(out, annotated);
  console.log(`Saved obstacle map -> ${out}`);
})();
