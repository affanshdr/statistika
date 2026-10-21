const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Let's analyze cv_test_vii_b.png by loading it on canvas
  const filePath = 'file:///C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/cv_test_vii_b.png';
  await page.goto(filePath);

  const loc = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Pak Bambang's white shirt (with pinkish/lavender tint) and tie/pen
    // Or his dark purple pants (R ~ 60-80, G ~ 40-60, B ~ 80-110)
    let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
    for (let y = 100; y < 500; y++) {
      for (let x = 400; x < 900; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        // Pants: r 60-95, g 45-75, b 85-130
        if (b > r + 15 && b > g + 20 && r > 50 && r < 110 && g > 40 && g < 90) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { canvasW: canvas.width, canvasH: canvas.height, pantsBox: { minX, maxX, minY, maxY, cx: (minX + maxX)/2 } };
  });

  console.log('Pak Bambang location in cv_test_vii_b.png:', JSON.stringify(loc));
  await browser.close();
})();
