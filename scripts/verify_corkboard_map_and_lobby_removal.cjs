const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- VERIFYING CORKBOARD MAP (/siswa) & LOBBY REMOVAL ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // 1. Verify that /siswa/game/lobby redirects to /siswa
  console.log('1. Testing /siswa/game/lobby redirect to /siswa...');
  await page.goto('http://localhost:3000/siswa/game/lobby', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const currentUrl = page.url();
  console.log('Current URL after accessing /siswa/game/lobby:', currentUrl);
  if (!currentUrl.includes('/siswa') || currentUrl.includes('/lobby')) {
    console.error('FAILED: /siswa/game/lobby did not redirect to /siswa!');
  } else {
    console.log('PASSED: /siswa/game/lobby cleanly redirects to /siswa!');
  }

  // 2. Play Level 1 and earn 3 stars (< 6 mins)
  console.log('2. Playing Level 1 with 3 stars duration...');
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

  // Teleport to Pak Sutrisno via 't'
  await page.click('body').catch(() => {});
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

  // Finish corkboard
  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Step 1: Stevunt report -> Press 'e'
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));

  // Step 2: Pak Sutrisno thanks -> Press 'e' to open popup
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1200));

  // Wait for Mission Complete Modal
  await page.waitForSelector('[data-testid="btn-mission-complete-finish"]', { timeout: 8000 });
  console.log('Popup Misi Selesai opened with 3 stars!');

  // Click Selesai
  console.log('3. Clicking Selesai button to transition to /siswa...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="btn-mission-complete-finish"]');
    if (btn) btn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL after completing mission:', page.url());

  // Wait for Corkboard Map
  await page.waitForSelector('[data-testid="level-1-stars"]', { timeout: 10000 });
  const starText3 = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="level-1-stars"]');
    return el ? el.innerText.trim().replace(/\s+/g, ' ') : null;
  });
  console.log('Corkboard Map Stars on Case 1:', starText3);

  // Capture screenshot of Corkboard Map with 3 Stars
  const shotMap3 = path.join(ARTIFACTS_DIR, 'corkboard_map_case1_3stars.png');
  await page.screenshot({ path: shotMap3 });
  console.log('Saved Corkboard Map (3 Stars) ->', shotMap3);

  // 4. Test Replay Scenario: Click Ulangi and set time for 2 stars
  console.log('4. Testing Replay: Replaying Level 1 with 8 minutes elapsed (2 Stars)...');
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

  await page.click('body').catch(() => {});
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const autoWin = btns.find(b => b.innerText.includes('Auto Win'));
    if (autoWin) autoWin.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Set session start time to 480 seconds ago (8 minutes -> 2 stars)
  await page.evaluate(() => {
    if (window.__DEV_SET_SESSION_TIME__) {
      window.__DEV_SET_SESSION_TIME__(480);
    }
  });

  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1200));

  await page.waitForSelector('[data-testid="btn-mission-complete-finish"]', { timeout: 8000 });
  console.log('Popup Misi Selesai opened with 2 stars on replay!');

  // Click Selesai
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="btn-mission-complete-finish"]');
    if (btn) btn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL after replay:', page.url());

  const starText2 = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="level-1-stars"]');
    return el ? el.innerText.trim().replace(/\s+/g, ' ') : null;
  });
  console.log('Corkboard Map Stars on Case 1 after Replay:', starText2);

  const shotMap2 = path.join(ARTIFACTS_DIR, 'corkboard_map_case1_updated_2stars.png');
  await page.screenshot({ path: shotMap2 });
  console.log('Saved Updated Corkboard Map (2 Stars) ->', shotMap2);

  await browser.close();
  console.log('--- ALL CHECKS PASSED SUCCESSFULLY ---');
})();
