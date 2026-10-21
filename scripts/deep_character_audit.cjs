const fs = require('fs');
const sharp = require('sharp');

async function auditSpriteDeep(filePath, config = {}) {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, error: 'File does not exist' };
  }

  const img = sharp(filePath);
  const meta = await img.metadata();
  const { width, height, hasAlpha } = meta;
  const raw = await img.ensureAlpha().raw().toBuffer();

  const totalPixels = width * height;
  let nonZeroAlpha = 0;
  let minX = width, minY = height, maxX = -1, maxY = -1;

  // 1. Edge touches (borders: x=0, x=w-1, y=0, y=h-1)
  const edgeTouches = { top: 0, bottom: 0, left: 0, right: 0 };
  const edgeSampleColors = { top: [], bottom: [], left: [], right: [] };

  // 2. Green / chroma fringe detection
  let chromaGreenPixels = [];

  // 3. Low-alpha artifacts (translucent halos, matte residue)
  let lowAlphaFringes = 0;

  // 4. Pure white / pure black uncropped lines
  let solidColorBorders = { top: 0, bottom: 0, left: 0, right: 0 };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];
      const a = raw[idx + 3];

      if (a > 10) {
        nonZeroAlpha++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        // Check if on outer border
        if (y === 0) {
          edgeTouches.top++;
          if (edgeSampleColors.top.length < 5) edgeSampleColors.top.push({ x, y, r, g, b, a });
        }
        if (y === height - 1) {
          edgeTouches.bottom++;
          if (edgeSampleColors.bottom.length < 5) edgeSampleColors.bottom.push({ x, y, r, g, b, a });
        }
        if (x === 0) {
          edgeTouches.left++;
          if (edgeSampleColors.left.length < 5) edgeSampleColors.left.push({ x, y, r, g, b, a });
        }
        if (x === width - 1) {
          edgeTouches.right++;
          if (edgeSampleColors.right.length < 5) edgeSampleColors.right.push({ x, y, r, g, b, a });
        }

        // Chroma-key green fringe
        if (g > 90 && g > r * 1.35 && g > b * 1.35) {
          if (chromaGreenPixels.length < 10) {
            chromaGreenPixels.push({ x, y, r, g, b, a });
          }
        }

        if (a > 10 && a < 60) {
          lowAlphaFringes++;
        }
      }
    }
  }

  // 5. Connected Component / Floating Stray Pixels Check
  // Downsample to a boolean 2D grid to quickly find isolated islands
  // We grid into 4x4 blocks or directly check pixels
  const isOpaque = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return raw[(y * width + x) * 4 + 3] > 15;
  };

  // Check 4 corners (0,0), (w-1,0), (0,h-1), (w-1,h-1) for uncropped rectangle artifacts
  const cornerArtifacts = [
    { corner: 'top-left', hasAlpha: isOpaque(0, 0), val: raw[3] },
    { corner: 'top-right', hasAlpha: isOpaque(width - 1, 0), val: raw[((width - 1)) * 4 + 3] },
    { corner: 'bottom-left', hasAlpha: isOpaque(0, height - 1), val: raw[((height - 1) * width) * 4 + 3] },
    { corner: 'bottom-right', hasAlpha: isOpaque(width - 1, height - 1), val: raw[((height - 1) * width + width - 1) * 4 + 3] },
  ].filter(c => c.hasAlpha);

  // 6. Spritesheet Frame Cell Check (if config has cols/rows)
  let cellClipping = null;
  if (config.cols && config.rows) {
    const cols = config.cols;
    const rows = config.rows;
    const cellW = width / cols;
    const cellH = height / rows;
    cellClipping = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cMinX = Math.round(c * cellW);
        const cMaxX = Math.round((c + 1) * cellW) - 1;
        const cMinY = Math.round(r * cellH);
        const cMaxY = Math.round((r + 1) * cellH) - 1;

        // Check if pixels in this cell touch the cell boundary
        let touchCellLeft = 0, touchCellRight = 0, touchCellTop = 0, touchCellBottom = 0;
        for (let y = cMinY; y <= cMaxY; y++) {
          if (isOpaque(cMinX, y)) touchCellLeft++;
          if (isOpaque(cMaxX, y)) touchCellRight++;
        }
        for (let x = cMinX; x <= cMaxX; x++) {
          if (isOpaque(x, cMinY)) touchCellTop++;
          if (isOpaque(x, cMaxY)) touchCellBottom++;
        }

        if (touchCellLeft > 0 || touchCellRight > 0 || touchCellTop > 0 || touchCellBottom > 0) {
          cellClipping.push({
            frame: r * cols + c,
            col: c, row: r,
            touches: { left: touchCellLeft, right: touchCellRight, top: touchCellTop, bottom: touchCellBottom }
          });
        }
      }
    }
  }

  return {
    file: filePath,
    width,
    height,
    hasAlpha,
    nonZeroAlphaPct: ((nonZeroAlpha / totalPixels) * 100).toFixed(1) + '%',
    bbox: {
      minX, minY, maxX, maxY,
      w: maxX >= minX ? maxX - minX + 1 : 0,
      h: maxY >= minY ? maxY - minY + 1 : 0,
      padTop: minY,
      padBottom: height - 1 - maxY,
      padLeft: minX,
      padRight: width - 1 - maxX,
    },
    edgeTouches,
    edgeSampleColors,
    cornerArtifacts,
    greenPixelCount: chromaGreenPixels.length > 0 ? 'HAS_GREEN' : 0,
    chromaGreenPixels,
    lowAlphaFringes,
    cellClipping
  };
}

