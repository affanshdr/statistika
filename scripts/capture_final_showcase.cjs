const puppeteer = require('puppeteer');
const path = require('path');

async function captureFinalShowcase() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Gate Intro with Stevunt bubble & Misi button
  console.log('1. Gate Intro & HUD...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demoMode=true&phase=exploration&zone=gate', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#gate-intro-bubble', { timeout: 10000 }).catch(() => null);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'final_showcase_01_gate.png') });
  console.log('Saved final_showcase_01_gate.png');

  // 2. Open Quest Drawer
  console.log('2. Quest Log Drawer...');
  const questBtn = await page.$('[data-testid="quest-log-trigger"]');
  if (questBtn) {
    await questBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'final_showcase_02_quest_drawer.png') });
    console.log('Saved final_showcase_02_quest_drawer.png');
    
    const closeBtn = await page.$('#quest-log-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. Hallway with Doors & Gateway Marker
  console.log('3. Hallway...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demoMode=true&demoStep=exploration', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'final_showcase_03_hallway.png') });
  console.log('Saved final_showcase_03_hallway.png');

  // 4. Trigger Sanction Modal (or click Teleport)
  console.log('4. Teleport to Pak Sutrisno...');
  const tpBtn = await page.$('[data-testid="btn-teleport-pak-sutrisno"]');
  if (tpBtn) {
    await tpBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'final_showcase_04_pak_sutrisno.png') });
    console.log('Saved final_showcase_04_pak_sutrisno.png');
  }

  await browser.close();
  console.log('All showcase screenshots captured successfully!');
}

captureFinalShowcase().catch(console.error);
