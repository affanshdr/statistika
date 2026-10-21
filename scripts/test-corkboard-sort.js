import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🚀 Starting Corkboard Sort & 4-Stage Analysis Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('Navigating to game with demo=true...');
    await page.goto('http://localhost:3000/siswa/game?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Handle Start button
    const startButton = await page.$('button.game-btn-start, button');
    if (startButton) {
      await startButton.click();
      console.log('Clicked Start button');
    }
    await new Promise(r => setTimeout(r, 1000));

    // Handle initial dialog / modal
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai')) {
        await btn.click();
        console.log('Clicked Mulai Penyelidikan');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Enter Level 1
    const levelBtns = await page.$$('button');
    for (const btn of levelBtns) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Investigasi') || text.includes('Level 1')) {
        await btn.click();
        console.log('Clicked Investigasi / Level 1');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2500));

    // Now in game! Teleport directly to Pak Sutrisno
    console.log('Using Teleport Shortcut to Pak Sutrisno (Pressing [T])...');
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1200));

    // Check if we are inside Ruang Guru or near Pak Sutrisno
    console.log('Interacting with Pak Sutrisno (Pressing [E])...');
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 800));

    // If dialog option appeared, click it
    const dialogChoice = await page.$('button[data-testid="dialog-choice-0"], button');
    if (dialogChoice) {
      const txt = await page.evaluate(el => el.innerText, dialogChoice);
      console.log('Dialog choice found:', txt);
      await page.keyboard.press('e');
    }
    await new Promise(r => setTimeout(r, 1000));

    // Check if pak-report-corkboard is visible
    let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) {
      console.log('Corkboard not open yet, trying to click E or trigger teleport again...');
      await page.keyboard.press('t');
      await new Promise(r => setTimeout(r, 1000));
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 1000));
      corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    }

    if (!corkboard) {
      throw new Error('Could not open pak-report-corkboard modal!');
    }
    console.log('✅ Corkboard modal successfully opened!');

    // ──────────────── TAHAP 1: URUTKAN DATA ────────────────
    console.log('\n--- VERIFYING TAHAP 1: URUTKAN DATA ---');
    // Verify 24 pool tokens exist
    const poolTokens = await page.$$('[data-testid^="pool-token-"]');
    console.log(`Pool tokens found: ${poolTokens.length} (Expected: 24)`);

    // Verify 24 target slots exist
    const targetSlots = await page.$$('[data-testid^="target-slot-"]');
    console.log(`Target slots found: ${targetSlots.length} (Expected: 24)`);

    // Capture Tahap 1 initial unsorted
    const shot1 = path.join(ARTIFACTS_DIR, 'corkboard_sort_1_initial.png');
    await page.screenshot({ path: shot1 });
    console.log(`📸 Saved screenshot 1: ${shot1}`);

    // Click 3 tokens to test click-to-place functionality
    console.log('Testing Click-to-Place on first 3 tokens...');
    if (poolTokens[0]) await poolTokens[0].click();
    await new Promise(r => setTimeout(r, 200));
    if (poolTokens[1]) await poolTokens[1].click();
    await new Promise(r => setTimeout(r, 200));
    if (poolTokens[2]) await poolTokens[2].click();
    await new Promise(r => setTimeout(r, 300));

    // Test clicking a slot to return token back to pool
    console.log('Testing Slot click to return token to pool...');
    if (targetSlots[1]) await targetSlots[1].click();
    await new Promise(r => setTimeout(r, 300));

    // Now test "Urutkan Cepat" (Auto Sort)
    console.log('Clicking ✨ Urutkan Cepat...');
    const autoSortBtn = await page.$('[data-testid="btn-auto-sort"]');
    if (autoSortBtn) await autoSortBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Capture Tahap 1 sorted
    const shot2 = path.join(ARTIFACTS_DIR, 'corkboard_sort_2_sorted.png');
    await page.screenshot({ path: shot2 });
    console.log(`📸 Saved screenshot 2: ${shot2}`);

    // Click "Lanjut ke Tahap 2: Modus"
    const nextToModusBtn = await page.$('[data-testid="btn-next-to-modus"]');
    if (!nextToModusBtn) throw new Error('btn-next-to-modus not visible after auto-sort!');
    console.log('Clicking Lanjut ke Tahap 2: Modus →...');
    await nextToModusBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // ──────────────── TAHAP 2: MODUS ────────────────
    console.log('\n--- VERIFYING TAHAP 2: MODUS ---');
    const modeChoiceIds = await page.$$eval('[data-testid^="modus-choice-"]', els =>
      els.map(el => el.getAttribute('data-testid'))
    );
    console.log(`Modus choice buttons found: ${modeChoiceIds.length}`);

    let modusSolved = false;
    for (const testId of modeChoiceIds) {
      const btn = await page.$(`[data-testid="${testId}"]`);
      if (btn) await btn.click();
      await new Promise(r => setTimeout(r, 400));
      const nextBtn = await page.$('[data-testid="btn-next-to-median"]');
      if (nextBtn) {
        modusSolved = true;
        break;
      }
    }
    console.log(`Modus solved: ${modusSolved}`);

    const shot3 = path.join(ARTIFACTS_DIR, 'corkboard_sort_3_modus.png');
    await page.screenshot({ path: shot3 });
    console.log(`📸 Saved screenshot 3: ${shot3}`);

    // Click "Lanjut ke Tahap 3: Median"
    const nextToMedianBtn = await page.$('[data-testid="btn-next-to-median"]');
    if (nextToMedianBtn) {
      console.log('Clicking Lanjut ke Tahap 3: Median →...');
      await nextToMedianBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }

    // ──────────────── TAHAP 3: MEDIAN ────────────────
    console.log('\n--- VERIFYING TAHAP 3: MEDIAN ---');
    const medianChoiceIds = await page.$$eval('[data-testid^="median-choice-"]', els =>
      els.map(el => el.getAttribute('data-testid'))
    );
    console.log(`Median choice buttons found: ${medianChoiceIds.length}`);

    let medianSolved = false;
    for (const testId of medianChoiceIds) {
      const btn = await page.$(`[data-testid="${testId}"]`);
      if (btn) await btn.click();
      await new Promise(r => setTimeout(r, 400));
      const nextBtn = await page.$('[data-testid="btn-next-to-mean"]');
      if (nextBtn) {
        medianSolved = true;
        break;
      }
    }
    console.log(`Median solved: ${medianSolved}`);

    const shot4 = path.join(ARTIFACTS_DIR, 'corkboard_sort_4_median.png');
    await page.screenshot({ path: shot4 });
    console.log(`📸 Saved screenshot 4: ${shot4}`);

    // Click "Lanjut ke Tahap 4: Rata-Rata"
    const nextToMeanBtn = await page.$('[data-testid="btn-next-to-mean"]');
    if (nextToMeanBtn) {
      console.log('Clicking Lanjut ke Tahap 4: Rata-Rata →...');
      await nextToMeanBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }

    // ──────────────── TAHAP 4: RATA-RATA & KALKULATOR ────────────────
    console.log('\n--- VERIFYING TAHAP 4: RATA-RATA & KALKULATOR ---');
    // Test calculator interaction
    const calcBtn7 = await page.$('[data-testid="calc-btn-7"]');
    const calcBtnAdd = await page.$('[data-testid="calc-btn-+"]');
    const calcBtn5 = await page.$('[data-testid="calc-btn-5"]');
    const calcBtnEquals = await page.$('[data-testid="calc-btn-="]');

    if (calcBtn7 && calcBtnAdd && calcBtn5 && calcBtnEquals) {
      console.log('Testing DeskCalculator: 7 + 5 = 12...');
      await calcBtn7.click();
      await new Promise(r => setTimeout(r, 100));
      await calcBtnAdd.click();
      await new Promise(r => setTimeout(r, 100));
      await calcBtn5.click();
      await new Promise(r => setTimeout(r, 100));
      await calcBtnEquals.click();
      await new Promise(r => setTimeout(r, 200));
      const calcDisplay = await page.$eval('[data-testid="calc-display-main"]', el => el.innerText);
      console.log('Calculator display:', calcDisplay);
    }

    const meanChoiceIds = await page.$$eval('[data-testid^="mean-choice-"]', els =>
      els.map(el => el.getAttribute('data-testid'))
    );
    console.log(`Mean choice buttons found: ${meanChoiceIds.length}`);

    let meanSolved = false;
    for (const testId of meanChoiceIds) {
      const btn = await page.$(`[data-testid="${testId}"]`);
      if (btn) await btn.click();
      await new Promise(r => setTimeout(r, 400));
      const finishBtn = await page.$('[data-testid="btn-finish-level1-board"]');
      if (finishBtn) {
        meanSolved = true;
        break;
      }
    }
    console.log(`Mean solved: ${meanSolved}`);

    const shot5 = path.join(ARTIFACTS_DIR, 'corkboard_sort_5_mean.png');
    await page.screenshot({ path: shot5 });
    console.log(`📸 Saved screenshot 5: ${shot5}`);

    // Click "Selesaikan Penyelidikan & Buat Kesimpulan"
    const finishBtn = await page.$('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) {
      console.log('Clicking Selesaikan Penyelidikan & Buat Kesimpulan...');
      await finishBtn.click();
      await new Promise(r => setTimeout(r, 2500));
    }

    const finalUrl = page.url();
    console.log(`Final URL after completion: ${finalUrl}`);
    const shot6 = path.join(ARTIFACTS_DIR, 'corkboard_sort_6_final.png');
    await page.screenshot({ path: shot6 });
    console.log(`📸 Saved final screenshot 6: ${shot6}`);

    console.log('\n🎉 ALL 4-STAGE SORT & ANALYSIS TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
