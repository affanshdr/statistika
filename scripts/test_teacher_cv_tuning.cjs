const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const configPath = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/config/level1MapConfig.ts';

// Candidate configs based on CV analysis
// A1: Bu Sari (sprite sheet 5x5): board center x=617, bottom y=250.
// A2: Pak Bambang: board center x=686, bottom y=301.
// B1: Bu Rina: board center x=694, bottom y=283.
// B2: Pak Setiawan: board center x=506, bottom y=274.

const TUNING_CONFIGS = {
  A1: { x: 620, y: 380, size: 280 },
  A2: { x: 680, y: 350, size: 120 },
  B1: { x: 685, y: 350, size: 120 },
  B2: { x: 515, y: 345, size: 120 },
};

(async () => {
  // 1. Patch level1MapConfig.ts with candidate values
  let code = fs.readFileSync(configPath, 'utf8');

  // Patch A1
  code = code.replace(
    /A1:[\s\S]*?teacher:\s*\{[\s\S]*?\}/,
    `A1: {
    id: 'A1',
    name: 'Ruang VII-A',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VII-A/VII-A.webp',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 940, y: 540 },
    teacher: {
      name: 'Bu Sari (Wali Kelas VII-A)',
      x: ${TUNING_CONFIGS.A1.x},
      y: ${TUNING_CONFIGS.A1.y},
      size: ${TUNING_CONFIGS.A1.size},
      spriteUrl: '/Assets/Building/Ruang VII-A/Bu Sari.webp',
      cols: 5,
      rows: 5,
      totalFrames: 24,
      pingPong: false,
      speedMs: 90,
      showGlow: false,
      hotspotW: 140,
      hotspotH: 220
    }`
  );

  // Patch A2
  code = code.replace(
    /A2:[\s\S]*?teacher:\s*\{[\s\S]*?\}/,
    `A2: {
    id: 'A2',
    name: 'Ruang VII-B',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VII-B/VII-B.webp',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 920, y: 540 },
    teacher: {
      name: 'Pak Bambang (Wali Kelas VII-B)',
      x: ${TUNING_CONFIGS.A2.x},
      y: ${TUNING_CONFIGS.A2.y},
      size: ${TUNING_CONFIGS.A2.size},
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang VII-B/Pak Bambang.png',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    }`
  );

  // Patch B1
  code = code.replace(
    /B1:[\s\S]*?teacher:\s*\{[\s\S]*?\}/,
    `B1: {
    id: 'B1',
    name: 'Ruang VIII-A',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VIII-A/VIII-A.webp',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 930, y: 540 },
    teacher: {
      name: 'Bu Rina (Wali Kelas VIII-A)',
      x: ${TUNING_CONFIGS.B1.x},
      y: ${TUNING_CONFIGS.B1.y},
      size: ${TUNING_CONFIGS.B1.size},
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang VIII-A/Bu Rina.webp',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    }`
  );

  // Patch B2
  code = code.replace(
    /B2:[\s\S]*?teacher:\s*\{[\s\S]*?\}/,
    `B2: {
    id: 'B2',
    name: 'Ruang VIII-B',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VIII-B/VIII-B.webp',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 930, y: 540 },
    teacher: {
      name: 'Pak Setiawan (Wali Kelas VIII-B)',
      x: ${TUNING_CONFIGS.B2.x},
      y: ${TUNING_CONFIGS.B2.y},
      size: ${TUNING_CONFIGS.B2.size},
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang VIII-B/Pak Setiawan.webp',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    }`
  );

  fs.writeFileSync(configPath, code, 'utf8');
  console.log('level1MapConfig.ts updated with CV candidate configs!');

  // Wait 2s for HMR/compile
  await new Promise(r => setTimeout(r, 2000));

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }
  await new Promise(r => setTimeout(r, 800));

  const rooms = [
    { id: 'A1', slug: 'vii_a', label: 'Ruang VII-A (Bu Sari)' },
    { id: 'A2', slug: 'vii_b', label: 'Ruang VII-B (Pak Bambang)' },
    { id: 'B1', slug: 'viii_a', label: 'Ruang VIII-A (Bu Rina)' },
    { id: 'B2', slug: 'viii_b', label: 'Ruang VIII-B (Pak Setiawan)' },
  ];

  for (const room of rooms) {
    await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), room.id);
    await new Promise(r => setTimeout(r, 1500));

    const shotPath = path.join(ARTIFACTS_DIR, `cv_test_${room.slug}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot -> ${shotPath}`);

    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
  console.log('ALL CV CANDIDATE SCREENSHOTS CAPTURED!');
})();
