"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Movie = { id: number; title: string; backdrop_path: string | null; };
type MoviesResponse = { results: Movie[]; };

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function Game() {
  const ROUND_TIME = 15;
  const MAX_POINTS = 10;

  const [pool, setPool] = useState<Movie[]>([]);
  const [remaining, setRemaining] = useState<Movie[]>([]);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [tempName, setTempName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("nickname");
    if (storedName) setNickname(storedName);
    const storedScores = localStorage.getItem("highScores");
    if (storedScores) setHighScores(JSON.parse(storedScores));
    fetch("/api/tmdb/movies").then((r) => r.json()).then((data: MoviesResponse) => {
      const clean = data.results.filter((m) => m.backdrop_path);
      setPool(clean);
      setRemaining(clean);
    });
  }, []);

  useEffect(() => {
    if (!nickname || loading || gameOver) return;
    if (timeLeft <= 0) {
      startRound();
      return;
    }
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, loading, nickname, gameOver]);

  useEffect(() => {
    if (nickname && remaining.length && question === 0) startRound();
  }, [nickname, remaining, question]);

  function startRound() {
    if (question >= 20 || remaining.length === 0) {
      endGame();
      return;
    }
    setLoading(true);
    setTimeLeft(ROUND_TIME);
    const idx = Math.floor(Math.random() * remaining.length);
    const pick = remaining[idx];
    setRemaining((prev) => prev.filter((_, i) => i !== idx));
    setCorrect(pick.title);

    const others = shuffle(pool.filter((m) => m.id !== pick.id).map((m) => m.title)).slice(0, 3);
    setOptions(shuffle([pick.title, ...others]));
    const path = encodeURIComponent(pick.backdrop_path || "");
    const url = `/api/img?path=${path}&w=1280`;
    setImgUrl(url);
    setQuestion((q) => q + 1);
    setTimeout(() => setLoading(false), 150);
  }

  function guess(title: string) {
    if (title === correct) {
      const points = Math.round(((timeLeft - 1) / (ROUND_TIME - 1)) * (MAX_POINTS - 1) + 1);
      setScore((s) => s + points);
    }
    startRound();
  }

  function endGame() {
    setGameOver(true);
    const updated = [...highScores, { name: nickname, score }].sort((a, b) => b.score - a.score);
    setHighScores(updated);
    localStorage.setItem("highScores", JSON.stringify(updated));
  }

  function submitNickname() {
    if (!tempName.trim()) return;
    localStorage.setItem("nickname", tempName.trim());
    setNickname(tempName.trim());
  }

  function restart() {
    setScore(0);
    setQuestion(0);
    setTimeLeft(ROUND_TIME);
    setGameOver(false);
    setRemaining(pool);
    startRound();
  }
  if (!nickname) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
        <input
          className="input"
          placeholder="Enter nickname"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
        <button className="btn" onClick={submitNickname}>
          Start
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold">Game Over!</h2>
        <p>
          Your score: <span className="text-emerald-400">{score}</span>
        </p>
        <h3 className="font-semibold">High Scores</h3>
        <ol className="space-y-1">
          {highScores.map((hs, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{hs.name}</span>
              <span>{hs.score}</span>
            </li>
          ))}
        </ol>
        <button className="btn" onClick={restart}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">
          Score: <span className="text-emerald-400">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">Time:</div>
          <div className="w-48 h-3 rounded-full bg-gray-800 overflow-hidden">
            <motion.div
              key={timeLeft}
              className="h-full bg-indigo-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / ROUND_TIME) * 100}%` }}
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