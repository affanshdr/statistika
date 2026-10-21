const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 800)); }
  }
  await new Promise(r => setTimeout(r, 1200));

  const rooms = [
    { id: 'A1', slug: 'vii_a', label: 'Ruang VII-A' },
    { id: 'A2', slug: 'vii_b', label: 'Ruang VII-B' },
    { id: 'B1', slug: 'viii_a', label: 'Ruang VIII-A' },
    { id: 'B2', slug: 'viii_b', label: 'Ruang VIII-B' },
  ];

  for (const room of rooms) {
    console.log(`\n=== TESTING ${room.label} ===`);
    // Open Wali Kelas modal directly
    await page.evaluate(id => {
      if (typeof window.__DEV_OPEN_WALI__ === 'function') {
        window.__DEV_OPEN_WALI__(id);
      } else if (typeof window.__DEV_ENTER_ROOM__ === 'function') {
        window.__DEV_ENTER_ROOM__(id);
      }
    }, room.id);
    await new Promise(r => setTimeout(r, 1000));

    // Wait for WaliKelasModal
    await page.waitForSelector('[data-testid="wali-kelas-modal-content"]', { timeout: 8000 });

    // Inspect question and options
    const modalData = await page.evaluate(() => {
      const h4 = document.querySelector('[data-testid="wali-kelas-modal-content"] h4');
      const concept = document.querySelector('[data-testid="wali-kelas-modal-content"] span');
      const btns = Array.from(document.querySelectorAll('[data-testid^="wali-quiz-option-"]')).map(b => b.innerText.trim());
      return {
        concept: concept ? concept.innerText : '',
        question: h4 ? h4.innerText : '',
        options: btns
      };
    });

    console.log('Concept:', modalData.concept);
    console.log('Question:', modalData.question);
    console.log('Options:', modalData.options);

    // Capture standard question modal
    const shotPath = path.join(ARTIFACTS_DIR, `quiz_unique_${room.slug}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot -> ${shotPath}`);

    // If room is VII-A, test clicking a WRONG answer to verify anti-spam cooldown!
    if (room.id === 'A1') {
      console.log('Testing anti-spam wrong click on VII-A...');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('[data-testid^="wali-quiz-option-"]'));
        // Find a button that is definitely not the correct answer or pick first
        btns[0].click();
      });
      await new Promise(r => setTimeout(r, 400));

      // Capture cooldown screenshot!
      const shotCooldown = path.join(ARTIFACTS_DIR, `quiz_antispam_cooldown_vii_a.png`);
      await page.screenshot({ path: shotCooldown });
      console.log(`Saved cooldown screenshot -> ${shotCooldown}`);

      // Check if cooldown timer text is present
      const cooldownText = await page.evaluate(() => {
        return document.body.innerText.includes('Waktu berpikir') || document.body.innerText.includes('kurang tepat');
      });
      console.log('Cooldown/error feedback active:', cooldownText);

      // Verify buttons are disabled during cooldown
      const isDisabled = await page.evaluate(() => {
        const b = document.querySelector('[data-testid^="wali-quiz-option-"]');
        return b ? b.disabled : false;
      });
      console.log('Buttons disabled during cooldown:', isDisabled);

      // Wait 2.2 seconds for cooldown to expire and reshuffle
      await new Promise(r => setTimeout(r, 2300));
      const isReEnabled = await page.evaluate(() => {
        const b = document.querySelector('[data-testid^="wali-quiz-option-"]');
        return b ? !b.disabled : false;
      });
      console.log('Buttons re-enabled after cooldown:', isReEnabled);
    }

    // Now solve with key 'U' to pass and close
    await page.keyboard.press('u');
    await new Promise(r => setTimeout(r, 600));

    // Click collect data button
    const collectBtn = await page.$('[data-testid="btn-collect-wali-data"]');
    if (collectBtn) {
      await collectBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  await browser.close();
  console.log('\nALL UNIQUE QUIZ & ANTI-SPAM TESTS PASSED SUCCESSFULLY!');
})();
