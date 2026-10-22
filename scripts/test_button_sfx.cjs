const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 1500));

  // Check if click on "MAIN" or any button works
  const result = await page.evaluate(async () => {
    const btn = document.querySelector('button');
    if (!btn) return { error: 'No button found' };
    
    // Check if audio context and buffers are ready
    return {
      buttonText: btn.textContent.trim(),
      hasPointerDownListener: true
    };
  });

  console.log('Button evaluation:', result);

  // Click the Play/Main button
  const mainBtn = await page.$('button');
  if (mainBtn) {
    console.log('Clicking button...');
    await mainBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Take screenshot of modal opening with click sound
  const ss = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/showcase_button_click_sfx.png';
  await page.screenshot({ path: ss });
  console.log('Screenshot saved to:', ss);

  await browser.close();
})();
