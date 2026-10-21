const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const RG_BG = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang Guru/Ruang Guru.png';
const SUTRISNO_SPRITE = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png';
const STEVUNT_SPRITE = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Character/Stevunt-idle.png';

(async () => {
  console.log('Testing candidates for Pak Sutrisno & Stevunt in Ruang Guru...');

  const WORLD_VW = 1235;
  const WORLD_VH = 650;

  // Extract first frame of Pak Sutrisno (cols: 5, rows: 4 -> frame 0 is top-left 256x256)
  const sutrisnoFrame = await sharp(SUTRISNO_SPRITE)
    .extract({ left: 0, top: 0, width: 256, height: 256 })
    .toBuffer();

  // Extract Stevunt idle frame
  const stevuntMeta = await sharp(STEVUNT_SPRITE).metadata();
  console.log('Stevunt sprite metadata:', stevuntMeta);
  // Stevunt-idle is typically a sprite sheet or single image
  const stevuntFrame = await sharp(STEVUNT_SPRITE)
    .extract({ left: 0, top: 0, width: Math.min(stevuntMeta.width, 256), height: Math.min(stevuntMeta.height, 256) })
    .toBuffer();

  // Candidate configurations:
  // In game:
  // - Pak Sutrisno size: ~220px to 240px
  // - Stevunt size: ~170px to 200px
  // Characters are anchored at bottom-center (feet at y, center at x)
  const candidates = [
    {
      id: 'candidate_1_center_stage',
      title: 'Kandidat 1: Dialog Konsultasi Tengah (Pak Sutrisno x:510, y:600 | Stevunt x:310, y:600)',
      teacher: { x: 510, y: 600, size: 210, flipX: true }, // facing left
      player: { x: 310, y: 600, size: 190, flipX: false }, // facing right
    },
    {
      id: 'candidate_2_desk_flank',
      title: 'Kandidat 2: Flank Sisi Meja Konseling (Pak Sutrisno x:420, y:580 | Stevunt x:230, y:580)',
      teacher: { x: 420, y: 580, size: 200, flipX: true },
      player: { x: 230, y: 580, size: 180, flipX: false },
    },
    {
      id: 'candidate_3_sunlight_reception',
      title: 'Kandidat 3: Area Cahaya Matahari (Pak Sutrisno x:650, y:615 | Stevunt x:430, y:615)',
      teacher: { x: 650, y: 615, size: 210, flipX: true },
      player: { x: 430, y: 615, size: 190, flipX: false },
    }
  ];

  for (const cand of candidates) {
    console.log(`Rendering ${cand.title}...`);

    // Prepare teacher sprite
    let teacherImg = sharp(sutrisnoFrame).resize(cand.teacher.size, cand.teacher.size, { fit: 'contain' });
    if (cand.teacher.flipX) teacherImg = teacherImg.flop();
    const teacherBuffer = await teacherImg.png().toBuffer();

    // Prepare player sprite
    let playerImg = sharp(stevuntFrame).resize(cand.player.size, cand.player.size, { fit: 'contain' });
    if (cand.player.flipX) playerImg = playerImg.flop();
    const playerBuffer = await playerImg.png().toBuffer();

    // Calculate placement: feet at y, center at x
    const teacherLeft = Math.round(cand.teacher.x - cand.teacher.size / 2);
    const teacherTop = Math.round(cand.teacher.y - cand.teacher.size * 0.88);

    const playerLeft = Math.round(cand.player.x - cand.player.size / 2);
    const playerTop = Math.round(cand.player.y - cand.player.size * 0.88);

    // SVG Annotation & Speech Bubble
    const svgOverlay = `
      <svg width="${WORLD_VW}" height="${WORLD_VH}">
        <!-- Shadow beneath characters -->
        <ellipse cx="${cand.teacher.x}" cy="${cand.teacher.y - 2}" rx="32" ry="12" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="${cand.player.x}" cy="${cand.player.y - 2}" rx="28" ry="10" fill="rgba(0,0,0,0.3)" />

        <!-- Foot Position Markers -->
        <circle cx="${cand.teacher.x}" cy="${cand.teacher.y}" r="4" fill="#F59E0B" stroke="#FFF" stroke-width="1.5" />
        <circle cx="${cand.player.x}" cy="${cand.player.y}" r="4" fill="#3B82F6" stroke="#FFF" stroke-width="1.5" />

        <!-- Speech Bubble for Pak Sutrisno -->
        <g transform="translate(${cand.teacher.x - 170}, ${teacherTop - 85})">
          <rect width="340" height="70" rx="10" fill="#1E1B18" stroke="#10B981" stroke-width="2" />
          <polygon points="170,70 180,82 195,70" fill="#1E1B18" stroke="#10B981" stroke-width="1" />
          <rect x="170" y="68" width="26" height="3" fill="#1E1B18" />
          <text x="170" y="24" fill="#34D399" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">
            PAK SUTRISNO (GURU BK &amp; KEDISIPLINAN)
          </text>
          <text x="170" y="44" fill="#F1F5F9" font-family="sans-serif" font-size="11.5" font-weight="bold" text-anchor="middle">
            "Kerja luar biasa, Stevunt! Mari kita olah datanya!"
          </text>
        </g>

        <!-- Candidate Title Header Banner -->
        <rect x="20" y="20" width="560" height="42" fill="rgba(15, 23, 42, 0.9)" rx="6" stroke="#475569" />
        <text x="35" y="46" fill="#F8FAFC" font-family="sans-serif" font-size="13.5" font-weight="bold">
          ${cand.title}
        </text>
      </svg>
    `;

    const bgResized = await sharp(RG_BG).resize(WORLD_VW, WORLD_VH, { fit: 'fill' }).toBuffer();

    const compositeLayers = [
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      { input: teacherBuffer, top: Math.max(0, teacherTop), left: Math.max(0, teacherLeft) },
      { input: playerBuffer, top: Math.max(0, playerTop), left: Math.max(0, playerLeft) },
    ];

    const finalImg = await sharp(bgResized)
      .composite(compositeLayers)
      .png()
      .toBuffer();

    const outPath = path.join(ARTIFACTS_DIR, `${cand.id}.png`);
    fs.writeFileSync(outPath, finalImg);
    console.log(`Saved ${cand.id} -> ${outPath}`);
  }

  console.log('All candidate mockups generated!');
})();
