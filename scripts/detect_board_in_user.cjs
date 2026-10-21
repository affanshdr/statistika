const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const userImgA = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567050788_1d1d468e.png';
  const userImgB = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567061478_9511d57c.png';

  const b64A = fs.readFileSync(userImgA).toString('base64');
  const b64B = fs.readFileSync(userImgB).toString('base64');

  await page.setContent(`
    <img id="imgA" src="data:image/png;base64,${b64A}" />
    <img id="imgB" src="data:image/png;base64,${b64B}" />
  `);
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    // In both user images, find:
    // 1. Where is the chalkboard?
    // In image A (Ruang VIII-A):
    // What is written on the board? "TEKS EKSPOSISI VIII-A"
    // Let's find the green chalkboard rectangle coordinates in normalized [0..1235, 0..650] space
    const findBoard = (id) => {
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

      let minX = 1235, maxX = 0, minY = 650, maxY = 0;
      for (let y = 30; y < 350; y++) {
        for (let x = 50; x < 1200; x++) {
          const [r, g, b] = getPixel(x, y);
          // green chalkboard
          if (g > r + 10 && g > b + 10 && g >= 40 && g <= 160 && r <= 110 && b <= 110) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // Also let's find the yellow or white speech bubble or "Bu Rina" / "Pak Setiawan" text
      return { minX, maxX, centerX: Math.round((minX + maxX)/2), minY, maxY, width: maxX - minX, height: maxY - minY };
    };

    return {
      boardA: findBoard('imgA'),
      boardB: findBoard('imgB')
    };
  });

  console.log('Board in user image A (VIII-A):', result.boardA);
  console.log('Board in user image B (VIII-B):', result.boardB);

  await browser.close();
})();
