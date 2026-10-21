const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  await page.setContent(`
    <img id="imgA" src="data:image/webp;base64,${b64A}" />
    <img id="imgB" src="data:image/webp;base64,${b64B}" />
  `);
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    const inspect = (id) => {
      const img = document.getElementById(id);
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);
      const data = ctx.getImageData(0, 0, 1235, 650).data;

      const getPixel = (x, y) => {
        const i = (Math.floor(y) * 1235 + Math.floor(x)) * 4;
        return [data[i], data[i+1], data[i+2]];
      };

      // Chalkboard text detection:
      // Chalk text is white or yellow chalk on dark green background:
      // r,g,b > 170, with background green (g > r, g in 40..130)
      const chalkPoints = [];
      for (let y = 80; y <= 250; y++) {
        for (let x = 100; x <= 1100; x++) {
          const [r, g, b] = getPixel(x, y);
          // Bright chalk writing
          if (r > 190 && g > 190 && b > 180) {
            // Check if surrounded by green chalkboard
            const [gr, gg, gb] = getPixel(x, Math.max(80, y - 10));
            if (gg > gr && gg > gb) {
              chalkPoints.push({ x, y });
            }
          }
        }
      }

      let textMinX = 1235, textMaxX = 0, textMinY = 650, textMaxY = 0;
      chalkPoints.forEach(p => {
        if (p.x < textMinX) textMinX = p.x;
        if (p.x > textMaxX) textMaxX = p.x;
        if (p.y < textMinY) textMinY = p.y;
        if (p.y > textMaxY) textMaxY = p.y;
      });

      // Garuda / Presidential portraits at top of chalkboard
      // Typically at top center of chalkboard (y: 40..100)
      
      // Front student desks:
      // Front row desks are at y ~ 280 .. 380
      // Left front desk:
      // Scan horizontally at y=320 from x=200 to 500
      // Scan right front desk from x=600 to 950
      return {
        text: { minX: textMinX, maxX: textMaxX, centerX: Math.round((textMinX + textMaxX)/2), minY: textMinY, maxY: textMaxY, count: chalkPoints.length }
      };
    };

    return { A: inspect('imgA'), B: inspect('imgB') };
  });

  console.log('Chalk text in Ruang VIII-A:', result.A.text);
  console.log('Chalk text in Ruang VIII-B:', result.B.text);
  await browser.close();
})();
