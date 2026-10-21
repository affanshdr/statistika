const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function searchUsage(filename) {
  const base = path.basename(filename);
  let usages = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        if (file !== 'node_modules' && file !== '.next') walk(full);
      } else if (/\.(ts|tsx|js|jsx|json|css)$/.test(file)) {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes(base) || content.includes(encodeURI(base))) {
          usages.push(full);
        }
      }
    });
  }
  walk('app');
  walk('components');
  return usages;
}

async function auditSprite(filePath) {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, error: 'File not found' };
  }

  const image = sharp(filePath);
  const metadata = await image.metadata();
  const { width, height, hasAlpha, format } = metadata;
  const raw = await image.ensureAlpha().raw().toBuffer();

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let nonZeroAlphaCount = 0;
  let greenPixels = 0;
  let semiTransparentPixels = 0;
  let edgePixels = { top: 0, bottom: 0, left: 0, right: 0 };
  let cornerPixels = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];
      const a = raw[idx + 3];

      if (a > 10) {
        nonZeroAlphaCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        if (x === 0) edgePixels.left++;
        if (x === width - 1) edgePixels.right++;
        if (y === 0) edgePixels.top++;
        if (y === height - 1) edgePixels.bottom++;

        if ((x === 0 || x === width - 1) && (y === 0 || y === height - 1)) {
          cornerPixels++;
        }

        // Green fringe check (chroma key residue)
        if (g > 100 && g > r * 1.35 && g > b * 1.35) {
          greenPixels++;
        }

        if (a > 20 && a < 240) {
          semiTransparentPixels++;
        }
      }
    }
  }

  const usages = searchUsage(filePath);

  return {
    file: filePath,
    usedIn: usages.map(u => path.relative('.', u).replace(/\\/g, '/')),
    format,
    dimensions: `${width}x${height}`,
    hasAlpha,
    alphaPct: ((nonZeroAlphaCount / (width * height)) * 100).toFixed(1) + '%',
    edgeTouches: edgePixels,
    cornerTouches: cornerPixels,
    greenPixels,
    semiTransparentPixels,
    bbox: nonZeroAlphaCount > 0 ? {
      minX, minY, maxX, maxY,
      w: maxX - minX + 1,
      h: maxY - minY + 1,
      padL: minX,
      padR: width - 1 - maxX,
      padT: minY,
      padB: height - 1 - maxY
    } : null
  };
}

async function run() {
  const spriteCandidates = [
    // Stevunt (Player Level 1)
    'public/Assets/Character/Stevunt-idle.png',
    'public/Assets/Character/Stevunt-iso_walk_down.png',
    'public/Assets/Character/Stevunt-iso_walk_right.png',
    'public/Assets/Character/Stevunt-iso_walk_up-trimmed.png',
    // Pak Sutrisno (NPC Lobby & Avatar)
    'public/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png',
    'public/Assets/Character/Pak Sutrisno.png',
    'public/Assets/Character/pak-sutrisno-portrait.png',
    'public/Assets/Character/pak-sutrisno-avatar.png',
    // Pak Joko (Satpam)
    'public/Assets/Character/pak-joko-satpam.png',
    'public/Assets/Character/pak-joko-avatar.png',
    // Teachers & Room NPCs
    'public/Assets/Building/Ruang VII-A/Bu Sari.webp',
    'public/Assets/Building/Ruang VII-A/Bu Sari.png',
    'public/Assets/Building/Ruang VII-B/Pak Bambang.webp',
    'public/Assets/Building/Ruang VII-B/Pak Bambang.png',
    'public/Assets/Character/Pak Bambang.png',
    'public/Assets/Building/Ruang VIII-A/Bu Rina.webp',
    'public/Assets/Building/Ruang VIII-A/Bu Rina.png',
    'public/Assets/Building/Ruang VIII-B/Pak Setiawan.webp',
    'public/Assets/Building/Ruang VIII-B/Pak Setiawan.png',
    'public/Assets/Building/Ruang IX/Pak Joko.webp',
    'public/Assets/Building/Ruang IX/Pak Joko.png',
    // Level 2 / Field Characters
    'public/Assets/Building/field/karakter_olahraga.png',
    'public/Assets/Building/field/GuruOlahraga.png',
    'public/Assets/Building/field/user-throw-trimmed.png',
    'public/Assets/Building/field/walk_down_clean.png',
    'public/Assets/Building/field/walk_down.png',
    'public/Assets/Building/field/walk_right_clean.png',
    'public/Assets/Building/field/walk_right.png',
    'public/Assets/Building/field/walk_up_clean.png',
    'public/Assets/Building/field/walk_up.png',
    // Cats
    'public/Assets/CatPack/drculacat.png',
    'public/Assets/CatPack/Idle.png',
    'public/Assets/CatPack/Box3.png'
  ];

  const results = [];
  for (const s of spriteCandidates) {
    const res = await auditSprite(s);
    results.push(res);
  }

  fs.writeFileSync('audit_report.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved audit_report.json. Total items:', results.length);
}

run().catch(console.error);
