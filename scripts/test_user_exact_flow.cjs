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

  // 1. Enter Ruang VII-B
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A2'));
  await new Promise(r => setTimeout(r, 1000));

  // Advance conversation cutscene (teacher_ask -> player_explain -> teacher_reply -> modal)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 500));
  }

  // Verify modal is open
  const modalText = await page.evaluate(() => {
    const el = document.querySelector('div[style*="SAMPEL LEMBAR SURVEI"]');
    return el ? el.innerText : null;
  });
  console.log('Modal opened with survey:', !!modalText);

  // 2. Click "Batal" on the quiz modal
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Batal'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 3. Capture the teacher prompt bubble above Pak Bambang
  const bubbleInfo = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('text')).map(t => ({
      text: t.textContent.trim(),
      fill: t.getAttribute('fill')
    }));
    return texts.filter(t => t.text.includes('Bambang') || t.text.includes('Bicara') || t.text.includes('Data'));
  });
  console.log('Teacher bubble texts right after clicking Batal:', bubbleInfo);

  const outPath = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/bubble_after_batal_correct.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
})();
