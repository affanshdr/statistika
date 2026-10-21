const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('file:///C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/cv_test_vii_b.png');

  const crop = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const img = document.querySelector('img');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const scale = 1280 / 1235;
    const xMid = Math.round(680 * scale);

    const samples = [];
    for (let y = 320; y <= 450; y += 5) {
      const data = ctx.getImageData(xMid, y, 1, 1).data;
      samples.push({ y, r: data[0], g: data[1], b: data[2] });
    }
    return { xMid, samples };
  });

  console.log('Vertical samples through Pak Bambang at x=' + crop.xMid);
  crop.samples.forEach(s => {
    console.log(`  y=${s.y}: rgb(${s.r},${s.g},${s.b})`);
  });

  await browser.close();
})();
