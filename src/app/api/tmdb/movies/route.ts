import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY is missing" }, { status: 500 });

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("include_video", "false");
  url.searchParams.set("page", "1");
  url.searchParams.set("with_original_language", "en");

  const resp = await fetch(url.toString(), { cache: "no-store" });
  const data = await resp.json();
  return NextResponse.json({ results: data.results?.slice(0, 50) ?? [] });
}