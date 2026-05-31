import type { APIRoute } from 'astro';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const SITE = 'https://samuellippman.com';

const STATIC_PAGES = ['', 'about', 'contact'];

export const GET: APIRoute = () => {
  const droneDir = join(process.cwd(), 'public', 'drone-photos');

  const shootSlugs: string[] = existsSync(droneDir)
    ? readdirSync(droneDir).filter(e => {
        if (!/^\d{2}-\d{2}-\d{2}$/.test(e)) return false;
        try { return statSync(join(droneDir, e)).isDirectory(); } catch { return false; }
      })
    : [];

  const urls = [
    ...STATIC_PAGES.map(p => `${SITE}/${p}`),
    ...shootSlugs.map(s => `${SITE}/${s}/`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
