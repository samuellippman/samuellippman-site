import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

function syncDronePhotos() {
  return {
    name: 'sync-drone-photos',
    hooks: {
      'astro:config:setup': () => {
        const root = process.cwd();
        const src = join(root, 'drone-photos');
        const dest = join(root, 'public', 'drone-photos');
        if (existsSync(src)) {
          if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
          mkdirSync(dest, { recursive: true });
          cpSync(src, dest, { recursive: true });
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://samuellippman.com',
  output: 'static',
  integrations: [sitemap(), syncDronePhotos()],
});
