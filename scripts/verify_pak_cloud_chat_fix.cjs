const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🚀 Running Pak Sutrisno Cloud Chat Fix Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const url = 'http://localhost:3000/siswa/game/level/1?zone=main&cinematic=pak_sanction_1';
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Teleport player right in front of Pak Sutrisno
    await page.evaluate(() => {
      if (window.__DEV_SET_ZONE__) window.__DEV_SET_ZONE__('main');
      if (window.__DEV_SET_POS__) window.__DEV_SET_POS__(640, 470);
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('pak_sanction_1');
    });

    // Wait for camera lerp & render
    await new Promise(r => setTimeout(r, 2000));

    // 1. Capture pak_sanction_1
    const sanction1Path = path.join(ARTIFACTS_DIR, 'pak_sanction_1_fixed.png');
    await page.screenshot({ path: sanction1Path });
    console.log('✅ Screenshot saved: pak_sanction_1_fixed.png');

    // DOM & SVG Geometry audit
    const audit1 = await page.evaluate(() => {
      const bubbleG = document.querySelector('g[key="pak-shout-bubble"]') || document.querySelector('path[stroke="#F59E0B"]')?.parentElement;
      const pathEl = bubbleG ? bubbleG.querySelector('path') : null;
      const foEl = bubbleG ? bubbleG.querySelector('foreignObject') : null;
      const foDiv = foEl ? foEl.querySelector('div') : null;
      const pakEl = document.querySelector('div[style*="pak Sutrisno"]')?.parentElement?.parentElement;

      const pathRect = pathEl ? pathEl.getBoundingClientRect() : null;
      const foRect = foEl ? foEl.getBoundingClientRect() : null;
      const pakRect = pakEl ? pakEl.getBoundingClientRect() : null;

      return {
        pathExists: !!pathEl,
        pathD: pathEl ? pathEl.getAttribute('d') : null,
        foBackground: foDiv ? window.getComputedStyle(foDiv).backgroundColor : null,
        foBorder: foDiv ? window.getComputedStyle(foDiv).border : null,
        pathRect,
        foRect,
        pakRect,
        isBubbleAbovePak: pathRect && pakRect ? (pathRect.top + pathRect.height * 0.85 < pakRect.top + pakRect.height * 0.5) : null,
      };
    });
    console.log('Audit 1 (pak_sanction_1):', JSON.stringify(audit1, null, 2));

    // 2. Advance to pak_sanction_2
    await page.evaluate(() => {
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('pak_sanction_2');
    });
    await new Promise(r => setTimeout(r, 1000));
    const sanction2Path = path.join(ARTIFACTS_DIR, 'pak_sanction_2_fixed.png');
    await page.screenshot({ path: sanction2Path });
    console.log('✅ Screenshot saved: pak_sanction_2_fixed.png');

    // 3. Advance to pak_sanction_3
    await page.evaluate(() => {
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('pak_sanction_3');
    });
    await new Promise(r => setTimeout(r, 1000));
    const sanction3Path = path.join(ARTIFACTS_DIR, 'pak_sanction_3_fixed.png');
    await page.screenshot({ path: sanction3Path });
    console.log('✅ Screenshot saved: pak_sanction_3_fixed.png');

    // 4. Advance to player_reply_pak
    await page.evaluate(() => {
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('player_reply_pak');
    });
    await new Promise(r => setTimeout(r, 1000));
    const replyPath = path.join(ARTIFACTS_DIR, 'player_reply_pak_fixed.png');
    await page.screenshot({ path: replyPath });
    console.log('✅ Screenshot saved: player_reply_pak_fixed.png');

    // Audit player reply bubble
    const auditReply = await page.evaluate(() => {
      const bubbleG = document.querySelector('path[stroke="#10B981"]')?.parentElement;
      const pathEl = bubbleG ? bubbleG.querySelector('path') : null;
      const foEl = bubbleG ? bubbleG.querySelector('foreignObject') : null;
      return {
        replyPathExists: !!pathEl,
        replyPathD: pathEl ? pathEl.getAttribute('d') : null,
        foRect: foEl ? foEl.getBoundingClientRect() : null,
      };
    });
    console.log('Audit Reply:', JSON.stringify(auditReply, null, 2));

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
