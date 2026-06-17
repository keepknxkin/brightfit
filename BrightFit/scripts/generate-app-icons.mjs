import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');

const sourceArg = process.argv[2];
const sourcePath = sourceArg
  ? path.resolve(sourceArg)
  : path.join(assetsDir, 'icon-source.png');

if (!fs.existsSync(sourcePath)) {
  console.error(`Source image not found: ${sourcePath}`);
  process.exit(1);
}

const outputs = [
  { file: 'icon.png', size: 1024 },
  { file: 'adaptive-icon.png', size: 1024 },
  { file: 'splash-icon.png', size: 512 },
  { file: 'favicon.png', size: 48 },
  { file: 'icon-source.png', size: 1024 },
];

const source = sharp(sourcePath).ensureAlpha();

for (const { file, size } of outputs) {
  const outPath = path.join(assetsDir, file);
  await source
    .clone()
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`Wrote ${file} (${size}x${size})`);
}

console.log('App icons generated.');
