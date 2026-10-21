const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- VERIFYING ROOM SCALE, KANTIN REMOVAL & COLLISIONS ---');
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

  // 1. Check Character Size in VII-B (Pak Bambang)
  console.log('2. Entering Ruang VII-B (A2) to check player character scale...');
  await page.evaluate(() => {
    // Dispatch custom event or enter via active door
    const doorA2 = document.querySelector('#door-A2, [data-door-id="A2"]');
    if (doorA2) doorA2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // If not entered yet, press shortcut or enter
  const inA2 = await page.evaluate(() => document.body.innerText.includes('KELAS VII-B') || document.body.innerText.includes('VII-B'));
  console.log('Inside VII-B:', inA2);

  const shotVIIB = path.join(ARTIFACTS_DIR, 'verify_viib_player_scale.png');
  await page.screenshot({ path: shotVIIB });
  console.log('Saved VII-B Player Scale Screenshot ->', shotVIIB);

  // 2. Go to Facility Courtyard to check Kantin removal
  console.log('3. Exiting to hallway & going to Facility Courtyard...');
  await page.evaluate(() => {
    const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Keluar'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Teleport/move to facility courtyard
  await page.evaluate(() => {
    // In dev mode, we can switch zone or click facility gateway
    const gateBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Fasilitas'));
    if (gateBtn) gateBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Check if Kantin is present in DOM
  const hasKantin = await page.evaluate(() => {
    const text = document.body.innerText;
    const kantinHotspot = document.querySelector('#facility-door-KANTIN');
    return text.includes('Kantin Sekolah') || !!kantinHotspot;
  });
  console.log('Is Kantin interaction present? (Should be false):', hasKantin);

  const shotFacility = path.join(ARTIFACTS_DIR, 'verify_facility_no_kantin.png');
  await page.screenshot({ path: shotFacility });
  console.log('Saved Facility Screenshot ->', shotFacility);

  // 3. Enter Lab Komputer
  console.log('4. Entering Lab Komputer...');
  await page.evaluate(() => {
    const labDoor = document.querySelector('#facility-door-LAB_KOMPUTER, [data-facility-id="LAB_KOMPUTER"]');
    if (labDoor) labDoor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  const hasTeacherHendra = await page.evaluate(() => {
    return document.body.innerText.includes('Pak Hendra') || !!document.querySelector('[key="btn-teacher-hendra"]');
  });
  console.log('Is Teacher Hendra prompt present? (Should be false):', hasTeacherHendra);

  const shotLab = path.join(ARTIFACTS_DIR, 'verify_lab_komputer_scale_and_collision.png');
  await page.screenshot({ path: shotLab });
  console.log('Saved Lab Komputer Screenshot ->', shotLab);

  // 4. Exit Lab and enter Perpustakaan
  console.log('5. Exiting Lab and entering Perpustakaan...');
  await page.evaluate(() => {
    const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Keluar'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const perpusDoor = document.querySelector('#facility-door-PERPUSTAKAAN, [data-facility-id="PERPUSTAKAAN"]');
    if (perpusDoor) perpusDoor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  const hasTeacherWidya = await page.evaluate(() => {
    return document.body.innerText.includes('Bu Widya') || !!document.querySelector('[key="btn-teacher-widya"]');
  });
  console.log('Is Teacher Widya prompt present? (Should be false):', hasTeacherWidya);

  const shotPerpus = path.join(ARTIFACTS_DIR, 'verify_perpustakaan_scale_and_collision.png');
  await page.screenshot({ path: shotPerpus });
  console.log('Saved Perpustakaan Screenshot ->', shotPerpus);

  await browser.close();
  console.log('--- ALL VERIFICATIONS COMPLETED! ---');
})();
