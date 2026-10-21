const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateVisualAudits() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  // 1. Check Pak Sutrisno Portrait against dark background to clearly see green halo / fringes
  const sutrisnoImg = sharp('public/Assets/Character/pak-sutrisno-portrait.png');
  const sutrisnoMeta = await sutrisnoImg.metadata();
  
  // Create a dark backdrop (navy / dark charcoal) and composite the sprite on it
  const darkBackdrop = await sharp({
    create: {
      width: sutrisnoMeta.width + 40,
      height: sutrisnoMeta.height + 40,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // slate-900
    }
  }).composite([{
    input: 'public/Assets/Character/pak-sutrisno-portrait.png',
    top: 20,
    left: 20
  }]).png().toFile(path.join(artifactDir, 'audit_sutrisno_portrait_dark.png'));

  // 2. Check Pak Joko Satpam on high contrast backdrop
  const jokoImg = sharp('public/Assets/Character/pak-joko-satpam.png');
  const jokoMeta = await jokoImg.metadata();
  await sharp({
    create: {
      width: jokoMeta.width + 40,
      height: jokoMeta.height + 40,
      channels: 4,
      background: { r: 241, g: 245, b: 249, alpha: 1 } // light slate
    }
  }).composite([{
    input: 'public/Assets/Character/pak-joko-satpam.png',
    top: 20,
    left: 20
  }]).png().toFile(path.join(artifactDir, 'audit_joko_satpam_light.png'));

  // 3. Check Pak Sutrisno Avatar on dark & white
  const sutrisnoAvatarImg = sharp('public/Assets/Character/pak-sutrisno-avatar.png');
  await sharp({
    create: {
      width: 300,
      height: 300,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  }).composite([{
    input: 'public/Assets/Character/pak-sutrisno-avatar.png',
    top: 22,
    left: 22
  }]).png().toFile(path.join(artifactDir, 'audit_sutrisno_avatar_dark.png'));

  // 4. Check Pak Joko Avatar on dark & white
  await sharp({
    create: {
      width: 300,
      height: 300,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).composite([{
    input: 'public/Assets/Character/pak-joko-avatar.png',
    top: 22,
    left: 22
  }]).png().toFile(path.join(artifactDir, 'audit_joko_avatar_white.png'));

  console.log('Visual audit images saved to artifact directory!');
}

generateVisualAudits().catch(console.error);
