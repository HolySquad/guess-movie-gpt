import Game from "@/components/Game";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">🎬 What The Film</h1>
        <p className="text-gray-300">Can you guess the movie from a single backdrop?</p>
      </div>
      <Game />
    </main>
  );
}