const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Emulate Mobile Device (e.g. Pixel 7 / iPhone landscape 844x390)
  await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('student', JSON.stringify({ id: 'test-01', name: 'Stevunt', nisn: '1234', classroom: { name: 'VII-A' } }));
  });

  // Navigate to Level 1
  await page.goto('http://localhost:3000/siswa/game/level/1?demoData=full&zone=main&cinematic=sanction_received&preloaded=true', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 3500));

  // Open Corkboard directly
  await page.evaluate(() => {
    if (window.__DEV_OPEN_CORKBOARD__) {
      window.__DEV_OPEN_CORKBOARD__();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 1: Check if tutorial modal is displayed and scrollable
  const tutModal = await page.$('[data-testid="stage-tutorial-modal"]');
  if (tutModal) {
    console.log('Stage tutorial modal is open on mobile.');
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_tut_initial.png' });

    // Scroll tutorial
    await page.evaluate(() => {
      const b = document.querySelector('[data-testid="stage-tutorial-body"]');
      if (b) b.scrollTop = b.scrollHeight;
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_tut_scrolled.png' });

    // Close tutorial
    const btnClose = await page.$('[data-testid="btn-confirm-tutorial"]');
    if (btnClose) await btnClose.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Screenshot 2: Corkboard Stage 1 Sorting View
  await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_corkboard_stage1.png' });
  console.log('Corkboard stage 1 screenshotted.');

  // Test Tap-to-Place
  const token0 = await page.$('[data-testid="pool-token-0"]');
  const slot0 = await page.$('[data-testid="target-slot-0"]');
  if (token0 && slot0) {
    console.log('Tapping token 0...');
    await token0.tap();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_token0_held.png' });

    console.log('Tapping slot 0...');
    await slot0.tap();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_slot0_placed.png' });
  }

  // Test Touch Drag on token 1
  const token1 = await page.$('[data-testid="pool-token-1"]');
  const slot1 = await page.$('[data-testid="target-slot-1"]');
  if (token1 && slot1) {
    const t1Box = await token1.boundingBox();
    const s1Box = await slot1.boundingBox();
    if (t1Box && s1Box) {
      console.log('Simulating touch drag from token 1 to slot 1...');
      await page.evaluate(async (srcX, srcY, dstX, dstY) => {
        const srcElem = document.elementFromPoint(srcX, srcY);
        if (!srcElem) return;

        const touch1 = new Touch({ identifier: 1, target: srcElem, clientX: srcX, clientY: srcY, pageX: srcX, pageY: srcY });
        srcElem.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1], changedTouches: [touch1], bubbles: true }));

        for (let i = 1; i <= 6; i++) {
          const curX = srcX + (dstX - srcX) * (i / 6);
          const curY = srcY + (dstY - srcY) * (i / 6);
          const moveTouch = new Touch({ identifier: 1, target: srcElem, clientX: curX, clientY: curY, pageX: curX, pageY: curY });
          window.dispatchEvent(new TouchEvent('touchmove', { touches: [moveTouch], changedTouches: [moveTouch], bubbles: true, cancelable: true }));
          await new Promise(r => setTimeout(r, 40));
        }

        const endTouch = new Touch({ identifier: 1, target: srcElem, clientX: dstX, clientY: dstY, pageX: dstX, pageY: dstY });
        window.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [endTouch], bubbles: true }));
      }, t1Box.x + t1Box.width / 2, t1Box.y + t1Box.height / 2, s1Box.x + s1Box.width / 2, s1Box.y + s1Box.height / 2);

      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_touch_drag_result.png' });
      console.log('Touch drag result screenshotted.');
    }
  }

  await browser.close();
  console.log('All tests finished successfully.');
})();
