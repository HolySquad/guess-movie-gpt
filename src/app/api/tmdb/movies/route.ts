import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "TMDB_API_KEY is missing" },
      { status: 500 }
    );

  // Discover popular movies
  const discoverUrl = new URL("https://api.themoviedb.org/3/discover/movie");
  discoverUrl.searchParams.set("api_key", apiKey);
  discoverUrl.searchParams.set("language", "en-US");
  discoverUrl.searchParams.set("sort_by", "popularity.desc");
  discoverUrl.searchParams.set("include_adult", "false");
  discoverUrl.searchParams.set("include_video", "false");
  discoverUrl.searchParams.set("page", "1");
  discoverUrl.searchParams.set("with_original_language", "en");

  const resp = await fetch(discoverUrl.toString(), { cache: "no-store" });
  const data = await resp.json();
  const movies = data.results?.slice(0, 50) ?? [];

  // For each movie fetch a random backdrop (actual frame)
  const withFrames = await Promise.all(
    movies.map(async (m: any) => {
      try {
        const imgUrl = new URL(
          `https://api.themoviedb.org/3/movie/${m.id}/images`
        );
        imgUrl.searchParams.set("api_key", apiKey);
        imgUrl.searchParams.set("include_image_language", "en,null");
        const imgResp = await fetch(imgUrl.toString());
        const imgData = await imgResp.json();
        const backdrops = imgData.backdrops || [];
        const pick =
          backdrops[Math.floor(Math.random() * backdrops.length)] || null;
        return {
          id: m.id,
          title: m.title,
          backdrop_path: pick?.file_path || m.backdrop_path || null,
        };
      } catch {
        return { id: m.id, title: m.title, backdrop_path: m.backdrop_path };
      }
    })
  );

  return NextResponse.json({ results: withFrames });
}
