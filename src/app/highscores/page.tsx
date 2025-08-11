import { supabase } from "@/lib/supabase";

export default async function HighScoresPage() {
  const { data } = supabase
    ? await supabase
        .from("scores")
        .select("name, score, created_at")
        .order("score", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">High Scores</h1>
      <ol className="w-full max-w-md space-y-2">
        {data?.map((item, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span>{item.score}</span>
            <span className="text-gray-400">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
