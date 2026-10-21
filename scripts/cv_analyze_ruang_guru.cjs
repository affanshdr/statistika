const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const RG_IMG_PATH = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang Guru/Ruang Guru.png';
const RG_WEBP_PATH = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang Guru/Ruang Guru.webp';

(async () => {
  const imgPath = fs.existsSync(RG_IMG_PATH) ? RG_IMG_PATH : RG_WEBP_PATH;
  console.log('Loading Ruang Guru image:', imgPath);

  const img = sharp(imgPath);
  const metadata = await img.metadata();
  console.log(`Original Image Dimensions: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

  // Scale to WORLD_VW x WORLD_VH (1235 x 650)
  const WORLD_VW = 1235;
  const WORLD_VH = 650;

  // Let's create an overlay showing coordinate grid and current spawn & teacher
  const currentSpawn = { x: 680, y: 550 };
  const currentTeacher = { x: 580, y: 415, size: 240, hotspotW: 140, hotspotH: 260 };

  // Generate SVG overlay
  const svgOverlay = `
    <svg width="${WORLD_VW}" height="${WORLD_VH}">
      <!-- 100px Grid Lines -->
      ${Array.from({ length: Math.floor(WORLD_VW / 100) }, (_, i) => (i + 1) * 100).map(x => `
        <line x1="${x}" y1="0" x2="${x}" y2="${WORLD_VH}" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" stroke-dasharray="4 4" />
        <text x="${x + 2}" y="15" fill="white" font-family="monospace" font-size="10" font-weight="bold">${x}</text>
      `).join('')}
      ${Array.from({ length: Math.floor(WORLD_VH / 100) }, (_, i) => (i + 1) * 100).map(y => `
        <line x1="0" y1="${y}" x2="${WORLD_VW}" y2="${y}" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" stroke-dasharray="4 4" />
        <text x="5" y="${y - 3}" fill="white" font-family="monospace" font-size="10" font-weight="bold">${y}</text>
      `).join('')}

      <!-- Current Teacher Position & Hotspot Box -->
      <g>
        <!-- Hotspot rect: centered horizontally at teacher.x, bottom anchored at teacher.y -->
        <rect x="${currentTeacher.x - currentTeacher.hotspotW / 2}" y="${currentTeacher.y - currentTeacher.hotspotH}" 
              width="${currentTeacher.hotspotW}" height="${currentTeacher.hotspotH}" 
              fill="rgba(220, 38, 38, 0.25)" stroke="#DC2626" stroke-width="2.5" rx="8" />
        <circle cx="${currentTeacher.x}" cy="${currentTeacher.y}" r="6" fill="#EF4444" stroke="#FFFFFF" stroke-width="2" />
        <text x="${currentTeacher.x}" y="${currentTeacher.y - currentTeacher.hotspotH - 8}" 
              fill="#FCA5A5" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">
          Pak Sutrisno Saat Ini (${currentTeacher.x}, ${currentTeacher.y})
        </text>
      </g>

      <!-- Current Spawn Position & Hotspot Box (Stevunt ~70w x 140h) -->
      <g>
        <rect x="${currentSpawn.x - 40}" y="${currentSpawn.y - 140}" 
              width="80" height="140" 
              fill="rgba(59, 130, 246, 0.25)" stroke="#3B82F6" stroke-width="2.5" rx="8" />
        <circle cx="${currentSpawn.x}" cy="${currentSpawn.y}" r="6" fill="#60A5FA" stroke="#FFFFFF" stroke-width="2" />
        <text x="${currentSpawn.x}" y="${currentSpawn.y - 148}" 
              fill="#93C5FD" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">
          Spawn Pemain Saat Ini (${currentSpawn.x}, ${currentSpawn.y})
        </text>
      </g>

      <!-- Legend Banner -->
      <rect x="20" y="20" width="340" height="70" fill="rgba(15, 23, 42, 0.85)" rx="8" stroke="#475569" />
      <text x="35" y="42" fill="#F8FAFC" font-family="sans-serif" font-size="13" font-weight="bold">
        Analisis CV Ruang Guru (1235 x 650)
      </text>
      <circle cx="42" cy="62" r="5" fill="#EF4444" />
      <text x="54" y="66" fill="#FCA5A5" font-family="sans-serif" font-size="11">Merah = Pak Sutrisno (x:${currentTeacher.x}, y:${currentTeacher.y})</text>
      <circle cx="215" cy="62" r="5" fill="#3B82F6" />
      <text x="227" y="66" fill="#93C5FD" font-family="sans-serif" font-size="11">Biru = Spawn (x:${currentSpawn.x}, y:${currentSpawn.y})</text>
    </svg>
  `;

  const resizedBg = await sharp(imgPath).resize(WORLD_VW, WORLD_VH, { fit: 'fill' }).toBuffer();

  const annotated = await sharp(resizedBg)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const outPath = path.join(ARTIFACTS_DIR, 'ruang_guru_cv_analysis.png');
  fs.writeFileSync(outPath, annotated);
  console.log(`Saved CV analysis to -> ${outPath}`);
})();
