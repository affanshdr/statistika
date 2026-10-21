const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🚀 Starting Pak Sutrisno Cloud Chat Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const url = 'http://localhost:3000/siswa/game/level/1?demoMode=true&zone=main&cinematic=pak_sanction_1';
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for preloader to finish
    await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));

    // Click 'Mulai' if dialog present
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai') || text.includes('Lanjut')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }

    // Set position near Pak Sutrisno
    await page.evaluate(() => {
      if (window.__DEV_SET_ZONE__) window.__DEV_SET_ZONE__('main');
      if (window.__DEV_SET_POS__) window.__DEV_SET_POS__(640, 470);
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('pak_sanction_1');
    });

    // Wait for camera lerp & render
    await new Promise(r => setTimeout(r, 1800));

    // Capture pak_sanction_1
    const sanction1Path = path.join(ARTIFACTS_DIR, 'pak_sanction_1_fixed.png');
    await page.screenshot({ path: sanction1Path });
    console.log('✅ Screenshot saved:', sanction1Path);

    // Get DOM metrics of Pak Sutrisno and the bubble
    const metrics = await page.evaluate(() => {
      const bubbleG = document.querySelector('g[style*="cursor: pointer"]');
      const bubblePath = bubbleG ? bubbleG.querySelector('path') : null;
      const textEl = document.querySelector('foreignObject div');
      const pakEl = document.querySelector('foreignObject[style*="pak Sutrisno"], img[src*="pak Sutrisno"], div[style*="pak Sutrisno"]');
      return {
        hasBubbleG: !!bubbleG,
        hasBubblePath: !!bubblePath,
        bubbleD: bubblePath ? bubblePath.getAttribute('d') : null,
        textSample: textEl ? textEl.innerText.slice(0, 100) : null,
        bubbleBBox: bubblePath ? bubblePath.getBoundingClientRect() : null,
        pakBBox: pakEl ? pakEl.getBoundingClientRect() : null,
      };
    });
    console.log('Pak Sanction 1 Metrics:', metrics);

    // Advance to pak_sanction_2
    await page.evaluate(() => {
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('pak_sanction_2');
    });
    await new Promise(r => setTimeout(r, 800));
    const sanction2Path = path.join(ARTIFACTS_DIR, 'pak_sanction_2_fixed.png');
    await page.screenshot({ path: sanction2Path });
    console.log('✅ Screenshot saved:', sanction2Path);

    // Advance to pak_sanction_3
    await page.evaluate(() => {
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('pak_sanction_3');
    });
    await new Promise(r => setTimeout(r, 800));
    const sanction3Path = path.join(ARTIFACTS_DIR, 'pak_sanction_3_fixed.png');
    await page.screenshot({ path: sanction3Path });
    console.log('✅ Screenshot saved:', sanction3Path);

    // Advance to player_reply_pak
    await page.evaluate(() => {
      if (window.__DEV_SET_CINEMATIC__) window.__DEV_SET_CINEMATIC__('player_reply_pak');
    });
    await new Promise(r => setTimeout(r, 800));
    const playerReplyPath = path.join(ARTIFACTS_DIR, 'player_reply_pak_fixed.png');
    await page.screenshot({ path: playerReplyPath });
    console.log('✅ Screenshot saved:', playerReplyPath);

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
