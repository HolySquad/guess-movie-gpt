import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const w = searchParams.get("w") || "1280";
  if (!path) return new Response("Missing path", { status: 400 });

  const base = "https://image.tmdb.org/t/p";
  const target = `${base}/w${w}${path.startsWith('/') ? '' : '/'}${path}`;

  const upstream = await fetch(target, { headers: { "Accept": "image/*" } });
  if (!upstream.ok) return new Response("Upstream error", { status: upstream.status });

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*"
    }
  });
}