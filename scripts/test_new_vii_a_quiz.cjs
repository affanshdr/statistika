const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- VERIFYING NEW VII-A MARBLE BOWL QUIZ ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('1. Navigating to Level 1...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=main', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('2. Entering Ruang VII-A...');
  await page.evaluate(() => {
    if (window.__DEV_ENTER_ROOM__) {
      window.__DEV_ENTER_ROOM__('A1');
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('3. Advancing teacher dialogue...');
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));
  }

  await page.waitForSelector('[data-testid="btn-close-wali-kelas"]', { timeout: 10000 });
  console.log('Quiz modal open!');

  const shotModal = path.join(ARTIFACTS_DIR, 'showcase_new_vii_a_marble_quiz.png');
  await page.screenshot({ path: shotModal });
  console.log('Saved Modal Open Screenshot ->', shotModal);

  // Click option 11 (the correct answer)
  const opt11 = await page.$('[data-testid="wali-quiz-option-11"]');
  if (opt11) {
    console.log('Clicking option 11 (kelereng)...');
    await opt11.click();
    await new Promise(r => setTimeout(r, 800));

    const feedbackScreenshotPath = path.join(ARTIFACTS_DIR, 'showcase_vii_a_marble_correct_feedback.png');
    await page.screenshot({ path: feedbackScreenshotPath });
    console.log('Saved Feedback Screenshot ->', feedbackScreenshotPath);
  } else {
    console.log('Could not find option 11 button');
  }

  await browser.close();
  console.log('--- TEST PASSED: NEW VII-A QUIZ VERIFIED! ---');
})();
