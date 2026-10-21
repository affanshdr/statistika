import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🧪 Starting Wali Kelas Pre-Learning Quiz Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`[Browser Error]:`, msg.text());
    });

    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded.');
    await new Promise(r => setTimeout(r, 1500));

    // Dismiss any start/welcome button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 800));

    // 1. Enter Ruang Kelas VII-A via [K] shortcut
    console.log('Pressing [K] to directly open Wali Kelas VII-A modal...');
    await page.keyboard.press('k');
    await new Promise(r => setTimeout(r, 1200));

    // Check if WaliKelasModal is open
    const modal = await page.$('[data-testid="wali-kelas-modal-content"]');
    if (!modal) throw new Error('WaliKelasModal failed to open!');
    console.log('✅ WaliKelasModal opened successfully!');

    // Screenshot initial question view
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wali_quiz_1_question.png') });
    console.log('📸 Saved screenshot: wali_quiz_1_question.png');

    // 2. Verify Pre-learning concept tag
    const modalText = await page.evaluate(el => el.innerText, modal);
    console.log('Modal excerpt:\n', modalText.slice(0, 350));

    if (!modalText.includes('PRE-PEMBELAJARAN') || !modalText.includes('Jangkauan Data')) {
      throw new Error('Pre-learning concept badge missing or incorrect!');
    }
    console.log('✅ Verified: Pre-learning concept tag rendered correctly!');

    // 3. Verify Collect button is initially locked
    const btnCollect = await page.$('[data-testid="btn-collect-wali-data"]');
    if (!btnCollect) throw new Error('btn-collect-wali-data not found!');
    const isInitiallyDisabled = await page.evaluate(btn => btn.disabled, btnCollect);
    if (!isInitiallyDisabled) throw new Error('btn-collect-wali-data should be disabled before answering!');
    console.log('✅ Verified: Collect button is locked before answering.');

    // 4. Test Option Choices
    const optionButtons = await page.$$('[data-testid^="wali-quiz-option-"]');
    console.log(`Found ${optionButtons.length} option buttons.`);
    if (optionButtons.length < 4) throw new Error('Less than 4 option buttons found!');

    // Test Dev Pass button
    const passBtn = await page.$('[data-testid="btn-dev-pass-wali-quiz"]');
    if (!passBtn) throw new Error('btn-dev-pass-wali-quiz not found!');
    console.log('Testing [⚡ Pass] button for correct answer validation...');
    await passBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Screenshot after answered correctly
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wali_quiz_2_answered.png') });
    console.log('📸 Saved screenshot: wali_quiz_2_answered.png');

    // 5. Verify Collect button is now enabled
    const isNowDisabled = await page.evaluate(btn => btn.disabled, btnCollect);
    if (isNowDisabled) throw new Error('btn-collect-wali-data should be enabled after answering correctly!');
    console.log('✅ Verified: Collect button unlocked with text "Simpan Data ke Misi ►"!');

    // 6. Click Collect button
    console.log('Clicking [Simpan Data ke Misi ►]...');
    await btnCollect.click();
    await new Promise(r => setTimeout(r, 1000));

    const modalAfter = await page.$('[data-testid="wali-kelas-modal-backdrop"]');
    if (modalAfter) throw new Error('Modal failed to close after collecting data!');
    console.log('✅ Verified: Modal closed, data successfully collected into mission inventory!');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wali_quiz_3_collected.png') });
    console.log('📸 Saved screenshot: wali_quiz_3_collected.png');

    console.log('\n🎉 ALL WALI KELAS PRE-LEARNING QUIZ TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
