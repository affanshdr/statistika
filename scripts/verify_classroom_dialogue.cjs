const puppeteer = require('puppeteer');
const path = require('path');

async function testClassroom() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to hallway...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demoMode=true&demoStep=exploration', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  // Walk up to door VII-A
  console.log('Walking up to Kelas VII-A...');
  // Hold ArrowUp for 1.2 seconds to walk from y: 640 up to y: 430
  await page.keyboard.down('ArrowUp');
  await new Promise(r => setTimeout(r, 1400));
  await page.keyboard.up('ArrowUp');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'verify_ui_09_near_door_vii_a.png') });
  console.log('Saved verify_ui_09_near_door_vii_a.png');

  // Press E to enter door
  console.log('Pressing E to enter classroom...');
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(artifactDir, 'verify_ui_10_inside_vii_a.png') });
  console.log('Saved verify_ui_10_inside_vii_a.png');

  // Walk up to teacher Bu Sari
  console.log('Walking to Bu Sari...');
  await page.keyboard.down('ArrowUp');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.up('ArrowUp');
  await new Promise(r => setTimeout(r, 500));

  // Press E to open WaliKelasModal
  console.log('Opening WaliKelasModal...');
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(artifactDir, 'verify_ui_11_bu_sari_modal.png') });
  console.log('Saved verify_ui_11_bu_sari_modal.png');

  await browser.close();
  console.log('Done!');
}

testClassroom().catch(console.error);
