const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to game...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click Mulai
  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Enter Ruang VIII-A (B1)
  console.log('Entering Ruang VIII-A (B1)...');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('B1'));
  await new Promise(r => setTimeout(r, 1500));

  const shotPathA = path.join(ARTIFACTS_DIR, 'verifikasi_viii_a_optimal.png');
  await page.screenshot({ path: shotPathA });
  console.log('Saved Ruang VIII-A screenshot to:', shotPathA);

  // Exit room
  await page.evaluate(() => window.__DEV_EXIT_ROOM__());
  await new Promise(r => setTimeout(r, 1200));

  // Enter Ruang VIII-B (B2)
  console.log('Entering Ruang VIII-B (B2)...');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('B2'));
  await new Promise(r => setTimeout(r, 1500));

  const shotPathB = path.join(ARTIFACTS_DIR, 'verifikasi_viii_b_optimal.png');
  await page.screenshot({ path: shotPathB });
  console.log('Saved Ruang VIII-B screenshot to:', shotPathB);

  await browser.close();
  console.log('In-game captures complete!');
})();
