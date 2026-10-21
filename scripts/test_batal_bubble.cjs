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

  // 2. Open Wali Kelas Modal
  await page.evaluate(() => window.__DEV_OPEN_WALI__('A2'));
  await new Promise(r => setTimeout(r, 800));

  console.log('--- Step 1: Click Batal on Modal ---');
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Batal'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Read teacher bubble text after Batal
  const bubbleAfterBatal = await page.evaluate(() => {
    const textEls = Array.from(document.querySelectorAll('text')).map(el => ({
      text: el.textContent.trim(),
      fill: el.getAttribute('fill')
    }));
    return textEls.filter(t => t.text.includes('Bicara') || t.text.includes('Data') || t.text.includes('Pak Bambang'));
  });
  console.log('Teacher bubble after Batal:', bubbleAfterBatal);

  // Take screenshot after Batal
  const outBatal = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/bubble_after_batal.png';
  await page.screenshot({ path: outBatal });
  console.log('Saved screenshot after Batal to:', outBatal);

  // 3. Now re-open modal and complete quiz
  await page.evaluate(() => window.__DEV_OPEN_WALI__('A2'));
  await new Promise(r => setTimeout(r, 800));

  console.log('--- Step 2: Answer Quiz Correctly ---');
  // Click correct answer button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    // Find quiz choice button that is NOT Batal
    const choiceBtn = btns.find(b => !b.innerText.includes('Batal') && !b.innerText.includes('Mulai') && !b.innerText.includes('Pass') && b.innerText.length > 0);
    // Actually let's click the pass button or the correct choice
    const passBtn = btns.find(b => b.innerText.includes('Pass'));
    if (passBtn) passBtn.click();
    else if (choiceBtn) choiceBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Click submit / collect button
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Ambil Lembar Data') || el.innerText.includes('Jawab') || el.innerText.includes('Buka Data'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Read teacher bubble text after Success
  const bubbleAfterCollect = await page.evaluate(() => {
    const textEls = Array.from(document.querySelectorAll('text')).map(el => ({
      text: el.textContent.trim(),
      fill: el.getAttribute('fill')
    }));
    return textEls.filter(t => t.text.includes('Bicara') || t.text.includes('Data') || t.text.includes('Pak Bambang'));
  });
  console.log('Teacher bubble after Collect:', bubbleAfterCollect);

  // Take screenshot after Collect
  const outCollect = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/bubble_after_collect.png';
  await page.screenshot({ path: outCollect });
  console.log('Saved screenshot after Collect to:', outCollect);

  await browser.close();
})();
