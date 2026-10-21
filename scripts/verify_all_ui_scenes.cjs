const puppeteer = require('puppeteer');
const path = require('path');

async function verifyAllUI() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Gate Intro & HUD
  console.log('1. Checking Gate Intro & HUD...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demoMode=true&phase=exploration&zone=gate', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#gate-intro-bubble', { timeout: 10000 }).catch(() => null);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_ui_01_gate_theme.png') });
  console.log('Saved verify_ui_01_gate_theme.png');

  // 2. Open Quest Log Drawer
  console.log('2. Checking Quest Log Drawer...');
  const questBtn = await page.$('[data-testid="quest-log-trigger"]');
  if (questBtn) {
    await questBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'verify_ui_02_quest_drawer.png') });
    console.log('Saved verify_ui_02_quest_drawer.png');
    
    // Close quest drawer
    const closeBtn = await page.$('#quest-log-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. Check Classroom VII-A
  console.log('3. Checking Classroom VII-A...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demoMode=true&phase=exploration&room=VII-A', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'verify_ui_03_classroom_vii_a.png') });
  console.log('Saved verify_ui_03_classroom_vii_a.png');

  // Click teacher dialogue button if available
  const talkBtn = await page.$('[data-testid="btn-talk-teacher"]').catch(() => null);
  if (talkBtn) {
    await talkBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'verify_ui_04_wali_kelas_modal.png') });
    console.log('Saved verify_ui_04_wali_kelas_modal.png');
  }

  // 4. Check Ruang Guru Pak Sutrisno
  console.log('4. Checking Ruang Guru...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demoMode=true&phase=exploration&room=RG', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'verify_ui_05_ruang_guru.png') });
  console.log('Saved verify_ui_05_ruang_guru.png');

  await browser.close();
  console.log('All UI scene screenshots captured successfully!');
}

verifyAllUI().catch(console.error);
