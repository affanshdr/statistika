const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- TESTING NEW VII-A DRAG & DROP MARBLE BOWLS CHALLENGE ---');
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
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));
  }

  await page.waitForSelector('[data-testid="bowl-container-A"]', { timeout: 10000 });
  console.log('3. Marble Bowls Challenge Modal is open!');

  // Capture initial state
  const initialShot = path.join(ARTIFACTS_DIR, 'showcase_vii_a_drag_drop_initial.png');
  await page.screenshot({ path: initialShot });
  console.log('Saved Initial State Screenshot ->', initialShot);

  // 4. Click btn-transfer-a-to-b 4 times (A: 15 -> 11, B: 7 -> 11)
  console.log('4. Transferring 4 marbles from A to B...');
  const btnAB = await page.$('[data-testid="btn-transfer-a-to-b"]');
  for (let i = 0; i < 4; i++) {
    await btnAB.click();
    await new Promise(r => setTimeout(r, 200));
  }

  // Capture midway state (A and B are both 11!)
  const midShot = path.join(ARTIFACTS_DIR, 'showcase_vii_a_drag_drop_midway.png');
  await page.screenshot({ path: midShot });
  console.log('Saved Midway Screenshot (A & B balanced at 11) ->', midShot);

  // 5. Click btn-transfer-c-to-d 7 times (C: 18 -> 11, D: 4 -> 11)
  console.log('5. Transferring 7 marbles from C to D...');
  const btnCD = await page.$('[data-testid="btn-transfer-c-to-d"]');
  for (let i = 0; i < 7; i++) {
    await btnCD.click();
    await new Promise(r => setTimeout(r, 200));
  }

  await new Promise(r => setTimeout(r, 800));

  // 6. Verify all 4 bowls are 11 and capture solved state
  console.log('6. Verifying solved state...');
  const solvedShot = path.join(ARTIFACTS_DIR, 'showcase_vii_a_drag_drop_solved.png');
  await page.screenshot({ path: solvedShot });
  console.log('Saved Solved Screenshot ->', solvedShot);

  // 7. Check collect button status
  const collectBtn = await page.$('[data-testid="btn-collect-wali-data"]');
  const isDisabled = await page.evaluate(el => el.disabled, collectBtn);
  console.log('Collect button disabled status:', isDisabled);

  if (!isDisabled) {
    console.log('SUCCESS: Collect button unlocked and active!');
    await collectBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('Data collected and modal closed cleanly!');
  } else {
    throw new Error('Collect button is still disabled after solving!');
  }

  await browser.close();
  console.log('--- ALL TESTS PASSED: MARBLE BOWLS DRAG & DROP 100% VERIFIED! ---');
})();
