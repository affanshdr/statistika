import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('📱 Starting Mobile Landscape Responsive Test for PakReportModal...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Test iPhone 14 Landscape: 844 x 390
    console.log('\n--- 1. TESTING IPHONE 14 LANDSCAPE (844 x 390) ---');
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss any start/welcome button if present
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Teleport to Pak Sutrisno & open corkboard
    console.log('Pressing [T] to teleport to Pak Sutrisno...');
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1500));
    console.log('Pressing [E] to interact...');
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 1200));

    let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) {
      console.log('Retrying [T] and [E]...');
      await page.keyboard.press('t');
      await new Promise(r => setTimeout(r, 1200));
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 1200));
      corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    }

    // Capture iPhone 14 Tahap 1 Initial
    const shotMobile1 = path.join(ARTIFACTS_DIR, 'mobile_hp_1_sort_initial.png');
    await page.screenshot({ path: shotMobile1 });
    console.log(`📸 Saved screenshot: ${shotMobile1}`);

    // Press [U] key to trigger Auto Sort shortcut!
    console.log('Pressing [U] to trigger auto-sort shortcut...');
    await page.keyboard.press('u');
    await new Promise(r => setTimeout(r, 600));

    // Capture iPhone 14 Tahap 1 Sorted
    const shotMobile2 = path.join(ARTIFACTS_DIR, 'mobile_hp_2_sort_sorted.png');
    await page.screenshot({ path: shotMobile2 });
    console.log(`📸 Saved screenshot: ${shotMobile2}`);

    // Advance to Modus
    const nextToModusBtn = await page.$('[data-testid="btn-next-to-modus"]');
    if (nextToModusBtn) await nextToModusBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Capture iPhone 14 Tahap 2 Modus
    const shotMobile3 = path.join(ARTIFACTS_DIR, 'mobile_hp_3_modus.png');
    await page.screenshot({ path: shotMobile3 });
    console.log(`📸 Saved screenshot: ${shotMobile3}`);

    // Solve Modus
    const modeChoiceIds = await page.$$eval('[data-testid^="modus-choice-"]', els =>
      els.map(el => el.getAttribute('data-testid'))
    );
    for (const testId of modeChoiceIds) {
      const btn = await page.$(`[data-testid="${testId}"]`);
      if (btn) await btn.click();
      await new Promise(r => setTimeout(r, 300));
      const nextBtn = await page.$('[data-testid="btn-next-to-median"]');
      if (nextBtn) {
        await nextBtn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // Capture iPhone 14 Tahap 3 Median
    const shotMobile4 = path.join(ARTIFACTS_DIR, 'mobile_hp_4_median.png');
    await page.screenshot({ path: shotMobile4 });
    console.log(`📸 Saved screenshot: ${shotMobile4}`);

    // Solve Median
    const medianChoiceIds = await page.$$eval('[data-testid^="median-choice-"]', els =>
      els.map(el => el.getAttribute('data-testid'))
    );
    for (const testId of medianChoiceIds) {
      const btn = await page.$(`[data-testid="${testId}"]`);
      if (btn) await btn.click();
      await new Promise(r => setTimeout(r, 300));
      const nextBtn = await page.$('[data-testid="btn-next-to-mean"]');
      if (nextBtn) {
        await nextBtn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // Capture iPhone 14 Tahap 4 Mean & Calculator
    const shotMobile5 = path.join(ARTIFACTS_DIR, 'mobile_hp_5_mean_calc.png');
    await page.screenshot({ path: shotMobile5 });
    console.log(`📸 Saved screenshot: ${shotMobile5}`);

    // 2. Test Ultra-compact Phone Height (Samsung Galaxy S20: 740 x 360)
    console.log('\n--- 2. TESTING ULTRA-COMPACT GALAXY S20 (740 x 360) ---');
    await page.setViewport({ width: 740, height: 360, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 800));

    const shotCompact1 = path.join(ARTIFACTS_DIR, 'mobile_hp_compact_360h.png');
    await page.screenshot({ path: shotCompact1 });
    console.log(`📸 Saved screenshot: ${shotCompact1}`);

    console.log('\n🎉 ALL MOBILE LANDSCAPE TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
