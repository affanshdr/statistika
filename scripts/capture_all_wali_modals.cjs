const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

const CLASSES = [
  { id: 'A1', name: 'Bu_Sari_VII-A' },
  { id: 'A2', name: 'Pak_Bambang_VII-B' },
  { id: 'B1', name: 'Bu_Retno_VIII-A' },
  { id: 'B2', name: 'Pak_Dimas_VIII-B' }
];

(async () => {
  console.log('📸 Capturing all Wali Kelas modals with updated high-contrast dark wood theme...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Dismiss start button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    for (const cl of CLASSES) {
      console.log(`Opening modal for ${cl.name} (${cl.id})...`);
      await page.evaluate((id) => {
        window.__DEV_OPEN_WALI__(id);
      }, cl.id);
      await new Promise(r => setTimeout(r, 800));

      const modal = await page.$('[data-testid="wali-kelas-modal-content"]');
      if (modal) {
        const shotPath = path.join(ARTIFACTS_DIR, `wali_modal_${cl.id}_${cl.name}.png`);
        await page.screenshot({ path: shotPath });
        console.log(`✅ Saved: ${shotPath}`);

        // If it's Pak Bambang (A2), also test answering to capture the answered state
        if (cl.id === 'A2') {
          const passBtn = await page.$('[data-testid="btn-dev-pass-wali-quiz"]');
          if (passBtn) {
            await passBtn.click();
            await new Promise(r => setTimeout(r, 500));
            const shotAnswered = path.join(ARTIFACTS_DIR, `wali_modal_A2_Pak_Bambang_answered.png`);
            await page.screenshot({ path: shotAnswered });
            console.log(`✅ Saved answered state: ${shotAnswered}`);
          }
        }

        // Close modal
        const closeBtn = await page.$('[data-testid="btn-close-wali-kelas"]');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(r => setTimeout(r, 500));
        }
      } else {
        console.warn(`⚠️ Modal for ${cl.name} not found!`);
      }
    }

    console.log('✨ All captures complete!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
})();
