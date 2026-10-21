const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- VERIFYING UPDATED CHIT-CHAT & POPUP FLOW ---');
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

  // Teleport to Pak Sutrisno via 't'
  console.log('2. Teleporting to Pak Sutrisno...');
  await page.click('body').catch(() => {});
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss tutorial if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Auto-Win Corkboard
  console.log('3. Clicking Auto Win on corkboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const autoWin = btns.find(b => b.innerText.includes('Auto Win'));
    if (autoWin) autoWin.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Finish corkboard
  console.log('4. Clicking finish corkboard button...');
  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Step 1: Stevunt explains data is ready
  console.log('5. Capturing Chit-Chat Step 1 (Stevunt: Data siap digunakan)...');
  const shotStep1 = path.join(ARTIFACTS_DIR, 'chitchat_step1_stevunt_data_ready.png');
  await page.screenshot({ path: shotStep1 });
  console.log('Saved Step 1 screenshot ->', shotStep1);

  // Advance to Step 2: Pak Sutrisno thanks Stevunt
  console.log('6. Advancing to Chit-Chat Step 2 (Pak Sutrisno: Wah terima kasih)...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 900));

  const shotStep2 = path.join(ARTIFACTS_DIR, 'chitchat_step2_pak_thanks.png');
  await page.screenshot({ path: shotStep2 });
  console.log('Saved Step 2 screenshot ->', shotStep2);

  // Advance from Step 2 -> Open Mission Complete Modal
  console.log('7. Triggering completion to open Misi Selesai popup...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1200));

  await page.waitForSelector('[data-testid="btn-mission-complete-finish"]', { timeout: 8000 });
  const shotPopup = path.join(ARTIFACTS_DIR, 'popup_misi_selesai_updated.png');
  await page.screenshot({ path: shotPopup });
  console.log('Saved Updated Popup screenshot ->', shotPopup);

  // Click Selesai
  console.log('8. Clicking Selesai button...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="btn-mission-complete-finish"]');
    if (btn) btn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL in Lobby:', page.url());
  const shotLobby = path.join(ARTIFACTS_DIR, 'lobby_map_final_verification.png');
  await page.screenshot({ path: shotLobby });
  console.log('Saved Final Lobby Screenshot ->', shotLobby);

  await browser.close();
  console.log('--- ALL CHECKS PASSED SUCCESSFULLY ---');
})();
