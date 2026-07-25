"use client";

// Client orchestrator for the arcade experience: roster pick -> play -> post-game.
// Owns the MatchConfig and final result so PostGameSummary can persist card ids/scores.

import { useState } from "react";
import type { MatchConfig } from "@/lib/arcade/types";
import ArcadeGame from "./ArcadeGame";
import RosterPicker from "./RosterPicker";
import PostGameSummary from "./PostGameSummary";

export type MatchResult = {
  homeScore: number;
  awayScore: number;
  homeWon: boolean;
  draw: boolean;
};

type Screen = "pick" | "play" | "over";

export default function ArcadeApp() {
  const [screen, setScreen] = useState<Screen>("pick");
  const [config, setConfig] = useState<MatchConfig | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  function handleStart(cfg: MatchConfig) {
    setConfig(cfg);
    setResult(null);
    setScreen("play");
  }

  function handleGameOver(res: MatchResult) {
    setResult(res);
    setScreen("over");
  }

  function handlePlayAgain() {
    if (config) setScreen("play");
  }

  function handleBackToPick() {
    setScreen("pick");
  }

  return (
    <div className="w-full max-w-4xl">
      {screen === "pick" && <RosterPicker onStart={handleStart} />}
      {screen === "play" && config && <ArcadeGame config={config} onGameOver={handleGameOver} />}
      {screen === "over" && config && result && (
        <PostGameSummary
          config={config}
          result={result}
          onPlayAgain={handlePlayAgain}
          onBackToPick={handleBackToPick}
        />
      )}
    </div>
  );
}
