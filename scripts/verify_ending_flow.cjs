const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Verifying Ending Flow & Concluding Chit-Chat...');
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

  // 1. Teleport to Pak Sutrisno via 't'
  console.log('Teleporting to Pak Sutrisno...');
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss tutorial if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 2. Click Auto Win on the corkboard
  console.log('Clicking Auto Win on corkboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const autoWin = btns.find(b => b.innerText.includes('Auto Win'));
    if (autoWin) autoWin.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Click "🏆 SELESAIKAN KASUS #01 →"
  console.log('Clicking finish corkboard button...');
  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 4. Verify Step 1 of Concluding Chit-Chat: Stevunt Reports to Pak Sutrisno
  console.log('Capturing Post-Mission Chit-Chat Step 1: Stevunt Reports...');
  const shotStep1 = path.join(ARTIFACTS_DIR, 'ending_chit_chat_step1_report.png');
  await page.screenshot({ path: shotStep1 });
  console.log('Saved Step 1 (Stevunt Reports) ->', shotStep1);

  // 5. Advance to Step 2: Pak Sutrisno Thanks Stevunt
  console.log('Advancing to Step 2: Pak Sutrisno Thanks Stevunt...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));
  const shotStep2 = path.join(ARTIFACTS_DIR, 'ending_chit_chat_step2_thanks.png');
  await page.screenshot({ path: shotStep2 });
  console.log('Saved Step 2 (Pak Sutrisno Thanks) ->', shotStep2);

  // 6. Advance to Step 3: Pak Sutrisno Concludes Case
  console.log('Advancing to Step 3: Pak Sutrisno Concludes Case...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));
  const shotStep3 = path.join(ARTIFACTS_DIR, 'ending_chit_chat_step3_conclusion.png');
  await page.screenshot({ path: shotStep3 });
  console.log('Saved Step 3 (Case Conclusion) ->', shotStep3);

  // 7. Finish Level 1 & Transition to Results
  console.log('Finishing Level 1 & Transitioning to Results...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 2500));

  console.log('Current URL:', page.url());
  const shotResults = path.join(ARTIFACTS_DIR, 'results_page_warm_theme.png');
  await page.screenshot({ path: shotResults, fullPage: true });
  console.log('Saved Themed Results Page ->', shotResults);

  await browser.close();
  console.log('Ending flow verification finished successfully!');
})();
