import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is missing" }, { status: 500 });
  }

  const { id } = params;
  const url = new URL(`https://api.themoviedb.org/3/movie/${id}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");

  const resp = await fetch(url.toString(), { cache: "no-store" });
  const data = await resp.json();

  return NextResponse.json({
    id: data.id,
    title: data.title,
    rating: data.vote_average,
    imdb_id: data.imdb_id,
  });
}
