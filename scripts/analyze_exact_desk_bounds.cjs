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
    const analyzeRoom = (id, roomName) => {
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

      // Let's scan from y=240 to y=380 for each x between 300 and 900
      // For each x, determine if there is ANY obstacle (desk, chair, student)
      // Obstacle detection:
      // Floor colors:
      // In VIII-A: warm yellowish-brown tiles (r: 195-240, g: 165-210, b: 120-170, r > g && g > b)
      // In VIII-B: cool grayish tiles (r: 175-220, g: 160-200, b: 145-185)
      // Any student uniform:
      // - White shirt: r,g,b > 215, saturation very low
      // - Navy blue skirt/pants: r < 60, g < 60, b < 100
      // - Hijab: white r,g,b > 220
      // - Wooden desk: dark reddish brown (r > 100, g < 120, b < 80, r - g > 25, r - b > 40)
      // - Metal/wooden chair legs: very dark (brightness < 60)

      // Let's test candidate X positions for teacher from 450 to 750 (step 5)
      // A teacher sprite occupies [x - 60, x + 60] horizontally, and [y - 211, y] vertically
      // Feet are at y = 330..360
      // Torso / legs are at y = 200..350
      // Student desks in midground are at y ~ 260..380
      // We want to test every candidate (x, y) and score the collision!
      
      const candidates = [];
      for (let y = 320; y <= 360; y += 5) {
        for (let x = 460; x <= 720; x += 5) {
          // Check collision between [x-55..x+55] and [y-140..y]
          // Specifically around the lower body [x-50..x+50] and [y-90..y] where overlap with desks happens
          let collisionCount = 0;
          for (let checkX = x - 50; checkX <= x + 50; checkX += 4) {
            for (let checkY = y - 80; checkY <= y; checkY += 4) {
              const [r, g, b] = getPixel(checkX, checkY);
              const br = (r + g + b) / 3;
              // Is this pixel a student desk or seated student?
              const isDesk = (r > 100 && r - g > 25 && r - b > 40 && br < 150);
              const isChairDark = (br < 65);
              const isStudentNavy = (b > r + 15 && br < 100);
              const isStudentWhite = (r > 215 && g > 215 && b > 215 && Math.abs(r-g) < 15);
              if (isDesk || isChairDark || isStudentNavy || isStudentWhite) {
                collisionCount++;
              }
            }
          }
          candidates.push({ x, y, collisions: collisionCount });
        }
      }

      // Sort by fewest collisions
      candidates.sort((a, b) => a.collisions - b.collisions);

      return {
        roomName,
        topCandidates: candidates.slice(0, 15)
      };
    };

    return {
      VIII_A: analyzeRoom('imgA', 'Ruang VIII-A'),
      VIII_B: analyzeRoom('imgB', 'Ruang VIII-B')
    };
  });

  console.log('=== ' + result.VIII_A.roomName + ' Top Candidates (Lowest Collisions) ===');
  result.VIII_A.topCandidates.forEach(c => console.log(`  x=${c.x}, y=${c.y} -> collisions: ${c.collisions}`));

  console.log('\n=== ' + result.VIII_B.roomName + ' Top Candidates (Lowest Collisions) ===');
  result.VIII_B.topCandidates.forEach(c => console.log(`  x=${c.x}, y=${c.y} -> collisions: ${c.collisions}`));

  await browser.close();
})();
