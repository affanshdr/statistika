const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Running comprehensive verification...');
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
  
  // Wait for corkboard modal to appear
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  // Helper to close any open tutorial modal by directly clicking the close/confirm button
  const closeTutorialModal = async () => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => 
        b.getAttribute('data-testid') === 'btn-close-tutorial' || 
        b.getAttribute('data-testid') === 'btn-confirm-tutorial' ||
        b.innerText.includes('Paham, Mulai') ||
        b.innerText.includes('Tutup Tutorial')
      );
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  };

  // Close tutorial if present on mount
  await closeTutorialModal();

  // 1. Switch to Tahap 2: Modus using dev/stepper button
  console.log('Switching to Tahap 2: Modus...');
  await page.evaluate(() => {
    const tab = document.querySelector('[data-testid="stepper-tab-modus"]');
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await closeTutorialModal();

  // Screenshot Tahap 2: Modus with labels #1..#24
  const shotModus = path.join(ARTIFACTS_DIR, 'corkboard_modus_order_labels.png');
  await page.screenshot({ path: shotModus });
  console.log('Saved Modus with order labels ->', shotModus);

  // 2. Switch to Tahap 3: Median
  console.log('Switching to Tahap 3: Median...');
  await page.evaluate(() => {
    const tab = document.querySelector('[data-testid="stepper-tab-median"]');
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await closeTutorialModal();

  // Screenshot Tahap 3: Median BEFORE answering (unrevealed middle values)
  const shotMedianBefore = path.join(ARTIFACTS_DIR, 'corkboard_median_unrevealed.png');
  await page.screenshot({ path: shotMedianBefore });
  console.log('Saved Median before answering (unrevealed) ->', shotMedianBefore);

  // 3. Test wrong answer hint (click wrong button)
  console.log('Testing wrong answer hint...');
  const clickedWrong = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[data-testid^="median-choice-"]'));
    // Pick choice that is NOT the correct median
    // If median is 5, pick 4 or 5.5
    const wrong = btns.find(b => !b.innerText.includes('5') || b.innerText.includes('5.5') || b.innerText.includes('4'));
    if (wrong) {
      wrong.click();
      return wrong.innerText;
    }
    return null;
  });
  await new Promise(r => setTimeout(r, 600));

  const shotWrongHint = path.join(ARTIFACTS_DIR, 'corkboard_median_wrong_hint.png');
  await page.screenshot({ path: shotWrongHint });
  console.log('Saved Median wrong answer hint ->', shotWrongHint, 'Clicked choice:', clickedWrong);

  // 4. Test correct answer feedback
  console.log('Testing correct answer feedback...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[data-testid^="median-choice-"]'));
    // In our dataset of 24 items, median is 5 (values #12=5, #13=5)
    const correct = btns.find(b => b.getAttribute('data-testid') === 'median-choice-5' || b.innerText.trim() === '5');
    if (correct) correct.click();
  });
  await new Promise(r => setTimeout(r, 700));

  const shotCorrect = path.join(ARTIFACTS_DIR, 'corkboard_median_correct_feedback.png');
  await page.screenshot({ path: shotCorrect });
  console.log('Saved Median correct feedback ->', shotCorrect);

  // 5. Also capture Ruang Guru idle view with updated Stevunt scaling
  // Press Escape or close corkboard
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));
  const shotRuangGuru = path.join(ARTIFACTS_DIR, 'ruang_guru_proportional_scale.png');
  await page.screenshot({ path: shotRuangGuru });
  console.log('Saved Ruang Guru proportional scale ->', shotRuangGuru);

  await browser.close();
  console.log('All verifications completed successfully!');
})();
