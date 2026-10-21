const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  // Open Wali Kelas modal for VII-B (A2) which has 7 students
  await page.evaluate(() => window.__DEV_OPEN_WALI__('A2'));
  await new Promise(r => setTimeout(r, 1000));

  // Find the survey table element
  const surveyCard = await page.$('div[style*="SAMPEL LEMBAR SURVEI"], div[style*="border: 1.5px solid rgb(245, 158, 11)"]');

  const outPath = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/verifikasi_satuan_jam_survei.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  // Read the badge texts from the DOM
  const badgeTexts = await page.evaluate(() => {
    const badges = Array.from(document.querySelectorAll('span')).filter(s => s.innerText.includes('jam'));
    return badges.map(b => b.innerText.trim());
  });
  console.log('Badge texts found:', badgeTexts);

  await browser.close();
})();
