const puppeteer = require('puppeteer');
const path = require('path');
const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));
    for (const btn of await page.$$('button')) {
      const t = await page.evaluate(el => el.innerText, btn);
      if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
    }
    // Go to main courtyard via classroom enter/exit
    await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(r => setTimeout(r, 1500));

    // Far from gateway
    await page.evaluate(() => window.__DEV_SET_POS__(400, 450));
    await new Promise(r => setTimeout(r, 600));
    const far = await page.evaluate(() => {
      const g = document.querySelector('[data-testid="gateway-marker"]');
      return g ? { near: g.getAttribute('data-near'), pe: g.style.pointerEvents, id: g.id } : null;
    });
    console.log('FAR state:', far);
    // Try clicking marker from far
    const marker = await page.$('[data-testid="gateway-marker"] rect');
    if (marker) { try { await marker.click(); } catch (e) { console.log('click err (expected):', e.message); } }
    await new Promise(r => setTimeout(r, 1200));
    const zoneAfterFarClick = await page.evaluate(() => document.querySelector('[data-testid="gateway-marker"]')?.id);
    console.log('Zone after far click:', zoneAfterFarClick);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gateway_far_not_clickable.png') });

    // Near gateway
    await page.evaluate(() => window.__DEV_SET_POS__(625, 600));
    await new Promise(r => setTimeout(r, 800));
    const near = await page.evaluate(() => {
      const g = document.querySelector('[data-testid="gateway-marker"]');
      return g ? { near: g.getAttribute('data-near'), pe: g.style.pointerEvents, id: g.id } : null;
    });
    console.log('NEAR state:', near);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gateway_near_clickable.png') });

    if (far && far.near === 'false' && far.pe === 'none' && zoneAfterFarClick === 'gateway-main' && near && near.near === 'true' && near.pe === 'auto') {
      console.log('PASS: marker only interactive near bottom edge');
    } else {
      console.log('FAIL');
    }
  } finally {
    await browser.close();
  }
})();
