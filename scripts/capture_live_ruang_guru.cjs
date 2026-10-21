const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Capturing Live Ruang Guru scene...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Check dev helpers
  const devReady = await page.evaluate(() => {
    return {
      hasEnterRoom: typeof window.__DEV_ENTER_ROOM__ === 'function',
      hasSetPos: typeof window.__DEV_SET_POS__ === 'function',
      hasGetState: typeof window.__DEV_GET_STATE__ === 'function',
    };
  });
  console.log('Dev helpers available:', devReady);

  if (devReady.hasEnterRoom) {
    console.log('Entering Ruang Guru (RG) via __DEV_ENTER_ROOM__...');
    await page.evaluate(() => window.__DEV_ENTER_ROOM__('RG'));
  } else {
    console.log('Entering Ruang Guru via teleport shortcut [t]...');
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1000));
    // Close report modal if open so we can see the room
    await page.keyboard.press('Escape');
  }

  await new Promise(r => setTimeout(r, 1200));

  // Get current state
  const state = await page.evaluate(() => {
    if (typeof window.__DEV_GET_STATE__ === 'function') {
      return window.__DEV_GET_STATE__();
    }
    return null;
  });
  console.log('Current state in Ruang Guru:', state);

  // Take screenshot 1: With dialogue / cutscene
  const shot1 = path.join(ARTIFACTS_DIR, 'ruang_guru_live_cutscene.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved live cutscene ->', shot1);

  // If there's dialogue bubble or corkboard, let's also close or click dialogue to see idle state
  // Close any modal or finish cutscene
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));

  // Close corkboard if it opened
  const btnCloseCork = await page.$('[data-testid="btn-close-corkboard"]');
  if (btnCloseCork) {
    await btnCloseCork.click();
    await new Promise(r => setTimeout(r, 600));
  }
  const btnCloseTut = await page.$('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
  if (btnCloseTut) {
    await btnCloseTut.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Take screenshot 2: Free standing in Ruang Guru
  const shot2 = path.join(ARTIFACTS_DIR, 'ruang_guru_live_idle.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved live idle ->', shot2);

  await browser.close();
})();
