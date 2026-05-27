import sharp from 'sharp';
import { readdirSync, statSync, renameSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const DRONE_DIR = join(ROOT, 'drone-photos');
const PHOTO_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const SKIP_BELOW_MB = 4; // already compressed if under 4MB

async function compressFile(filePath) {
  const sizeMB = statSync(filePath).size / 1024 / 1024;
  if (sizeMB < SKIP_BELOW_MB) {
    console.log(`  skip  ${basename(filePath)} (${sizeMB.toFixed(1)}MB — already small)`);
    return;
  }

  const tmp = filePath + '.tmp';
  const ext = extname(filePath).toLowerCase();

  try {
    const pipeline = sharp(filePath)
      .rotate() // auto-orient from EXIF, then strip metadata
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true });

    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 8 }).toFile(tmp);
    } else {
      await pipeline.jpeg({ quality: 85, progressive: true }).toFile(tmp);
    }

    const newMB = statSync(tmp).size / 1024 / 1024;
    renameSync(tmp, filePath);
    console.log(`  ✓  ${basename(filePath)}  ${sizeMB.toFixed(1)}MB → ${newMB.toFixed(1)}MB`);
  } catch (err) {
    if (existsSync(tmp)) renameSync(tmp, filePath); // restore on error
    console.error(`  ✗  ${basename(filePath)}: ${err.message}`);
  }
}

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
