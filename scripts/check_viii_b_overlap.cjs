const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('file:///C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/cv_test_viii_b.png');

  const crop = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample colors in a vertical line through Pak Setiawan's feet (x = 515-535 on 1235 scale, or around 535-555 on 1280 scale)
    // from y = 300 to y = 500
    // And see what's at his feet:
    const scale = 1280 / 1235;
    const xMid = Math.round(515 * scale);

    const samples = [];
    for (let y = 320; y <= 450; y += 5) {
      const i = (y * 1280 + xMid) * 4;
      samples.push({ y, r: canvas.getContext('2d').getImageData(xMid, y, 1, 1).data[0], g: canvas.getContext('2d').getImageData(xMid, y, 1, 1).data[1], b: canvas.getContext('2d').getImageData(xMid, y, 1, 1).data[2] });
    }
    return { xMid, samples };
  });

  console.log('Vertical samples through Pak Setiawan at x=' + crop.xMid);
  crop.samples.forEach(s => {
    console.log(`  y=${s.y}: rgb(${s.r},${s.g},${s.b})`);
  });

  await browser.close();
})();
