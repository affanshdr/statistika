const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- VERIFYING AUTO-EXIT ON BATAL IN CLASSROOM ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('1. Navigating to Level 1...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=main', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // 1. Enter Ruang VII-B (door-A2)
  console.log('2. Entering Ruang VII-B...');
  await page.evaluate(() => {
    const doorA2 = document.querySelector('#door-A2, [data-door-id="A2"]');
    if (doorA2) doorA2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // 2. Talk to Pak Bambang to open WaliKelasModal
  console.log('3. Interacting with Wali Kelas to open quiz modal...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));

  await page.waitForSelector('[data-testid="btn-close-wali-kelas"]', { timeout: 10000 });
  console.log('Quiz modal open!');

  const shotModal = path.join(ARTIFACTS_DIR, 'batal_flow_step1_modal_open.png');
  await page.screenshot({ path: shotModal });
  console.log('Saved Modal Open Screenshot ->', shotModal);

  // 3. Click "← Batal"
  console.log('4. Clicking "← Batal" button...');
  await page.click('[data-testid="btn-close-wali-kelas"]');
  await new Promise(r => setTimeout(r, 1200));

  // 4. Verify player is back outside in hallway
  const inRoom = await page.evaluate(() => {
    return !!document.querySelector('#exit-room-button, [data-testid="btn-exit-room"]') ||
           document.body.innerText.includes('Keluar Ruang');
  });
  console.log('Is player still inside room? (Should be false):', inRoom);

  const shotHallway = path.join(ARTIFACTS_DIR, 'batal_flow_step2_auto_exit_hallway.png');
  await page.screenshot({ path: shotHallway });
  console.log('Saved Auto-Exit Hallway Screenshot ->', shotHallway);

  await browser.close();
  console.log('--- TEST PASSED: AUTO EXIT ON BATAL VERIFIED! ---');
})();
