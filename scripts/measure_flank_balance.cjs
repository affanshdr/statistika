const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const b64BgA = fs.readFileSync('public/Assets/Building/Ruang VIII-A/VIII-A.webp').toString('base64');
  const b64BgB = fs.readFileSync('public/Assets/Building/Ruang VIII-B/VIII-B.webp').toString('base64');

  await page.setContent(`
    <img id="bgA" src="data:image/webp;base64,${b64BgA}" />
    <img id="bgB" src="data:image/webp;base64,${b64BgB}" />
  `);
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    const testOffsets = (id, candidates) => {
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

      const out = [];
      for (const { x, y } of candidates) {
        // Teacher sprite box: [x - 60, x + 60], [y - 211, y]
        // Lower body region: y from y-120 to y, x from x-50 to x+50
        // Desk collision check:
        // Left flank check: [x - 55 .. x - 35], y from y-90 to y
        // Right flank check: [x + 35 .. x + 55], y from y-90 to y
        let leftFlankHits = 0;
        let rightFlankHits = 0;
        let totalHits = 0;

        for (let cy = y - 90; cy <= y; cy += 3) {
          for (let cx = x - 55; cx <= x + 55; cx += 3) {
            const [r, g, b] = getPixel(cx, cy);
            const br = (r + g + b) / 3;
            // Desk wood or student clothing
            const isWood = (r > 95 && r - g > 20 && r - b > 35 && br < 160);
            const isDark = (br < 65);
            const isWhiteShirt = (r > 215 && g > 215 && b > 215);
            const isNavy = (b > r + 15 && br < 100);

            if (isWood || isDark || isWhiteShirt || isNavy) {
              totalHits++;
              if (cx < x) leftFlankHits++;
              else rightFlankHits++;
            }
          }
        }
        out.push({ x, y, totalHits, leftFlankHits, rightFlankHits, balance: Math.abs(leftFlankHits - rightFlankHits) });
      }
      return out;
    };

    return {
      VIII_A: testOffsets('bgA', [
        { x: 685, y: 350 }, // Old
        { x: 610, y: 350 },
        { x: 615, y: 350 },
        { x: 618, y: 348 },
        { x: 620, y: 348 },
        { x: 625, y: 348 },
        { x: 630, y: 348 }
      ]),
      VIII_B: testOffsets('bgB', [
        { x: 515, y: 345 }, // Old
        { x: 580, y: 345 },
        { x: 585, y: 345 },
        { x: 590, y: 345 },
        { x: 595, y: 345 },
        { x: 600, y: 345 },
        { x: 605, y: 345 },
        { x: 610, y: 345 },
        { x: 615, y: 345 }
      ])
    };
  });

  console.log('=== RUANG VIII-A Candidates Analysis ===');
  result.VIII_A.forEach(c => {
    console.log(`x=${c.x}, y=${c.y} -> TotalHits: ${c.totalHits}, LeftFlank: ${c.leftFlankHits}, RightFlank: ${c.rightFlankHits}, Balance: ${c.balance}`);
  });

  console.log('\n=== RUANG VIII-B Candidates Analysis ===');
  result.VIII_B.forEach(c => {
    console.log(`x=${c.x}, y=${c.y} -> TotalHits: ${c.totalHits}, LeftFlank: ${c.leftFlankHits}, RightFlank: ${c.rightFlankHits}, Balance: ${c.balance}`);
  });

  await browser.close();
})();
