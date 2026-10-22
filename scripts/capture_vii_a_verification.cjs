const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- CAPTURING VII-A VERIFICATION SCREENSHOTS ---');
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

  // Advance teacher cutscene:
  // Step 1: teacher_ask ("Halo! Ada perlu apa kamu datang ke Kelas VII-A?")
  console.log('Step 1: teacher_ask');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  // Step 2: player_explain ("Permisi Bu! Saya Stevunt...")
  console.log('Step 2: player_explain');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 800));

  // Now we are at teacher_reply ("Ini data screen time 5 siswa Kelas VII-A...")
  console.log('Step 3: teacher_reply dialogue!');
  const shotDialogue = path.join(ARTIFACTS_DIR, 'showcase_vii_a_teacher_reply_dialogue.png');
  await page.screenshot({ path: shotDialogue });
  console.log('Saved Bu Sari Dialogue Screenshot ->', shotDialogue);

  // Advance to open the modal
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 800));

  await page.waitForSelector('[data-testid="btn-close-wali-kelas"]', { timeout: 10000 });
  console.log('Modal opened!');

  const shotModal = path.join(ARTIFACTS_DIR, 'showcase_vii_a_marble_modal_clean.png');
  await page.screenshot({ path: shotModal });
  console.log('Saved Clean Modal Screenshot ->', shotModal);

  // Click option 11 to show correct feedback
  const opt11 = await page.$('[data-testid="wali-quiz-option-11"]');
  if (opt11) {
    console.log('Clicking option 11...');
    await opt11.click();
    await new Promise(r => setTimeout(r, 800));

    const shotFeedback = path.join(ARTIFACTS_DIR, 'showcase_vii_a_marble_feedback_clean.png');
    await page.screenshot({ path: shotFeedback });
    console.log('Saved Feedback Screenshot ->', shotFeedback);
  }

  await browser.close();
  console.log('--- ALL VII-A SCREENSHOTS CAPTURED SUCCESSFULLY! ---');
})();
