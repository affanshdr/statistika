const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/corkboard_sort_3_modus.png';
const stats = fs.statSync(imgPath);
console.log('File size:', stats.size);
