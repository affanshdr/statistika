import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🧪 Starting Dev Tool Skip Step & Shortcuts Verification Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`[Browser Error]:`, msg.text());
    });

    await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded.');

    // Teleport to Pak Sutrisno via [T]
    console.log('Teleporting to Pak Sutrisno with [T]...');
    await page.keyboard.press('KeyT');
    await new Promise(r => setTimeout(r, 1000));

    // Interact with Pak Sutrisno via [E]
    console.log('Interacting with [E]...');
    await page.keyboard.press('KeyE');
    await new Promise(r => setTimeout(r, 1500));

    const corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) throw new Error('Corkboard failed to open!');
    console.log('✅ Corkboard opened successfully!');

    // 1. Verify Top Header Dev Tool Elements
    const btnToggleDev = await page.$('[data-testid="btn-dev-tools-toggle"]');
    const btnInstantWin = await page.$('[data-testid="btn-dev-instant-win"]');
    const stepper = await page.$('[data-testid="corkboard-stage-stepper"]');

    if (!btnToggleDev) throw new Error('btn-dev-tools-toggle not found!');
    if (!btnInstantWin) throw new Error('btn-dev-instant-win not found!');
    if (!stepper) throw new Error('corkboard-stage-stepper not found!');
    console.log('✅ Verified: Top Header Dev elements exist (Toggle, Auto-Win, Stepper).');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dev_tool_1_initial.png') });
    console.log('📸 Saved screenshot: dev_tool_1_initial.png');

    // 2. Click [🛠️ DEV SKIP] toggle button
    console.log('Clicking [🛠️ DEV SKIP] toggle button...');
    await btnToggleDev.click();
    await new Promise(r => setTimeout(r, 600));

    const devBtnStage2 = await page.$('[data-testid="dev-btn-stage-2"]');
    const devBtnStage3 = await page.$('[data-testid="dev-btn-stage-3"]');
    const devBtnStage4 = await page.$('[data-testid="dev-btn-stage-4"]');
    const devBtnAutoAll = await page.$('[data-testid="dev-btn-auto-all"]');
    const devBtnResetAll = await page.$('[data-testid="dev-btn-reset-all"]');

    if (!devBtnStage2 || !devBtnStage3 || !devBtnStage4 || !devBtnAutoAll || !devBtnResetAll) {
      throw new Error('Collapsible Dev Toolbar buttons missing!');
    }
    console.log('✅ Verified: Collapsible Dev Toolbar opened with all 6 action buttons.');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dev_tool_2_expanded.png') });
    console.log('📸 Saved screenshot: dev_tool_2_expanded.png');

    // 3. Test Skip to Stage 2 (Modus) via Dev Toolbar
    console.log('Testing skip to Stage 2 (Modus)...');
    await devBtnStage2.click();
    await new Promise(r => setTimeout(r, 600));

    const modusHeading = await page.evaluate(() => document.body.innerText.includes('Tentukan Modus'));
    if (!modusHeading) throw new Error('Failed to skip to Stage 2: Modus!');
    console.log('✅ Verified: Successfully skipped to Stage 2 (Modus)! Data auto-sorted.');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dev_tool_3_stage2_modus.png') });
    console.log('📸 Saved screenshot: dev_tool_3_stage2_modus.png');

    // 4. Test Skip to Stage 3 (Median) via Stepper Tab Click
    console.log('Testing skip to Stage 3 (Median) via Stepper Tab Click...');
    const stepperTabMedian = await page.$('[data-testid="stepper-tab-median"]');
    if (!stepperTabMedian) throw new Error('stepper-tab-median not found!');
    await stepperTabMedian.click();
    await new Promise(r => setTimeout(r, 600));

    const medianHeading = await page.evaluate(() => document.body.innerText.includes('Tentukan Median'));
    if (!medianHeading) throw new Error('Failed to skip to Stage 3: Median via Stepper!');
    console.log('✅ Verified: Successfully skipped to Stage 3 (Median) via direct Stepper tab click!');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dev_tool_4_stage3_median.png') });
    console.log('📸 Saved screenshot: dev_tool_4_stage3_median.png');

    // 5. Test Skip to Stage 4 (Mean) via Keyboard Hotkey [4]
    console.log('Testing skip to Stage 4 (Mean) via Keyboard Hotkey [4]...');
    await page.keyboard.press('Digit4');
    await new Promise(r => setTimeout(r, 600));

    const meanHeading = await page.evaluate(() => document.body.innerText.includes('Hitung Rata-Rata'));
    if (!meanHeading) throw new Error('Failed to skip to Stage 4 via hotkey [4]!');
    console.log('✅ Verified: Successfully skipped to Stage 4 (Mean) via Keyboard Hotkey [4]!');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dev_tool_5_stage4_mean.png') });
    console.log('📸 Saved screenshot: dev_tool_5_stage4_mean.png');

    // 6. Test Instant Auto Win (Complete All Stages)
    console.log('Testing Instant Auto Win via [⚡ Auto Win] button...');
    await btnInstantWin.click();
    await new Promise(r => setTimeout(r, 800));

    const btnFinish = await page.$('[data-testid="btn-finish-level1-board"]');
    if (!btnFinish) throw new Error('Finish button [btn-finish-level1-board] not shown after Auto Win!');
    const finishBtnText = await page.evaluate(el => el.innerText, btnFinish);
    console.log(`✅ Verified: All 4 stages auto-solved! Victory button visible: "${finishBtnText.trim()}"`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dev_tool_6_auto_win.png') });
    console.log('📸 Saved screenshot: dev_tool_6_auto_win.png');

    console.log('\n🎉 ALL DEV TOOL & SKIP STEP VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
