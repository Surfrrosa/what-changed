import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'static', 'icons');
mkdirSync(outDir, { recursive: true });

// Dark rounded square with a bold white W
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#1a1a1a"/>
  <text x="64" y="98" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="82" fill="white">W</text>
</svg>`;

for (const size of [16, 32, 48, 128]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(outDir, `icon${size}.png`));
  console.log(`  icon${size}.png`);
}

console.log('Icons generated.');
