"use client";

// Final scoreboard. Persists the match once (POST /api/game/arcade/match) and offers
// play-again / change-roster. Result mapping: vs_ai is from the user's (home) perspective;
// local_2p records which player won (home = P1, away = P2).

import { useEffect, useRef } from "react";
import type { ArcadeMatchResult } from "@/lib/db";
import type { MatchConfig } from "@/lib/arcade/types";
import type { MatchResult } from "./ArcadeApp";

function deriveResult(config: MatchConfig, result: MatchResult): ArcadeMatchResult {
  if (result.draw) return "draw";
  if (config.mode === "local_2p") return result.homeWon ? "p1_win" : "p2_win";
  return result.homeWon ? "win" : "loss";
}

function headline(config: MatchConfig, result: MatchResult): string {
  if (result.draw) return "무승부!";
  if (config.mode === "local_2p") return result.homeWon ? "1P 승리! 🏆" : "2P 승리! 🏆";
  return result.homeWon ? "승리! 🏆" : "패배…";
}

export default function PostGameSummary({
  config,
  result,
  onPlayAgain,
  onBackToPick,
}: {
  config: MatchConfig;
  result: MatchResult;
  onPlayAgain: () => void;
  onBackToPick: () => void;
}) {
  const posted = useRef(false);

  useEffect(() => {
    if (posted.current) return;
    posted.current = true;
    const body = {
      mode: config.mode,
      homeCardIds: config.homeCards.map((c) => c.id),
      awayCardIds: config.awayCards.map((c) => c.id),
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      result: deriveResult(config, result),
    };
    fetch("/api/game/arcade/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {
      /* score persistence is best-effort; ignore network errors */
    });
  }, [config, result]);

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-black/15 p-8 text-center dark:border-white/15">
      <h3 className="text-2xl font-black text-black dark:text-zinc-50">{headline(config, result)}</h3>

      <div className="flex items-center gap-4 text-4xl font-bold tabular-nums">
        <span className="text-blue-500">{result.homeScore}</span>
        <span className="text-zinc-400">:</span>
        <span className="text-red-500">{result.awayScore}</span>
      </div>

      <div className="flex w-full max-w-md justify-between text-xs text-zinc-500">
        <div className="text-left">
          <p className="mb-1 font-semibold text-blue-500">내 팀</p>
          {config.homeCards.map((c) => (
            <p key={c.id}>{c.name}</p>
          ))}
        </div>
        <div className="text-right">
          <p className="mb-1 font-semibold text-red-500">{config.mode === "local_2p" ? "2P 팀" : "상대 팀"}</p>
          {config.awayCards.map((c, i) => (
            <p key={`${c.id}-${i}`}>{c.name}</p>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPlayAgain}
          className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
        >
          다시하기 🔁
        </button>
        <button
          onClick={onBackToPick}
          className="rounded-full border border-black/15 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-black/40 dark:border-white/20 dark:text-zinc-300"
        >
          선수 교체
        </button>
      </div>
    </div>
  );
}
