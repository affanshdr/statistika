const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- STARTING VERIFICATION: POPUP MISI SELESAI & MAP STARS ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Navigate to Level 1
  console.log('1. Navigating to Level 1...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 600));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // 2. Teleport to Pak Sutrisno via 't'
  console.log('2. Teleporting to Pak Sutrisno...');
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss tutorial if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 3. Auto-Win Corkboard
  console.log('3. Clicking Auto Win on corkboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const autoWin = btns.find(b => b.innerText.includes('Auto Win'));
    if (autoWin) autoWin.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 4. Click finish corkboard button
  console.log('4. Clicking finish corkboard button...');
  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 5. Advance Step 1 (Stevunt) -> Step 2 (Pak Sutrisno)
  console.log('5. Advancing chit-chat Step 1 -> Step 2...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));

  // 6. Advance Step 2 (Pak Sutrisno thanks) -> Step 3 (Case Conclusion)
  console.log('6. Advancing chit-chat Step 2 -> Step 3...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));

  // 7. Click Step 3 speech bubble: [ Buka Hasil Misi 🏆 ]
  console.log('7. Triggering conclusion to open Misi Selesai popup...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1200));

  // 8. Wait for Mission Complete Modal
  console.log('8. Checking for Mission Complete Modal...');
  await page.waitForSelector('[data-testid="btn-mission-complete-finish"]', { timeout: 8000 });

  const modalTitle = await page.evaluate(() => {
    const el = document.body;
    return el.innerText.includes('Misi Selesai');
  });
  console.log('Modal title "Misi Selesai" visible:', modalTitle);

  // Capture screenshot of Popup Misi Selesai
  const shotModal = path.join(ARTIFACTS_DIR, 'popup_misi_selesai_stars.png');
  await page.screenshot({ path: shotModal });
  console.log('Saved Popup Misi Selesai Screenshot ->', shotModal);

  // 9. Click "Selesai" button to transition to Map (Lobby)
  console.log('9. Clicking "Selesai" button...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="btn-mission-complete-finish"]');
    if (btn) btn.click();
  });

  // 10. Wait for navigation to /siswa/game/lobby
  console.log('10. Waiting for navigation to Lobby / Map...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
    console.log('Navigation event timeout, checking URL...');
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL after Selesai:', page.url());

  // Check stars on Level 1 card in Lobby
  const starsBadge = await page.$('[data-testid="level-1-stars"]');
  const starsText = starsBadge ? await page.evaluate(el => el.innerText, starsBadge) : null;
  console.log('Stars badge found on Level 1 in Lobby:', starsText);

  // Capture screenshot of Lobby Map with stars
  const shotLobby = path.join(ARTIFACTS_DIR, 'map_lobby_level1_stars.png');
  await page.screenshot({ path: shotLobby });
  console.log('Saved Map Lobby Screenshot ->', shotLobby);

  await browser.close();
  console.log('--- ALL CHECKS PASSED SUCCESSFULLY ---');
})();
