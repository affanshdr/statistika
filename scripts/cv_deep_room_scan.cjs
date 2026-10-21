const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const rooms = [
    { id: 'A2', name: 'Ruang VII-B', file: 'Ruang%20VII-B/VII-B.webp' },
    { id: 'B1', name: 'Ruang VIII-A', file: 'Ruang%20VIII-A/VIII-A.webp' },
    { id: 'B2', name: 'Ruang VIII-B', file: 'Ruang%20VIII-B/VIII-B.webp' },
  ];

  for (const r of rooms) {
    await page.goto(`http://localhost:3000/Assets/Building/${r.file}`, { waitUntil: 'load' });
    const analysis = await page.evaluate(() => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);
      const data = ctx.getImageData(0, 0, 1235, 650).data;

      const getPixel = (x, y) => {
        const i = (y * 1235 + x) * 4;
        return [data[i], data[i+1], data[i+2]];
      };

      // 1. Detect chalkboard green pixels:
      // Typically: G > 60, G > R + 15, G > B + 15, R < 120, B < 120
      let cbMinX = 1235, cbMaxX = 0, cbMinY = 650, cbMaxY = 0;
      for (let y = 80; y < 400; y++) {
        for (let x = 150; x < 1100; x++) {
          const [red, green, blue] = getPixel(x, y);
          // chalkboard dark/medium green
          if (green > red + 10 && green > blue + 10 && green < 140 && red < 100 && blue < 100) {
            if (x < cbMinX) cbMinX = x;
            if (x > cbMaxX) cbMaxX = x;
            if (y < cbMinY) cbMinY = y;
            if (y > cbMaxY) cbMaxY = y;
          }
        }
      }

      // 2. Scan the floor in front of the chalkboard: y from cbMaxY to cbMaxY + 180
      // Detect student heads / bodies / desks
      // Floor in these rooms is generally light colored tiles (R ~ 180-230, G ~ 170-220, B ~ 160-210)
      // Desks: brown wood (R ~ 120-180, G ~ 70-120, B ~ 30-70)
      // Uniforms: dark navy (R < 50, G < 60, B < 90) or white shirt (R > 210, G > 210, B > 210)
      // Hair: dark (R < 60, G < 50, B < 50)
      
      const scanMap = [];
      for (let y = cbMaxY - 10; y <= cbMaxY + 160; y += 5) {
        let spans = [];
        let curFloor = null;
        for (let x = cbMinX - 30; x <= cbMaxX + 30; x += 3) {
          const [r, g, b] = getPixel(x, y);
          const brightness = (r + g + b) / 3;
          // Is it floor?
          // Floor tiles have relatively low color saturation and moderate to high brightness
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          const isFloor = brightness > 130 && maxDiff < 45 && !(r > 160 && g < 110 && b < 80); // not wood

          if (isFloor) {
            if (!curFloor) curFloor = { start: x, end: x };
            else curFloor.end = x;
          } else {
            if (curFloor) {
              if (curFloor.end - curFloor.start >= 30) spans.push(curFloor);
              curFloor = null;
            }
          }
        }
        if (curFloor && curFloor.end - curFloor.start >= 30) spans.push(curFloor);
        if (spans.length > 0) {
          scanMap.push({ y, spans });
        }
      }

      return {
        chalkboard: { minX: cbMinX, maxX: cbMaxX, minY: cbMinY, maxY: cbMaxY, width: cbMaxX - cbMinX, height: cbMaxY - cbMinY, centerX: Math.round((cbMinX + cbMaxX)/2) },
        scanMap
      };
    });

    console.log(`=== ${r.name} ===`);
    console.log('Chalkboard:', JSON.stringify(analysis.chalkboard));
    console.log('Open Floor Rows:');
    analysis.scanMap.forEach(row => {
      const spanStr = row.spans.map(s => `[${s.start}..${s.end}] (w:${s.end-s.start})`).join(', ');
      console.log(`  y=${row.y}: ${spanStr}`);
    });
  }

  await browser.close();
})();
