"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Movie = { id: number; title: string; backdrop_path: string | null; };
type MoviesResponse = { results: Movie[]; };

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function Game() {
  const [pool, setPool] = useState<Movie[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/tmdb/movies").then((r) => r.json()).then((data: MoviesResponse) => {
      const clean = data.results.filter(m => m.backdrop_path);
      setPool(clean);
      startRound(clean);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) { startRound(pool); return; }
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, loading, pool]);

  function startRound(source: Movie[] = pool) {
    if (!source.length) return;
    setLoading(true);
    setTimeLeft(15);
    const pick = source[Math.floor(Math.random() * source.length)];
    setCorrect(pick.title);

    const others = shuffle(source.filter(m => m.id !== pick.id).map(m => m.title)).slice(0, 3);
    setOptions(shuffle([pick.title, ...others]));
    const path = encodeURIComponent(pick.backdrop_path || "");
    const url = `/api/img?path=${path}&w=1280`;
    setImgUrl(url);
    setTimeout(() => setLoading(false), 150);
  }

  function guess(title: string) {
    if (title === correct) setScore((s) => s + 1);
    startRound();
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Score: <span className="text-emerald-400">{score}</span></div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">Time:</div>
          <div className="w-48 h-3 rounded-full bg-gray-800 overflow-hidden">
            <motion.div
              key={timeLeft}
              className="h-full bg-indigo-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft/15)*100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
          <div className="w-10 text-right tabular-nums">{timeLeft}s</div>
        </div>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="aspect-video relative flex items-center justify-center bg-black">
          <AnimatePresence mode="wait">
            {imgUrl ? (
              <motion.img
                key={imgUrl}
                src={imgUrl}
                alt="Movie backdrop"
                className="w-full h-full object-cover"
                initial={{ opacity: 0.0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
              />
            ) : (
              <motion.div
                key="loading"
                className="text-gray-400 p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Loading image…
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button key={opt} onClick={() => guess(opt)} className="btn text-sm md:text-base">
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        This product uses the TMDb API but is not endorsed or certified by TMDb.
      </div>
    </div>
  );
}