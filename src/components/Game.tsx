"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Movie = { id: number; title: string; backdrop_path: string | null; };
type MoviesResponse = { results: Movie[]; };

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function Game() {
  const [pool, setPool] = useState<Movie[]>([]);
  const [remaining, setRemaining] = useState<Movie[]>([]);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [nickname, setNickname] = useState("");
  const [tempName, setTempName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([]);
  const [lives, setLives] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  async function loadBatch() {
    const data: MoviesResponse = await fetch("/api/tmdb/movies").then((r) =>
      r.json()
    );
    const clean = data.results.filter((m) => m.backdrop_path);
    setPool((prev) => [...prev, ...clean]);
    setRemaining(clean);
    return clean;
  }

  useEffect(() => {
    const storedName = localStorage.getItem("nickname");
    if (storedName) setNickname(storedName);
    const storedScores = localStorage.getItem("highScores");
    if (storedScores) setHighScores(JSON.parse(storedScores));
    loadBatch();
  }, []);

  useEffect(() => {
    if (!nickname || loading || gameOver) return;
    if (timeLeft <= 0) {
      handleMistake();
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

  async function startRound() {
    setSelected("");
    setShowAnswer(false);
    let rem = remaining;
    let fullPool = pool;
    if (rem.length === 0) {
      rem = await loadBatch();
      if (!rem.length) {
        endGame();
        return;
      }
      fullPool = [...pool, ...rem];
    }
    setLoading(true);
    setTimeLeft(15);
    const idx = Math.floor(Math.random() * rem.length);
    const pick = rem[idx];
    rem = rem.filter((_, i) => i !== idx);
    setRemaining(rem);
    setCorrect(pick.title);

    const others = shuffle(
      fullPool.filter((m) => m.id !== pick.id).map((m) => m.title)
    ).slice(0, 3);
    setOptions(shuffle([pick.title, ...others]));
    const path = encodeURIComponent(pick.backdrop_path || "");
    const url = `/api/img?path=${path}&w=1280`;
    setImgUrl(url);
    setQuestion((q) => q + 1);
    setTimeout(() => setLoading(false), 150);
  }

  function handleMistake() {
    const nextLives = lives - 1;
    setLives(nextLives);
    if (nextLives <= 0) {
      endGame();
    } else {
      startRound();
    }
  }

  function guess(title: string) {
    if (loading) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(title);
    setShowAnswer(true);
    setLoading(true);
    const isCorrect = title === correct;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    const delay = isCorrect ? 100 : 3000;
    setTimeout(() => {
      if (isCorrect) {
        startRound();
      } else {
        handleMistake();
      }
      setShowAnswer(false);
      setSelected("");
    }, delay);
  }

  function endGame() {
    if (timerRef.current) clearInterval(timerRef.current);
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
    setTimeLeft(15);
    setGameOver(false);
    setLives(3);
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
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            Score: <span className="text-emerald-400">{score}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className="text-red-500">
                {i < lives ? "❤️" : "🤍"}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">Time:</div>
          <div className="w-48 h-3 rounded-full bg-gray-800 overflow-hidden">
            <motion.div
              key={question}
              className="h-full bg-indigo-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(Math.max(timeLeft - 1, 0) / 15) * 100}%` }}
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
          <button
            key={opt}
            onClick={() => guess(opt)}
            disabled={loading}
            className={`btn text-sm md:text-base ${
              showAnswer && opt === correct
                ? "!bg-green-600 hover:!bg-green-500"
                : showAnswer && selected === opt
                ? "!bg-red-600 hover:!bg-red-500"
                : ""
            }`}
          >
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