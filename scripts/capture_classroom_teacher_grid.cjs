const puppeteer = require('puppeteer');
const path = require('path');
const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

const ROOMS = [
  { id: 'A1', slug: 'vii_a', teacher: { name: 'Bu Sari', x: 617, y: 440, size: 230 }, spawn: { x: 940, y: 540 } },
  { id: 'A2', slug: 'vii_b', teacher: { name: 'Pak Bambang', x: 685, y: 475, size: 130 }, spawn: { x: 920, y: 540 } },
  { id: 'B1', slug: 'viii_a', teacher: { name: 'Bu Rina', x: 617, y: 445, size: 130 }, spawn: { x: 930, y: 540 } },
  { id: 'B2', slug: 'viii_b', teacher: { name: 'Pak Setiawan', x: 617, y: 445, size: 130 }, spawn: { x: 930, y: 540 } },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
    await page.setViewport({ width: 1280, height: 720 });
    // demoData=full -> all classes saved, so no auto dialogue bubble covers the teacher
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&demoData=full', { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));
    for (const btn of await page.$$('button')) {
      const t = await page.evaluate(el => el.innerText, btn);
      if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
    }
    await new Promise(r => setTimeout(r, 800));

    for (const room of ROOMS) {
      await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), room.id);
      await new Promise(r => setTimeout(r, 1800));

      // Remove any leftover overlay
      await page.evaluate(() => document.getElementById('__coord_overlay__')?.remove());
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `kelas_${room.slug}_clean.png`) });

      // Inject coordinate grid overlay into the main game SVG (world space 1235x650)
      const ok = await page.evaluate((room) => {
        const svgs = [...document.querySelectorAll('svg')];
        const svg = svgs.find(s => (s.getAttribute('viewBox') || '').trim() === '0 0 1235 650')
          || svgs.sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0];
        if (!svg) return false;
        const NS = 'http://www.w3.org/2000/svg';
        const g = document.createElementNS(NS, 'g');
        g.id = '__coord_overlay__';
        g.setAttribute('pointer-events', 'none');
        const mk = (tag, attrs, text) => {
          const el = document.createElementNS(NS, tag);
          Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
          if (text) el.textContent = text;
          g.appendChild(el);
          return el;
        };
        for (let x = 0; x <= 1235; x += 50) {
          const major = x % 100 === 0;
          mk('line', { x1: x, y1: 0, x2: x, y2: 650, stroke: major ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)', 'stroke-width': major ? 1 : 0.6 });
          if (major) mk('text', { x: x + 2, y: 12, fill: '#FDE047', 'font-size': 11, 'font-weight': 900, stroke: '#000', 'stroke-width': 2.5, 'paint-order': 'stroke' }, String(x));
        }
        for (let y = 0; y <= 650; y += 50) {
          const major = y % 100 === 0;
          mk('line', { x1: 0, y1: y, x2: 1235, y2: y, stroke: major ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)', 'stroke-width': major ? 1 : 0.6 });
          if (major) mk('text', { x: 3, y: y - 2, fill: '#FDE047', 'font-size': 11, 'font-weight': 900, stroke: '#000', 'stroke-width': 2.5, 'paint-order': 'stroke' }, String(y));
        }
        // Teacher anchor (red)
        const t = room.teacher;
        mk('circle', { cx: t.x, cy: t.y, r: 7, fill: 'none', stroke: '#EF4444', 'stroke-width': 3 });
        mk('line', { x1: t.x - 14, y1: t.y, x2: t.x + 14, y2: t.y, stroke: '#EF4444', 'stroke-width': 2.5 });
        mk('line', { x1: t.x, y1: t.y - 14, x2: t.x, y2: t.y + 14, stroke: '#EF4444', 'stroke-width': 2.5 });
        mk('text', { x: t.x + 12, y: t.y + 26, fill: '#FFFFFF', 'font-size': 14, 'font-weight': 900, stroke: '#B91C1C', 'stroke-width': 4, 'paint-order': 'stroke' }, `${t.name}: x=${t.x}, y=${t.y}, size=${t.size}`);
        // Stevunt spawn (cyan)
        const s = room.spawn;
        mk('circle', { cx: s.x, cy: s.y, r: 7, fill: 'none', stroke: '#22D3EE', 'stroke-width': 3 });
        mk('text', { x: s.x - 60, y: s.y + 28, fill: '#FFFFFF', 'font-size': 13, 'font-weight': 900, stroke: '#0E7490', 'stroke-width': 4, 'paint-order': 'stroke' }, `Stevunt: x=${s.x}, y=${s.y}`);
        svg.appendChild(g);
        return true;
      }, room);
      console.log(room.id, 'overlay:', ok);
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `kelas_${room.slug}_grid.png`) });
      await page.evaluate(() => document.getElementById('__coord_overlay__')?.remove());
      console.log('captured', room.slug);
    }
  } finally {
    await browser.close();
  }
})();