async function run() {
  const targets = [
    // 1. Stevunt Spritesheets
    { path: 'public/Assets/Character/Stevunt-idle.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Character/Stevunt-iso_walk_down.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Character/Stevunt-iso_walk_right.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Character/Stevunt-iso_walk_up-trimmed.png', cols: 4, rows: 2 },

    // 2. Pak Sutrisno Sprites
    { path: 'public/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Character/pak-sutrisno-portrait.png' },
    { path: 'public/Assets/Character/pak-sutrisno-avatar.png' },

    // 3. Pak Joko Satpam
    { path: 'public/Assets/Character/pak-joko-satpam.png' },
    { path: 'public/Assets/Character/pak-joko-avatar.png' },

    // 4. Classroom Teachers
    { path: 'public/Assets/Building/Ruang VII-A/Bu Sari.webp' },
    { path: 'public/Assets/Building/Ruang VII-B/Pak Bambang.png' },
    { path: 'public/Assets/Building/Ruang VIII-A/Bu Rina.webp' },
    { path: 'public/Assets/Building/Ruang VIII-B/Pak Setiawan.webp' },
    { path: 'public/Assets/Building/Ruang IX/Pak Joko.webp' },

    // 5. Level 2 Sprites
    { path: 'public/Assets/Building/field/GuruOlahraga.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Building/field/walk_down_clean.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Building/field/walk_right_clean.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Building/field/walk_up_clean.png', cols: 4, rows: 2 },
    { path: 'public/Assets/Building/field/user-throw-trimmed.png', cols: 4, rows: 2 },

    // 6. Cat Sprites
    { path: 'public/Assets/CatPack/Idle.png', cols: 10, rows: 1 },
    { path: 'public/Assets/CatPack/Box3.png', cols: 4, rows: 1 },
    { path: 'public/Assets/CatPack/drculacat.png', cols: 6, rows: 1 }
  ];

  const results = [];
  for (const t of targets) {
    const res = await auditSpriteDeep(t.path, t);
    results.push(res);
  }

  fs.writeFileSync('deep_audit_report.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Deep audit complete. Written to deep_audit_report.json');
}

run().catch(console.error);
