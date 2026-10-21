const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- TESTING REPLAY STAR UPDATE SCENARIO ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Visit Lobby first to check 3 stars from previous run
  console.log('1. Visiting Lobby...');
  await page.goto('http://localhost:3000/siswa/game/lobby', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  let badge = await page.$('[data-testid="level-1-stars"]');
  let text = badge ? await page.evaluate(el => el.innerText.trim().replace(/\s+/g, ' '), badge) : null;
  console.log('Initial Lobby Stars for Level 1:', text);

  // 2. Start replay Level 1
  console.log('2. Replaying Level 1 with 8 minutes elapsed (Target: 2 Stars)...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=main', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 1000));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Click on the game canvas/body to ensure keyboard focus
  await page.click('body').catch(() => {});
  await new Promise(r => setTimeout(r, 300));

  // Teleport to Pak Sutrisno
  console.log('Teleporting to Pak Sutrisno via t...');
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss tutorial
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Auto Win
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const autoWin = btns.find(b => b.innerText.includes('Auto Win'));
    if (autoWin) autoWin.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Simulate 480 seconds elapsed (8 minutes) in sessionStartTime to earn 2 stars (6 - 10 mins)
  await page.evaluate(() => {
    if (window.__DEV_SET_SESSION_TIME__) {
      window.__DEV_SET_SESSION_TIME__(480);
    }
  });

  // Click finish corkboard button
  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Advance chit-chat Step 1 -> 2 -> 3
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1200));

  // Wait for Mission Complete modal
  await page.waitForSelector('[data-testid="btn-mission-complete-finish"]', { timeout: 8000 });
  
  // Capture 2-star screenshot
  const shotModal2 = path.join(ARTIFACTS_DIR, 'popup_misi_selesai_2stars.png');
  await page.screenshot({ path: shotModal2 });
  console.log('Saved 2 Stars Popup Screenshot ->', shotModal2);

  // Click Selesai
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="btn-mission-complete-finish"]');
    if (btn) btn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  // Verify updated stars in Lobby
  badge = await page.$('[data-testid="level-1-stars"]');
  text = badge ? await page.evaluate(el => el.innerText.trim().replace(/\s+/g, ' '), badge) : null;
  console.log('Updated Lobby Stars after replay:', text);

  const shotLobby2 = path.join(ARTIFACTS_DIR, 'map_lobby_level1_updated_stars.png');
  await page.screenshot({ path: shotLobby2 });
  console.log('Saved Updated Map Lobby Screenshot ->', shotLobby2);

  await browser.close();
  console.log('--- REPLAY UPDATE VERIFICATION COMPLETE ---');
})();
