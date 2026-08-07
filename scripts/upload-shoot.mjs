import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, extname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { compressFile, PHOTO_EXTS } from './lib/compress-image.mjs';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
// '#' breaks the site's build (Astro's static-file cleanup parses paths as URLs,
// where '#' starts a fragment and truncates the folder name).
const INVALID_NAME_CHARS_RE = /#/;

function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8' });
}

function fail(message) {
  console.log(`ERROR: ${message}`);
  process.exit(1);
}

const sourceArg = process.argv[2];
if (!sourceArg) fail('No source folder provided.');

const sourcePath = resolve(sourceArg);
if (!existsSync(sourcePath) || !statSync(sourcePath).isDirectory()) {
  fail(`Source folder not found: ${sourcePath}`);
}

const shootName = basename(sourcePath);
if (INVALID_NAME_CHARS_RE.test(shootName)) {
  fail(`Folder name "${shootName}" cannot contain "#" — it breaks the site's build. Rename the source folder and try again.`);
}

const destDir = join(ROOT, 'drone-photos', shootName);
mkdirSync(destDir, { recursive: true });

console.log(`Uploading shoot ${shootName}`);
console.log(`  source: ${sourcePath}`);
console.log(`  dest:   ${destDir}`);
console.log('');

let copiedPhotos = 0;
let copiedDescription = false;
let skipped = 0;

for (const entry of readdirSync(sourcePath)) {
  const full = join(sourcePath, entry);
  if (statSync(full).isDirectory()) {
    console.log(`  skip (subfolder): ${entry}`);
    skipped++;
    continue;
  }

  const ext = extname(entry).toLowerCase();
  if (PHOTO_EXTS.has(ext)) {
    copyFileSync(full, join(destDir, entry));
    copiedPhotos++;
  } else if (entry.toLowerCase() === 'description.txt') {
    copyFileSync(full, join(destDir, entry));
    copiedDescription = true;
  } else {
    console.log(`  skip (not a photo): ${entry}`);
    skipped++;
  }
}

if (copiedPhotos === 0) {
  fail('No photos found to upload — only image files and description.txt are copied (videos and other files are skipped).');
}

console.log('');
console.log(`Copied ${copiedPhotos} photo(s)${copiedDescription ? ' + description.txt' : ''}, skipped ${skipped} file(s).`);
console.log('');
console.log('Compressing...');

for (const entry of readdirSync(destDir)) {
  if (PHOTO_EXTS.has(extname(entry).toLowerCase())) {
    await compressFile(join(destDir, entry));
  }
}

console.log('');
console.log('Syncing with GitHub...');

try {
  git('pull');
} catch (err) {
  fail(`git pull failed — resolve this manually before uploading.\n${err.message}`);
}

git(`add "drone-photos/${shootName}"`);

let hasChanges;
try {
  git('diff --cached --quiet');
  hasChanges = false;
} catch {
  hasChanges = true;
}

if (!hasChanges) {
  console.log('');
  console.log('Nothing new to commit — shoot already up to date.');
  process.exit(0);
}

git(`commit -m "Add shoot ${shootName}"`);
console.log('  committed.');

try {
  git('push');
} catch (err) {
  fail(`git push failed.\n${err.message}`);
}

console.log('');
console.log('Done — pushed to GitHub. Vercel will redeploy automatically.');
