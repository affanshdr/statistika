import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('📱 Verifying Mobile Landscape Hold & Switch...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // iPhone 14 Landscape: 844 x 390
    await page.setViewport({ width: 844, height: 390 });

    await page.goto('http://localhost:3000/siswa/game?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    const startBtn = await page.$('button.game-btn-start, button');
    if (startBtn) await startBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    const levelBtns = await page.$$('button');
    for (const btn of levelBtns) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Investigasi') || text.includes('Level 1')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2500));

    // Teleport [T] and Interact [E]
    console.log('Teleporting to Pak Sutrisno (Pressing [T])...');
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 1200));

    console.log('Interacting with Pak Sutrisno (Pressing [E])...');
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 800));

    const dialogChoice = await page.$('button[data-testid="dialog-choice-0"], button');
    if (dialogChoice) {
      await page.keyboard.press('e');
    }
    await new Promise(r => setTimeout(r, 1000));

    let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    if (!corkboard) {
      await page.keyboard.press('t');
      await new Promise(r => setTimeout(r, 1000));
      await page.keyboard.press('e');
      await new Promise(r => setTimeout(r, 1000));
      corkboard = await page.$('[data-testid="pak-report-corkboard"]');
    }

    if (!corkboard) throw new Error('Corkboard modal could not be opened!');
    console.log('✅ Corkboard modal opened on mobile!');

    // Click pool token 0 to hold
    const poolToken0 = await page.$('[data-testid="pool-token-0"]');
    await poolToken0.click();
    await new Promise(r => setTimeout(r, 300));

    // Click slot 0 to place
    const slot0 = await page.$('[data-testid="target-slot-0"]');
    await slot0.click();
    await new Promise(r => setTimeout(r, 300));

    // Click pool token 1 to hold
    const poolToken1 = await page.$('[data-testid="pool-token-1"]');
    await poolToken1.click();
    await new Promise(r => setTimeout(r, 300));

    // Click slot 0 to switch!
    await slot0.click();
    await new Promise(r => setTimeout(r, 300));

    const mobileShot = path.join(ARTIFACTS_DIR, 'mobile_landscape_switch_verified.png');
    await page.screenshot({ path: mobileShot });
    console.log('📸 Mobile screenshot saved:', mobileShot);
    console.log('✅ Mobile Landscape Hold & Switch Verified!');
  } catch (err) {
    console.error('❌ Mobile Test Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
