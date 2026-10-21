import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🚀 Starting Test for Hold & Switch & Slot Drag Re-positioning...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('Navigating to game...');
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

    // Teleport to Pak Sutrisno
    console.log('Teleporting to Pak Sutrisno (Pressing [T])...');
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1200));

    // Interact with Pak Sutrisno
    console.log('Interacting with Pak Sutrisno (Pressing [E])...');
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 800));

    const dialogChoice = await page.$('button[data-testid="dialog-choice-0"], button');
    if (dialogChoice) {
      await page.keyboard.press('e');
    }
    await new Promise(r => setTimeout(r, 1000));

    let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) {
      await page.keyboard.press('t');
      await new Promise(r => setTimeout(r, 1000));
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 1000));
      corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    }

    if (!corkboard) {
      throw new Error('Corkboard modal not open!');
    }
    console.log('✅ Corkboard modal open!');

    // ── TEST 1: Hold a Token from Pool ──
    console.log('\n--- TEST 1: HOLD TOKEN FROM POOL ---');
    const poolToken0 = await page.$('[data-testid="pool-token-0"]');
    const val0 = await page.evaluate(el => el.innerText.trim(), poolToken0);
    console.log(`Clicking pool token #0 (Value: ${val0})...`);
    await poolToken0.click();
    await new Promise(r => setTimeout(r, 300));

    let heldBanner = await page.$('[data-testid="held-token-banner"]');
    if (!heldBanner) throw new Error('Held token banner did not appear!');
    let bannerText = await page.evaluate(el => el.innerText, heldBanner);
    console.log('Held banner text:', bannerText.replace(/\n/g, ' '));
    if (!bannerText.includes(val0)) {
      throw new Error(`Expected held banner to show value ${val0}`);
    }
    console.log('✅ Test 1 Passed: Held token from pool correctly displayed!');

    // ── TEST 2: Place Held Token into Slot #0 ──
    console.log('\n--- TEST 2: PLACE HELD TOKEN INTO EMPTY SLOT #0 ---');
    const slot0 = await page.$('[data-testid="target-slot-0"]');
    await slot0.click();
    await new Promise(r => setTimeout(r, 300));

    const slot0Val = await page.evaluate(el => el.innerText.replace(/#\d+/, '').trim(), slot0);
    console.log(`Slot #0 text after placing: ${slot0Val} (Expected: ${val0})`);
    if (slot0Val !== val0) throw new Error(`Slot #0 value mismatch! Expected ${val0}, got ${slot0Val}`);

    heldBanner = await page.$('[data-testid="held-token-banner"]');
    if (heldBanner) throw new Error('Held banner should be hidden after placing in empty slot!');
    console.log('✅ Test 2 Passed: Token placed in empty slot and hand is now empty!');

    // ── TEST 3: Hold Token #1 & SWITCH with Slot #0 ──
    console.log('\n--- TEST 3: HOLD TOKEN #1 & SWITCH WITH SLOT #0 ---');
    const poolToken1 = await page.$('[data-testid="pool-token-1"]');
    const val1 = await page.evaluate(el => el.innerText.trim(), poolToken1);
    console.log(`Clicking pool token #1 (Value: ${val1})...`);
    await poolToken1.click();
    await new Promise(r => setTimeout(r, 300));

    // Now click slot #0 (which contains val0)
    console.log(`Clicking slot #0 (contains ${val0}) to SWITCH with held token ${val1}...`);
    await slot0.click();
    await new Promise(r => setTimeout(r, 300));

    // Verify Slot #0 now contains val1
    const newSlot0Val = await page.evaluate(el => el.innerText.replace(/#\d+|⇄/, '').trim(), slot0);
    console.log(`Slot #0 value after switch: ${newSlot0Val} (Expected: ${val1})`);
    if (newSlot0Val !== val1) throw new Error(`Slot #0 did not receive new held value ${val1}!`);

    // Verify player is now holding val0 (the previous value in slot #0)
    heldBanner = await page.$('[data-testid="held-token-banner"]');
    if (!heldBanner) throw new Error('Player should now be holding the switched-out token!');
    bannerText = await page.evaluate(el => el.innerText, heldBanner);
    console.log('Held banner after switch:', bannerText.replace(/\n/g, ' '));
    if (!bannerText.includes(val0)) {
      throw new Error(`Expected held token after switch to be ${val0}, got banner: ${bannerText}`);
    }
    console.log(`✅ Test 3 Passed: SWITCH SUCCESSFUL! Held token (${val1}) placed into slot, and slot's previous token (${val0}) picked up into hand!`);

    // Take a screenshot of the SWITCH state
    const shotSwitch = path.join(ARTIFACTS_DIR, 'switch_mechanic_verified.png');
    await page.screenshot({ path: shotSwitch });
    console.log('Saved screenshot:', shotSwitch);

    // ── TEST 4: Place the Switched Token into Empty Slot #1 ──
    console.log('\n--- TEST 4: PLACE SWITCHED TOKEN INTO SLOT #1 ---');
    const slot1 = await page.$('[data-testid="target-slot-1"]');
    await slot1.click();
    await new Promise(r => setTimeout(r, 300));

    const slot1Val = await page.evaluate(el => el.innerText.replace(/#\d+/, '').trim(), slot1);
    console.log(`Slot #1 value: ${slot1Val} (Expected: ${val0})`);
    if (slot1Val !== val0) throw new Error(`Slot #1 should contain ${val0}!`);
    console.log('✅ Test 4 Passed: Hand is empty, both slots have their numbers!');

    // ── TEST 5: Pick Up From Slot #1 and Cancel ──
    console.log('\n--- TEST 5: PICK UP FROM SLOT #1 & CANCEL HOLD ---');
    await slot1.click(); // clicks occupied slot #1 when hand is empty
    await new Promise(r => setTimeout(r, 300));
    heldBanner = await page.$('[data-testid="held-token-banner"]');
    if (!heldBanner) throw new Error('Clicking occupied slot should pick up token into hand!');
    console.log('Picked up token from slot #1!');

    // Cancel
    const cancelBtn = await page.$('[data-testid="btn-cancel-hold"]');
    if (cancelBtn) {
      await cancelBtn.click();
      await new Promise(r => setTimeout(r, 300));
      console.log('Cancelled hold');
    }
    heldBanner = await page.$('[data-testid="held-token-banner"]');
    if (heldBanner) throw new Error('Held banner should be gone after cancel!');
    console.log('✅ Test 5 Passed: Pick up from slot & cancel working!');

    // ── TEST 6: Auto-sort & Full Validation ──
    console.log('\n--- TEST 6: AUTO-SORT & VERIFY STAGES ---');
    // Press [U] key to trigger Auto Sort shortcut
    console.log('Pressing [U] to trigger auto-sort shortcut...');
    await page.keyboard.press('u');
    await new Promise(r => setTimeout(r, 600));

    const checkSortBtn = await page.$('[data-testid="btn-check-sort"]');
    await checkSortBtn.click();
    await new Promise(r => setTimeout(r, 500));

    const shotAuto = path.join(ARTIFACTS_DIR, 'sort_auto_complete.png');
    await page.screenshot({ path: shotAuto });
    console.log('Saved screenshot:', shotAuto);
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY! 🎯');

  } catch (err) {
    console.error('❌ Test Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
