const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const files = [
    'anchored_bubble_vii_a_ask.png',
    'anchored_bubble_vii_b_ask.png',
    'anchored_bubble_viii_a_ask.png',
    'anchored_bubble_viii_b_ask.png',
  ];

  for (const f of files) {
    await page.goto(`file:///C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/${f}`);
    const info = await page.evaluate(() => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
      for (let y = 10; y < 350; y++) {
        for (let x = 200; x < 1000; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2];
          if (r > 200 && g > 130 && g < 185 && b < 40) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      return { minX, maxX, minY, maxY, cx: (minX + maxX)/2 };
    });
    console.log(`${f}:`, JSON.stringify(info));
  }

  await browser.close();
})();
