import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dir, '..', 'public');

const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' width='1024' height='1024'>
  <rect width='1024' height='1024' rx='200' fill='#2563eb'/>
  <text x='512' y='680' font-size='440' font-weight='900' font-family='system-ui' text-anchor='middle' fill='white'>CD</text>
</svg>`;

async function main() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(join(PUBLIC, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
