# 🎬 What The Film (Vercel-ready)

Vercel-ready Next.js app. Files are at repository root (no nested folder).

## Deploy to Vercel
1. Create a new Vercel project from this repo/zip.
2. In **Project Settings → Environment Variables**, add:
   - `TMDB_API_KEY` = your API key
3. Framework should auto-detect as **Next.js**. If needed:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Deploy.

## Run locally
```bash
cp .env.local.example .env.local
# put your API key in .env.local
npm install
npm run dev
```
Open http://localhost:3000

