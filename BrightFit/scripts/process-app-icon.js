const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../assets/icon-source.png');
const OUT = 1024;
// iOS / App Store squircle corner radius (~22.37% of side)
const CORNER_RADIUS = Math.round(OUT * 0.2237);
const WHITE = { r: 255, g: 255, b: 255 };

async function createRoundedMask(size, radius) {
  const svg = `<svg width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Square white canvas with logo centered (letterboxed if needed). */
async function squareLogo(scale = 1) {
  const meta = await sharp(inputPath).metadata();
  const maxSide = Math.round(OUT * scale);
  const logo = await sharp(inputPath)
    .resize(maxSide, maxSide, { fit: 'contain', background: WHITE })
    .png()
    .toBuffer();

  return sharp({
    create: { width: OUT, height: OUT, channels: 3, background: WHITE },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function buildAppStoreIcon() {
  const square = await squareLogo(0.92);
  const mask = await createRoundedMask(OUT, CORNER_RADIUS);

  const masked = await sharp(square)
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  return sharp({
    create: { width: OUT, height: OUT, channels: 3, background: WHITE },
  })
    .composite([{ input: masked, blend: 'over' }])
    .png()
    .toBuffer();
}

/** Android adaptive icon foreground — logo in center 66% safe zone. */
async function buildAdaptiveForeground() {
  const safeScale = 0.66;
  const logo = await squareLogo(safeScale);

  return sharp({
    create: { width: OUT, height: OUT, channels: 4, background: { ...WHITE, alpha: 0 } },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
}

/** Splash — logo only on transparent PNG (no white squircle box). */
async function buildSplashImage() {
  const trimmed = await sharp(inputPath)
    .trim({ threshold: 15 })
    .ensureAlpha()
    .png()
    .toBuffer();

  const LOGO_SIZE = 400;
  return sharp(trimmed)
    .resize(LOGO_SIZE, LOGO_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing source: ${inputPath}`);
  }

  const assetsDir = path.join(__dirname, '../assets');
  const icon = await buildAppStoreIcon();
  const adaptive = await buildAdaptiveForeground();
  const splash = await buildSplashImage();

  await sharp(icon).toFile(path.join(assetsDir, 'icon.png'));
  await sharp(icon).toFile(path.join(assetsDir, 'favicon.png'));
  await sharp(adaptive).toFile(path.join(assetsDir, 'adaptive-icon.png'));
  await sharp(splash).toFile(path.join(assetsDir, 'splash-icon.png'));

  console.log('Generated icon.png, adaptive-icon.png, splash-icon.png, favicon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
