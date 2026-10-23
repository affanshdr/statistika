const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Emulate Mobile Device (e.g. Pixel 7 / iPhone landscape or portrait)
  // Let's test mobile landscape 844x390 and mobile portrait 390x844
  await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('student', JSON.stringify({ id: 'test-01', name: 'Stevunt', nisn: '1234', classroom: { name: 'VII-A' } }));
  });

  // Navigate to Level 1
  await page.goto('http://localhost:3000/siswa/game/level/1?demoData=full&zone=main&cinematic=sanction_received&preloaded=true', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 3500));

  // If tutorial modal is open, verify scroll and close it
  const tutModal = await page.$('[data-testid="stage-tutorial-modal"]');
  if (tutModal) {
    console.log('Testing tutorial modal scroll on mobile...');
    await page.evaluate(() => {
      const body = document.querySelector('[data-testid="stage-tutorial-body"]');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_tutorial_scrolled.png' });

    // Click confirm button to close
    const btnConfirm = await page.$('[data-testid="btn-confirm-tutorial"]');
    if (btnConfirm) await btnConfirm.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Now test corkboard on mobile
  // Check if pool tokens exist
  const token0 = await page.$('[data-testid="pool-token-0"]');
  const slot0 = await page.$('[data-testid="target-slot-0"]');

  if (token0 && slot0) {
    console.log('Testing tap-to-place on mobile...');
    // Tap token 0
    await token0.tap();
    await new Promise(r => setTimeout(r, 600));

    // Tap slot 0
    await slot0.tap();
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_tapped_placed.png' });
    console.log('Tap to place completed and screenshotted.');

    // Test touch drag from token 1 to slot 1
    const token1 = await page.$('[data-testid="pool-token-1"]');
    const slot1 = await page.$('[data-testid="target-slot-1"]');
    if (token1 && slot1) {
      console.log('Testing touch-drag from pool to slot 1...');
      const t1Box = await token1.boundingBox();
      const s1Box = await slot1.boundingBox();

      if (t1Box && s1Box) {
        // Dispatch touch events manually to simulate real mobile finger drag
        await page.evaluate(async (srcX, srcY, dstX, dstY) => {
          const srcElem = document.elementFromPoint(srcX, srcY);
          if (!srcElem) return;

          const touch1 = new Touch({ identifier: 1, target: srcElem, clientX: srcX, clientY: srcY, pageX: srcX, pageY: srcY });
          srcElem.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1], changedTouches: [touch1], bubbles: true }));

          // Move in 5 steps
          for (let i = 1; i <= 5; i++) {
            const curX = srcX + (dstX - srcX) * (i / 5);
            const curY = srcY + (dstY - srcY) * (i / 5);
            const moveTouch = new Touch({ identifier: 1, target: srcElem, clientX: curX, clientY: curY, pageX: curX, pageY: curY });
            window.dispatchEvent(new TouchEvent('touchmove', { touches: [moveTouch], changedTouches: [moveTouch], bubbles: true, cancelable: true }));
            await new Promise(r => setTimeout(r, 50));
          }

          // Touch end at destination
          const endTouch = new Touch({ identifier: 1, target: srcElem, clientX: dstX, clientY: dstY, pageX: dstX, pageY: dstY });
          window.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [endTouch], bubbles: true }));
        }, t1Box.x + t1Box.width / 2, t1Box.y + t1Box.height / 2, s1Box.x + s1Box.width / 2, s1Box.y + s1Box.height / 2);

        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_dragged_placed.png' });
        console.log('Touch drag completed and screenshotted.');
      }
    }
  } else {
    console.log('Tokens/slots not found directly, screenshotting current state...');
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mobile_debug_state.png' });
  }

  await browser.close();
})();
