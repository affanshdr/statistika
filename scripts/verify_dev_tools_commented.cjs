const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Visit level 1
  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check if teleport button is present in DOM
  const teleportBtn = await page.$('[data-testid="btn-teleport-pak-sutrisno"]');
  console.log('Teleport button in DOM:', teleportBtn !== null ? 'FOUND (VISIBLE)' : 'NOT FOUND (HIDDEN/COMMENTED OUT)');

  // Take screenshot of main gameplay HUD
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
  await page.screenshot({ path: path.join(artifactDir, 'dev_tools_check_hud.png') });
  console.log('HUD screenshot saved to dev_tools_check_hud.png');

  // Check dev buttons in DOM across the page
  const devSkipBtn = await page.$('[data-testid="btn-dev-tools-toggle"]');
  console.log('Dev Skip button in DOM:', devSkipBtn !== null ? 'FOUND (VISIBLE)' : 'NOT FOUND (HIDDEN/COMMENTED OUT)');

  const devInstantWinBtn = await page.$('[data-testid="btn-dev-instant-win"]');
  console.log('Dev Instant Win button in DOM:', devInstantWinBtn !== null ? 'FOUND (VISIBLE)' : 'NOT FOUND (HIDDEN/COMMENTED OUT)');

  const devPassWaliBtn = await page.$('[data-testid="btn-dev-pass-wali-quiz"]');
  console.log('Dev Pass Wali Quiz button in DOM:', devPassWaliBtn !== null ? 'FOUND (VISIBLE)' : 'NOT FOUND (HIDDEN/COMMENTED OUT)');

  await browser.close();
  console.log('Verification complete!');
})();
