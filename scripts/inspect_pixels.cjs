const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
      <img id="imgA" src="data:image/webp;base64,${b64A}" />
      <img id="imgB" src="data:image/webp;base64,${b64B}" />
    </body></html>
  `);

  await new Promise(r => setTimeout(r, 500));

  const result = await page.evaluate(() => {
    const analyze = (id) => {
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

      // Let's sample a grid of pixels between x=300 and 900, y=280..380
      // Print every 20 pixels in x, at y=320 and y=350
      const samplesY320 = [];
      const samplesY350 = [];
      for (let x = 300; x <= 900; x += 25) {
        samplesY320.push({ x, rgb: getPixel(x, 320) });
        samplesY350.push({ x, rgb: getPixel(x, 350) });
      }

      return { samplesY320, samplesY350 };
    };

    return {
      A: analyze('imgA'),
      B: analyze('imgB')
    };
  });

  console.log('=== RUANG VIII-A Samples ===');
  console.log('Y=320:');
  result.A.samplesY320.forEach(s => console.log(`  x=${s.x}: rgb(${s.rgb.join(',')})`));
  console.log('Y=350:');
  result.A.samplesY350.forEach(s => console.log(`  x=${s.x}: rgb(${s.rgb.join(',')})`));

  console.log('\n=== RUANG VIII-B Samples ===');
  console.log('Y=320:');
  result.B.samplesY320.forEach(s => console.log(`  x=${s.x}: rgb(${s.rgb.join(',')})`));
  console.log('Y=350:');
  result.B.samplesY350.forEach(s => console.log(`  x=${s.x}: rgb(${s.rgb.join(',')})`));

  await browser.close();
})();
