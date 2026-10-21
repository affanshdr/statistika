const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }
  await new Promise(r => setTimeout(r, 800));

  // Let's inspect the SVG viewBox and background image for each room
  const roomAnalysis = {};

  for (const roomId of ['A1', 'A2', 'B1', 'B2']) {
    await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), roomId);
    await new Promise(r => setTimeout(r, 1000));

    // Get background image natural dimensions and rendered dimensions
    const bgInfo = await page.evaluate(() => {
      const img = document.querySelector('svg image');
      const teacherFo = document.querySelector('svg foreignObject');
      return {
        bgHref: img ? img.getAttribute('href') : null,
        bgX: img ? img.getAttribute('x') : null,
        bgY: img ? img.getAttribute('y') : null,
        bgW: img ? img.getAttribute('width') : null,
        bgH: img ? img.getAttribute('height') : null,
        teacherX: teacherFo ? teacherFo.getAttribute('x') : null,
        teacherY: teacherFo ? teacherFo.getAttribute('y') : null,
        teacherW: teacherFo ? teacherFo.getAttribute('width') : null,
        teacherH: teacherFo ? teacherFo.getAttribute('height') : null,
      };
    });

    roomAnalysis[roomId] = bgInfo;
    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('Room Analysis:', JSON.stringify(roomAnalysis, null, 2));
  await browser.close();
})();
