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
    const testRoom = (id, baseR, baseG, baseB) => {
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

      const colorDist = (r1, g1, b1, r2, g2, b2) => {
        return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
      };

      // Let's test at y=320, 335, 350
      const testY = [320, 335, 350];
      const out = [];

      for (const y of testY) {
        const floorPoints = [];
        for (let x = 250; x <= 950; x++) {
          const [r, g, b] = getPixel(x, y);
          // Check if matches floor color
          const d1 = colorDist(r, g, b, baseR, baseG, baseB);
          // Also check floor highlight
          const d2 = colorDist(r, g, b, baseR + 32, baseG + 30, baseB + 30);
          if (d1 < 35 || d2 < 35) {
            floorPoints.push(x);
          }
        }

        // Group into contiguous segments
        const segments = [];
        let cur = null;
        for (const x of floorPoints) {
          if (!cur) cur = { start: x, end: x };
          else if (x <= cur.end + 4) cur.end = x;
          else {
            if (cur.end - cur.start >= 15) segments.push(cur);
            cur = { start: x, end: x };
          }
        }
        if (cur && cur.end - cur.start >= 15) segments.push(cur);
        out.push({ y, segments });
      }

      return out;
    };

    return {
      A: testRoom('imgA', 205, 174, 130),
      B: testRoom('imgB', 189, 171, 156)
    };
  });

  console.log('=== RUANG VIII-A FLOOR CORRIDORS ===');
  result.A.forEach(row => {
    console.log(`y=${row.y}: ` + row.segments.map(s => `[${s.start}..${s.end}] (w:${s.end-s.start}, center:${Math.round((s.start+s.end)/2)})`).join(', '));
  });

  console.log('\n=== RUANG VIII-B FLOOR CORRIDORS ===');
  result.B.forEach(row => {
    console.log(`y=${row.y}: ` + row.segments.map(s => `[${s.start}..${s.end}] (w:${s.end-s.start}, center:${Math.round((s.start+s.end)/2)})`).join(', '));
  });

  await browser.close();
})();
