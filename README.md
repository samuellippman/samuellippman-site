# samuellippman.com

Drone photography portfolio built with [Astro](https://astro.build), deployed on Netlify.

## Adding Photos

Drop shoot folders into `drone-photos/` at the repo root. Each folder must be named `MM-DD-YY` (e.g. `12-13-26`).

Inside each folder:
- Photo files: `.jpg`, `.jpeg`, or `.png` — displayed sorted by filename
- `description.txt` (optional) — displayed as a paragraph above the photos

Example:
```
drone-photos/
  12-13-26/
    001-sunrise.jpg
    002-coastline.jpg
    description.txt
  11-04-26/
    aerial-01.jpg
```

## Local Development

```bash
npm install
npm run dev
```

Photos in `drone-photos/` are automatically synced into `public/drone-photos/` at startup (that copy is gitignored — only the root `drone-photos/` folder is committed).

## Connecting to Netlify

1. Push this repo to GitHub (see below).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Connect your GitHub account and select **samuellippman-site**.
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**.

## Adding the Custom Domain (samuellippman.com)

1. In Netlify: **Site settings** → **Domain management** → **Add custom domain** → enter `samuellippman.com`.
2. Netlify will provide nameservers or a CNAME record.
3. In your domain registrar's DNS settings, point `samuellippman.com` to Netlify using those records.
4. Netlify automatically provisions an SSL certificate via Let's Encrypt.

## Deploying Changes

After any change:
```bash
git add .
git commit -m "your message"
git push
```

Pushing to `main` triggers an automatic Netlify redeploy.
