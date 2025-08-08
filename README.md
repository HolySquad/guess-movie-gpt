# 🎬 Guess the Movie (TMDb Edition)

Uses **TMDb** metadata + backdrops (images) and proxies them through the Next.js API to avoid CORS issues.

## ⚙️ Setup
1) Get a **TMDb API key** (v3) from https://www.themoviedb.org/
2) Create `.env.local`:
```
TMDB_API_KEY=YOUR_KEY_HERE
```
3) Run with Docker:
```
docker compose up --build
# open http://localhost:3000
```
Or locally:
```
npm install
npm run dev
```

## 🔎 What it does
- Fetches popular movies from TMDb (server-side) — title + backdrop path
- Proxies images via `/api/img?path=...` to avoid CORS
- Shows a random backdrop and 4 title options, 15s timer, score counter

ℹ️ Attribution: This product uses the TMDb API but is not endorsed or certified by TMDb.