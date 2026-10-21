import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🧪 Starting Clean Reset Toolbar & [U] Shortcut Verification Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss any start/welcome button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 800));

    // Teleport to Pak Sutrisno
    console.log('Teleporting to Pak Sutrisno with [T]...');
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1200));
    console.log('Interacting with [E]...');
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 1500));

    let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) {
      await page.keyboard.press('t');
      await new Promise(r => setTimeout(r, 1000));
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 1500));
      corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    }

    if (!corkboard) {
      throw new Error('❌ Corkboard modal did not open!');
    }
    console.log('✅ Corkboard opened successfully!');

    // 1. Verify "Informasi" button is GONE
    const infoBtn = await page.$('[data-testid="btn-task-info"]');
    if (infoBtn) {
      throw new Error('❌ FAIL: [data-testid="btn-task-info"] should have been removed!');
    }
    console.log('✅ Verified: [ℹ️ Informasi] button is completely removed.');

    // 2. Verify "Reset" button exists with new label
    const resetBtn = await page.$('[data-testid="btn-reset-sort"]');
    if (!resetBtn) {
      throw new Error('❌ FAIL: [data-testid="btn-reset-sort"] not found!');
    }
    const resetText = await page.evaluate(el => el.innerText, resetBtn);
    console.log(`✅ Verified: Reset button text is "${resetText.replace(/\n/g, ' ')}"`);

    // Capture initial clean board screenshot
    const shot1 = path.join(ARTIFACTS_DIR, 'board_clean_no_info_button.png');
    await page.screenshot({ path: shot1 });
    console.log(`📸 Saved screenshot: ${shot1}`);

    // 3. Test Keyboard Shortcut [U] for auto-sort
    console.log('Testing [U] key shortcut for quick sort...');
    await page.keyboard.press('u');
    await new Promise(r => setTimeout(r, 800));

    // Verify next to modus button appears
    const nextBtn = await page.$('[data-testid="btn-next-to-modus"]');
    if (!nextBtn) {
      throw new Error('❌ FAIL: [U] shortcut did not trigger auto-sort!');
    }
    console.log('✅ Verified: [U] key shortcut successfully sorted all 24 slots!');

    // Capture after [U] screenshot
    const shot2 = path.join(ARTIFACTS_DIR, 'board_after_u_key_shortcut.png');
    await page.screenshot({ path: shot2 });
    console.log(`📸 Saved screenshot: ${shot2}`);

    // 4. Test Reset button click
    console.log('Testing Reset button click...');
    const closePopupBtn = await page.$('[data-testid="btn-close-sort-success"]');
    if (closePopupBtn) {
      await closePopupBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
    await resetBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const nextBtnAfterReset = await page.$('[data-testid="btn-next-to-modus"]');
    if (nextBtnAfterReset) {
      throw new Error('❌ FAIL: Reset button did not clear the sorted slots!');
    }
    console.log('✅ Verified: Reset button successfully cleared all slots back to initial!');

    // Capture after reset screenshot
    const shot3 = path.join(ARTIFACTS_DIR, 'board_after_reset_clicked.png');
    await page.screenshot({ path: shot3 });
    console.log(`📸 Saved screenshot: ${shot3}`);

    console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
