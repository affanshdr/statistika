const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Verifying clean Tahap 1 corkboard (without redundant banner)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 600));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Teleport to Pak Sutrisno via 't'
  console.log('Teleporting to Pak Sutrisno...');
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss tutorial modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot clean Tahap 1
  const shotStage1 = path.join(ARTIFACTS_DIR, 'corkboard_clean_stage1_no_redundant_banner.png');
  await page.screenshot({ path: shotStage1 });
  console.log('Saved Clean Tahap 1 view ->', shotStage1);

  await browser.close();
  console.log('Verification completed successfully!');
})();
