const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  // 1. Enter Ruang Kelas VII-A
  await page.evaluate(() => window.__DEV_SET_POS__(166, 470));
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
  await new Promise(r => setTimeout(r, 1000));

  // 2. Click "Keluar Ruang"
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Keluar Ruang'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Move around freely in front of the classroom
  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.up('ArrowDown');

  await page.keyboard.down('ArrowRight');
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.up('ArrowRight');

  await new Promise(r => setTimeout(r, 400));

  // Save screenshot to artifact directory
  const outPath = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/exit_classroom_movement_verified.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
})();
