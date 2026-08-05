# samuellippman.com

Drone photography portfolio built with [Astro](https://astro.build), deployed on Vercel.

## Adding Photos

Drop shoot folders into `drone-photos/` at the repo root. Each folder must be named `MM-DD-YY` (e.g. `12-13-26`).

Inside each folder:
- Photo files: `.jpg`, `.jpeg`, or `.png` — displayed sorted by filename
- `description.txt` (optional) — displayed as a paragraph above the photos
- 'cover.jpg' (optional) -makes that image the image on the home screen.

Example:
```
drone-photos/
  12-13-26/
    001-sunrise.jpg
    002-coastline.jpg
    cover.jpg
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




## Deploying Changes

After any change:
```bash
git add .
git commit -m "your message"
git push
```

Pushing to `main` triggers an automatic Netlify redeploy.
