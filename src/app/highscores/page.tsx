"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Score = { name: string; score: number; created_at: string };

export default function HighScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [current, setCurrent] = useState<(Score & { rank: number }) | null>(
    null
  );

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from("scores")
        .select("name, score, created_at")
        .order("score", { ascending: false })
        .limit(10);
      const list = data ?? [];
      setScores(list);

      const nickname = localStorage.getItem("nickname");
      if (!nickname) return;

      const idx = list.findIndex((s) => s.name === nickname);
      if (idx !== -1) {
        setCurrent({ ...list[idx], rank: idx + 1 });
        return;
      }

      const { data: userData } = await supabase
        .from("scores")
        .select("name, score, created_at")
        .eq("name", nickname)
        .order("score", { ascending: false })
        .limit(1);

      if (userData && userData[0]) {
        const userScore = userData[0];
        const { count } = await supabase
          .from("scores")
          .select("score", { count: "exact", head: true })
          .gt("score", userScore.score);
        setCurrent({ ...userScore, rank: (count ?? 0) + 1 });
      }
    }

    load();
  }, []);

  const showExtraRow =
    current && scores.findIndex((s) => s.name === current.name) === -1;

  return (
    <main className="min-h-screen p-4 sm:p-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">High Scores</h1>
      <ol className="w-full max-w-md space-y-2">
        {scores.map((item, idx) => (
          <li
            key={idx}
            className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-sm ${
              current?.name === item.name ? "text-emerald-400" : ""
            }`}
          >
            <span>{idx + 1}</span>
            <span className="font-medium truncate">{item.name}</span>
            <span className="text-right">{item.score}</span>
            <span className="text-right text-gray-400 hidden sm:block">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
        {showExtraRow && current && (
          <li className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-sm border-t border-gray-700 pt-2 mt-2">
            <span>{current.rank}</span>
            <span className="font-medium truncate">{current.name}</span>
            <span className="text-right">{current.score}</span>
            <span className="text-right text-gray-400 hidden sm:block">
              {new Date(current.created_at).toLocaleDateString()}
            </span>
          </li>
        )}
      </ol>
    </main>
  );
}
