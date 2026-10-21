const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Capturing current Ruang Guru in-game scene...');
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

  // Teleport to Ruang Guru
  // In NPath.tsx: hotkey 't' teleports to Pak Sutrisno (Ruang Guru / BK)
  // Let's check how 't' works or teleport directly into room RG!
  console.log('Teleporting directly to Ruang Guru...');
  await page.evaluate(() => {
    // Check if setInsideRoom exists or trigger room entrance
    if (window.__DEV_ENTER_ROOM) {
      window.__DEV_ENTER_ROOM('RG');
    }
  });

  // If no dev hook, let's check pressing 't'
  await page.keyboard.press('t');
  await new Promise(r => setTimeout(r, 1000));

  // Let's close any modal that opens so we can see the full room
  const closeBtn = await page.$('[data-testid="btn-close-corkboard"], [data-testid="btn-close-tutorial"], button');
  // Check if corkboard opened
  const corkboardClose = await page.$('button[title*="Tutup"], button[aria-label*="Tutup"]');
  // Or press Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // Get current room state
  const roomInfo = await page.evaluate(() => {
    const insideEl = document.querySelector('[data-testid="inside-room-container"]');
    return {
      hasInside: !!insideEl,
      url: window.location.href,
    };
  });
  console.log('Room info:', roomInfo);

  const shotPath = path.join(ARTIFACTS_DIR, 'ruang_guru_current_scene.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot ->', shotPath);

  await browser.close();
})();
