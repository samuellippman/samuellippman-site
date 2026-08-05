import sharp from 'sharp';
import { statSync, existsSync, renameSync } from 'fs';
import { extname, basename } from 'path';

export const PHOTO_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const SKIP_BELOW_MB = 4; // already compressed if under 4MB

export async function compressFile(filePath) {
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
    console.log(`  ✗  ${basename(filePath)}: ${err.message}`);
  }
}
