import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const url = 'http://localhost:3000/siswa/game/level/1?demoMode=true&demoStep=exploration';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Enter VII-A
  await page.evaluate(() => {
    const door = document.getElementById('class-door-A1');
    if (door) door.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 2000));

  // Skip cutscene
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const allG = Array.from(document.querySelectorAll('svg g'));
      const bubble = allG.find(g => g.textContent && (g.textContent.includes('Bu Sari') || g.textContent.includes('Kamu') || g.textContent.includes('Klik / Tap') || g.textContent.includes('Bicara')));
      if (bubble) bubble.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await page.keyboard.press('KeyE');
    await new Promise(r => setTimeout(r, 500));
  }

  // Collect data
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const collectBtn = allButtons.find(b => b.innerText.includes('Simpan Data') || b.innerText.includes('Kumpulkan'));
    if (collectBtn) collectBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  // Click Mother Cat Mimi
  await page.evaluate(() => {
    const group = document.getElementById('mother-cat-group');
    if (group) group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // Accept quest
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = allButtons.find(b => b.innerText.includes('Cari Mochi') || b.innerText.includes('Tentu'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Open Quest Log drawer
  await page.evaluate(() => {
    const mBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Misi'));
    if (mBtn) mBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const hint = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('p')).find(el => el.textContent && el.textContent.includes('Petunjuk lokasi:'));
    return p ? p.textContent : '';
  });

  // Close Quest Log drawer using explicit close button
  await page.evaluate(() => {
    const closeBtn = document.getElementById('quest-log-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  let targetZone = 'hallway';
  if (hint.includes('Perpustakaan')) targetZone = 'Perpustakaan';
  else if (hint.includes('Lab Komputer')) targetZone = 'LabKomputer';
  else if (hint.includes('Kantin')) targetZone = 'facility_courtyard';

  if (targetZone !== 'hallway') {
    await page.evaluate(() => {
      const zoneBtn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
      if (zoneBtn) zoneBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    if (targetZone === 'Perpustakaan') {
      await page.evaluate(() => {
        const door = document.getElementById('facility-door-PERPUSTAKAAN');
        if (door) door.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await new Promise(r => setTimeout(r, 1500));
    } else if (targetZone === 'LabKomputer') {
      await page.evaluate(() => {
        const door = document.getElementById('facility-door-LAB_KOMPUTER');
        if (door) door.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Rescue kitten
  await page.evaluate(() => {
    const group = document.getElementById('kitten-in-box-group');
    if (group) group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const rescueBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gendong Mochi') || b.innerText.includes('Buka Kardus'));
    if (rescueBtn) rescueBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  if (targetZone === 'Perpustakaan' || targetZone === 'LabKomputer') {
    await page.evaluate(() => {
      const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Keluar Ruang'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  if (targetZone !== 'hallway') {
    await page.evaluate(() => {
      const zoneBtn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
      if (zoneBtn && zoneBtn.textContent && zoneBtn.textContent.includes('Area Fasilitas')) zoneBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Return to Mimi
  await page.evaluate(() => {
    const group = document.getElementById('mother-cat-group');
    if (group) group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // Finish reward modal
  await page.evaluate(() => {
    const finishBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sama-sama'));
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Ensure quest log is closed
  await page.evaluate(() => {
    const closeBtn = document.getElementById('quest-log-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Capture clean reunited scene
  await page.screenshot({ path: 'scripts/screenshots/test-cat-8-reunited-closeup.png' });
  console.log('Saved test-cat-8-reunited-closeup.png');

  await browser.close();
  process.exit(0);
})();
