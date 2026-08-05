import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { compressFile, PHOTO_EXTS } from './lib/compress-image.mjs';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const DRONE_DIR = join(ROOT, 'drone-photos');

async function processDir(dir) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      console.log(`\n📁 ${entry}`);
      await processDir(full);
    } else if (PHOTO_EXTS.has(extname(entry).toLowerCase())) {
      await compressFile(full);
    }
  }
}

console.log('Compressing drone photos...');
await processDir(DRONE_DIR);
console.log('\nDone.');
