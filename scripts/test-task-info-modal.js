import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('📱 Testing Task Info Modal & New Toolbar...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss any start button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Teleport & open corkboard
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1200));
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 1200));

    let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) {
      await page.keyboard.press('t');
      await new Promise(r => setTimeout(r, 1200));
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 1200));
    }

    // 1. Screenshot clean board with Reset & Info above calculator
    const shotClean = path.join(ARTIFACTS_DIR, 'board_clean_toolbar.png');
    await page.screenshot({ path: shotClean });
    console.log(`📸 Saved clean board screenshot: ${shotClean}`);

    // 2. Click Information button to open Popup
    const infoBtn = await page.$('[data-testid="btn-task-info"]');
    if (!infoBtn) throw new Error('Tombol Informasi tidak ditemukan!');
    console.log('Clicking [ℹ️ Informasi] button...');
    await infoBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const popup = await page.$('[data-testid="task-info-popup"]');
    if (!popup) throw new Error('Popup tugas tidak muncul di tengah!');
    console.log('✅ Popup tugas berhasil muncul di tengah!');

    // 3. Screenshot Popup Modal
    const shotPopup = path.join(ARTIFACTS_DIR, 'task_info_popup_center.png');
    await page.screenshot({ path: shotPopup });
    console.log(`📸 Saved popup screenshot: ${shotPopup}`);

    // 4. Click Urutkan Cepat inside Popup
    const autoSortInsidePopup = await page.$('[data-testid="btn-auto-sort"]');
    if (autoSortInsidePopup) {
      console.log('Clicking [✨ Urutkan Cepat] inside popup...');
      await autoSortInsidePopup.click();
      await new Promise(r => setTimeout(r, 600));
    }

    // 5. Screenshot after sort
    const shotSorted = path.join(ARTIFACTS_DIR, 'board_after_popup_sort.png');
    await page.screenshot({ path: shotSorted });
    console.log(`📸 Saved sorted screenshot: ${shotSorted}`);

    console.log('🎉 ALL CHECKS PASSED!');
  } catch (err) {
    console.error('❌ Test Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
