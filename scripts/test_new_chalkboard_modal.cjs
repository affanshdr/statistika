const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- TESTING CHALKBOARD MODAL & ORANGE BOWLS & PLAYER USERNAME ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('1. Setting up mock player username: "RAYHAN"...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({
      id: 'test-player-123',
      username: 'RAYHAN',
      displayName: 'Rayhan Detektif'
    }));
    localStorage.setItem('student', JSON.stringify({
      id: 'test-player-123',
      name: 'RAYHAN',
      username: 'RAYHAN'
    }));
  });

  console.log('2. Navigating to Level 1 Gate Zone to test Cloud Chat username...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=gate', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Capture Gate Cloud Chat showing player username
  console.log('3. Capturing Gate Cloud Chat with username...');
  await new Promise(r => setTimeout(r, 1000));
  const shotGateChat = path.join(ARTIFACTS_DIR, 'showcase_gate_cloud_chat_username.png');
  await page.screenshot({ path: shotGateChat });
  console.log('Saved Gate Cloud Chat Screenshot ->', shotGateChat);

  console.log('4. Entering Ruang VII-A to verify Chalkboard & Orange Bowls...');
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
  console.log('5. Chalkboard Modal is open!');

  // Capture initial state:
  const shotInitial = path.join(ARTIFACTS_DIR, 'showcase_chalkboard_orange_bowls_initial.png');
  await page.screenshot({ path: shotInitial });
  console.log('Saved Initial Chalkboard Modal Screenshot ->', shotInitial);

  // 6. Transfer 4 marbles from A to B:
  console.log('6. Transferring 4 marbles from Mangkuk A to B (click-to-transfer)...');
  const bowlA = await page.$('[data-testid="bowl-container-A"]');
  const bowlB = await page.$('[data-testid="bowl-container-B"]');
  for (let i = 0; i < 4; i++) {
    await bowlA.click();
    await new Promise(r => setTimeout(r, 120));
    await bowlB.click();
    await new Promise(r => setTimeout(r, 200));
  }

  // 7. Transfer 7 marbles from C to D:
  console.log('7. Transferring 7 marbles from Mangkuk C to D...');
  const bowlC = await page.$('[data-testid="bowl-container-C"]');
  const bowlD = await page.$('[data-testid="bowl-container-D"]');
  for (let i = 0; i < 7; i++) {
    await bowlC.click();
    await new Promise(r => setTimeout(r, 120));
    await bowlD.click();
    await new Promise(r => setTimeout(r, 200));
  }

  await new Promise(r => setTimeout(r, 800));

  // 8. Capture solved state:
  const shotSolved = path.join(ARTIFACTS_DIR, 'showcase_chalkboard_orange_bowls_solved.png');
  await page.screenshot({ path: shotSolved });
  console.log('Saved Solved Chalkboard Modal Screenshot ->', shotSolved);

  // 9. Verify collect button is enabled
  const collectBtn = await page.$('[data-testid="btn-collect-wali-data"]');
  const isDisabled = await page.evaluate(el => el.disabled, collectBtn);
  console.log('Collect button disabled status:', isDisabled);

  if (!isDisabled) {
    console.log('SUCCESS: Data collect button unlocked and active!');
  } else {
    throw new Error('Collect button is still disabled after solving!');
  }

  await browser.close();
  console.log('--- ALL TESTS PASSED: CHALKBOARD MODAL & ORANGE BOWLS VERIFIED! ---');
})();
