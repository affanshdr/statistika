import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game?demo=true', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Start
  const startButton = await page.$('button.game-btn-start, button');
  if (startButton) await startButton.click();
  await new Promise(r => setTimeout(r, 1000));

  // Popup
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai Penyelidikan')) {
      await btn.click();
      break;
    }
  }

  // Level 1
  await new Promise(r => setTimeout(r, 1000));
  const levelBtns = await page.$$('button');
  for (const btn of levelBtns) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Investigasi')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000));

  // Switch to facility zone
  const zoneBtn = await page.$('button[title="Klik untuk berpindah area sekolah"]');
  if (zoneBtn) await zoneBtn.click();
  await new Promise(r => setTimeout(r, 1500));

  // Click on the Lab Komputer SVG door group directly!
  console.log('Clicking Lab Komputer door in SVG...');
  await page.evaluate(() => {
    const allG = Array.from(document.querySelectorAll('svg g'));
    for (const g of allG) {
      if (g.textContent && g.textContent.includes('Lab Komputer')) {
        g.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Inside Lab Komputer, click the Terminal station!
  console.log('Clicking Terminal station by ID: hotspot-lab-terminal...');
  const clickedTerminal = await page.evaluate(() => {
    const el = document.getElementById('hotspot-lab-terminal');
    if (el) {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }
    return false;
  });
  console.log('Clicked Terminal station result:', clickedTerminal);
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'scripts/screenshots/test-lab-modal.png' });
  console.log('Saved test-lab-modal.png');

  // Close modal with Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 600));

  // Exit Lab Komputer using bottom-right button
  console.log('Exiting room using exit button...');
  await page.evaluate(() => {
    const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Keluar Ruang'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Now click Perpustakaan door in facility courtyard!
  console.log('Clicking Perpustakaan door in SVG...');
  await page.evaluate(() => {
    const allG = Array.from(document.querySelectorAll('svg g'));
    for (const g of allG) {
      if (g.textContent && g.textContent.includes('Perpustakaan')) {
        g.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Inside Perpustakaan, click Bookshelf station by ID!
  console.log('Clicking Bookshelf station by ID: hotspot-library-bookshelf...');
  const clickedBookshelf = await page.evaluate(() => {
    const el = document.getElementById('hotspot-library-bookshelf');
    if (el) {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }
    return false;
  });
  console.log('Clicked Bookshelf result:', clickedBookshelf);
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'scripts/screenshots/test-perpus-modal.png' });
  console.log('Saved test-perpus-modal.png');

  await browser.close();
  console.log('Done!');
})();
