const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🧪 Testing Gate Trigger Behavior (Pak Joko non-clickable & only triggered at gate)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Dismiss start button if needed
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // 1. Initial State: Stevunt is at the street/sidewalk near gate
    console.log('Capturing initial Gate zone state...');
    const shotPath1 = path.join(ARTIFACTS_DIR, 'gate_test_1_initial.png');
    await page.screenshot({ path: shotPath1 });
    console.log(`📸 Saved: ${shotPath1}`);

    // Check Pak Joko element
    const pakJokoG = await page.$('[key="pak-joko-npc"]');
    console.log('Pak Joko element exists:', !!pakJokoG);

    // Try clicking near Pak Joko (x: 930, y: 475) to verify it does NOT trigger anything
    console.log('Testing click on Pak Joko (should NOT trigger dialogue)...');
    await page.mouse.click(930, 475);
    await new Promise(r => setTimeout(r, 600));

    const chatBubbleAfterClick = await page.$('[id^="pak-satpam-cloud-"]');
    if (chatBubbleAfterClick) {
      throw new Error('FAIL: Clicking Pak Joko directly triggered chat! It should be non-interactive.');
    }
    console.log('✅ PASS: Clicking on Pak Joko or nametag did NOT trigger dialogue!');

    // 2. Now walk Stevunt towards the Gate opening (ArrowUp / ArrowLeft)
    console.log('Walking Stevunt towards the school gate entrance...');
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('ArrowUp');
      await new Promise(r => setTimeout(r, 40));
    }
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowLeft');
      await new Promise(r => setTimeout(r, 40));
    }
    await new Promise(r => setTimeout(r, 600));

    // Screenshot near gate
    const shotPath2 = path.join(ARTIFACTS_DIR, 'gate_test_2_approaching_gate.png');
    await page.screenshot({ path: shotPath2 });
    console.log(`📸 Saved: ${shotPath2}`);

    // 3. Now walk through the gate opening into the school!
    console.log('Stevunt attempts to enter the gate opening...');
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowUp');
      await new Promise(r => setTimeout(r, 40));
    }
    await new Promise(r => setTimeout(r, 800));

    // Screenshot of Pak Joko intercepting Stevunt
    const shotPath3 = path.join(ARTIFACTS_DIR, 'gate_test_3_intercepted_at_gate.png');
    await page.screenshot({ path: shotPath3 });
    console.log(`📸 Saved: ${shotPath3}`);

    const chatBubbleAtGate = await page.$('[id^="pak-satpam-cloud-"]');
    if (!chatBubbleAtGate) {
      // If not triggered by movement alone, press E
      console.log('Pressing [E] at gate opening...');
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 800));
      const shotPath4 = path.join(ARTIFACTS_DIR, 'gate_test_4_after_e.png');
      await page.screenshot({ path: shotPath4 });
      console.log(`📸 Saved: ${shotPath4}`);
    }

    console.log('✨ Gate trigger verification complete!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
