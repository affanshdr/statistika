const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function verifyInGame() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to http://localhost:3000/siswa/game/level/1?dev=true ...');
  await page.goto('http://localhost:3000/siswa/game/level/1?dev=true', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Take snapshot at Gate (Pak Joko Satpam & Player Stevunt)
  await page.waitForSelector('#pak-joko-npc', { timeout: 10000 }).catch(() => console.log('pak-joko-npc selector wait'));
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(artifactDir, 'verify_gate_pak_joko.png') });
  console.log('Captured verify_gate_pak_joko.png');

  // Trigger dialogue or interaction with Satpam to verify cloud / portraits if visible
  const satpamBtn = await page.$('#btn-gate-satpam').catch(() => null);
  if (satpamBtn) {
    await satpamBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'verify_gate_satpam_dialogue.png') });
    console.log('Captured verify_gate_satpam_dialogue.png');
  }

  // 2. Teleport to Ruang VII-A to verify Bu Sari
  await page.evaluate(() => {
    if (window.__devTeleport) {
      window.__devTeleport('A1');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_classroom_bu_sari.png') });
  console.log('Captured verify_classroom_bu_sari.png');

  // 3. Teleport to Ruang VII-B to verify Pak Bambang
  await page.evaluate(() => {
    if (window.__devTeleport) {
      window.__devTeleport('A2');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_classroom_pak_bambang.png') });
  console.log('Captured verify_classroom_pak_bambang.png');

  // 4. Teleport to Ruang Guru to verify Pak Sutrisno
  await page.evaluate(() => {
    if (window.__devTeleport) {
      window.__devTeleport('RG');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_ruang_guru_pak_sutrisno.png') });
  console.log('Captured verify_ruang_guru_pak_sutrisno.png');

  // 5. Teleport to Ruang VIII-A to verify Bu Rina
  await page.evaluate(() => {
    if (window.__devTeleport) {
      window.__devTeleport('B1');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_classroom_bu_rina.png') });
  console.log('Captured verify_classroom_bu_rina.png');

  // 6. Teleport to Ruang VIII-B to verify Pak Setiawan
  await page.evaluate(() => {
    if (window.__devTeleport) {
      window.__devTeleport('B2');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_classroom_pak_setiawan.png') });
  console.log('Captured verify_classroom_pak_setiawan.png');

  // 7. Teleport to Ruang IX to verify Pak Joko Wali Kelas
  await page.evaluate(() => {
    if (window.__devTeleport) {
      window.__devTeleport('C1');
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verify_classroom_pak_joko_ix.png') });
  console.log('Captured verify_classroom_pak_joko_ix.png');

  await browser.close();
  console.log('All character verification screenshots captured successfully!');
}

verifyInGame().catch(console.error);
