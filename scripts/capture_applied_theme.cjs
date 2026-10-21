const puppeteer = require('puppeteer');
const path = require('path');

async function captureInGame() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to http://localhost:3000/siswa/game/level/1?dev=true ...');
  await page.goto('http://localhost:3000/siswa/game/level/1?dev=true', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 2000));

  // 1. Capture Gate Intro Dialogue Bubble (Stevunt), Top-Left (Kembali & Audio), Right (Misi HUD)
  await page.screenshot({ path: path.join(artifactDir, 'theme_applied_gate_intro.png') });
  console.log('Saved theme_applied_gate_intro.png');

  // 2. Open Quest Drawer
  const questBtn = await page.$('#btn-quest-log');
  if (questBtn) {
    await questBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'theme_applied_quest_drawer.png') });
    console.log('Saved theme_applied_quest_drawer.png');

    const closeBtn = await page.$('#quest-log-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // 3. Click Stevunt bubble step 1 and step 2
  const bubble = await page.$('#gate-intro-bubble');
  if (bubble) {
    await bubble.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'theme_applied_gate_intro_step2.png') });
    console.log('Saved theme_applied_gate_intro_step2.png');

    await bubble.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // 4. Click Pak Joko or press E
  // In dev mode, we can click on Pak Joko or click satpam button if visible
  const satpamBtn = await page.$('#btn-gate-satpam').catch(() => null);
  if (satpamBtn) {
    await satpamBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'theme_applied_satpam_cloud.png') });
    console.log('Saved theme_applied_satpam_cloud.png');
  }

  await browser.close();
  console.log('Done capturing live in-game theme screenshots!');
}

captureInGame().catch(console.error);
