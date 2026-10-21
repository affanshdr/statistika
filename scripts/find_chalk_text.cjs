const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });
  await page.goto('http://localhost:3000/Assets/Building/Ruang%20VII-B/VII-B.webp');

  const textInfo = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = 1235;
    canvas.height = 650;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 1235, 650);
    const data = ctx.getImageData(0, 0, 1235, 650).data;

    // Chalk text is white/light-gray inside the chalkboard area (y: 140..300, x: 350..1020)
    let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
    for (let y = 140; y < 300; y++) {
      for (let x = 350; x < 1020; x++) {
        const i = (y * 1235 + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        if (r > 160 && g > 160 && b > 160 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { textMinX: minX, textMaxX: maxX, textMinY: minY, textMaxY: maxY, textCenterX: (minX + maxX)/2 };
  });

  console.log('Chalk text bounds in VII-B:', JSON.stringify(textInfo));
  await browser.close();
})();
