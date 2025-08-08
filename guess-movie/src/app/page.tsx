import Game from "@/components/Game";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">🎬 Guess the Movie</h1>
        <p className="text-gray-300">TMDb backdrops via server proxy (no CORS headaches)</p>
      </div>
      <Game />
      <footer className="text-xs text-gray-400 mt-8">
        This product uses the TMDb API but is not endorsed or certified by TMDb.
      </footer>
    </main>
  );
}