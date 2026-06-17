const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../assets/icon-source.png');

async function main() {
  const { data, info } = await sharp(inputPath).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const y = Math.floor(height / 2);
  const lum = (x) => {
    const i = (y * width + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  const samples = [];
  for (let x = 0; x < width; x += 2) {
    samples.push({ x, l: Math.round(lum(x)) });
  }
  console.log('width', width);
  console.log('midline samples (every 2px):');
  console.log(samples.filter((_, i) => i % 8 === 0).map((s) => `${s.x}:${s.l}`).join(' '));

  // Find dark content (dumbbells) extent
  let contentLeft = width, contentRight = 0;
  for (let x = 0; x < width; x++) {
    if (lum(x) < 200) {
      contentLeft = Math.min(contentLeft, x);
      contentRight = Math.max(contentRight, x);
    }
  }
  console.log('content span', contentLeft, contentRight, 'pad', contentLeft, width - contentRight);
}

main();
