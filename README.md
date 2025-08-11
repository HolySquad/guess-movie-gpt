# 🎬 What The Film — TMDb (Vercel-ready)

Vercel-ready Next.js app. Files are at repository root (no nested folder).

## Deploy to Vercel
1. Create a new Vercel project from this repo/zip.
2. In **Project Settings → Environment Variables**, add:
   - `TMDB_API_KEY` = your TMDb v3 key
3. Framework should auto-detect as **Next.js**. If needed:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Deploy.

## Run locally
```bash
cp .env.local.example .env.local
# put your TMDB_API_KEY in .env.local
npm install
npm run dev
```
Open http://localhost:3000

This product uses the TMDb API but is not endorsed or certified by TMDb.