"use client";

import { useRef, useState } from "react";

type BotDeckId = "easybot" | "allstarbot" | "legendbot";

type BattleEvent = {
  quarter: number;
  time: string;
  text: string;
  successChance: number;
  success: boolean;
  pointsScored: number;
  isUserPossession: boolean;
};

type BattleResponse = {
  events: BattleEvent[];
  userScore: number;
  opponentScore: number;
  result: "win" | "loss" | "draw";
  reward: number;
  userBonuses: { id: string; label: string }[];
  botBonuses: { id: string; label: string }[];
  error?: string;
};

const BOT_LABELS: Record<BotDeckId, string> = {
  easybot: "이지봇",
  allstarbot: "올스타봇",
  legendbot: "레전드봇",
};

const EVENT_DELAY_MS = 400;

export default function BattleSimulator() {
  const [running, setRunning] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<BattleEvent[]>([]);
  const [liveUserScore, setLiveUserScore] = useState(0);
  const [liveOpponentScore, setLiveOpponentScore] = useState(0);
  const [finalResult, setFinalResult] = useState<BattleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleStart(opponentBot: BotDeckId) {
    setError(null);
    setFinalResult(null);
    setVisibleEvents([]);
    setLiveUserScore(0);
    setLiveOpponentScore(0);
    setRunning(true);

    const res = await fetch("/api/game/battle/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponentBot }),
    });
    const data: BattleResponse = await res.json();
    if (!res.ok) {
      setError(data.error ?? "배틀을 시작하지 못했습니다.");
      setRunning(false);
      return;
    }

    let index = 0;
    let userScore = 0;
    let opponentScore = 0;

    function playNext() {
      if (index >= data.events.length) {
        setFinalResult(data);
        setRunning(false);
        return;
      }
      const event = data.events[index];
      if (event.success) {
        if (event.isUserPossession) userScore += event.pointsScored;
        else opponentScore += event.pointsScored;
      }
      setVisibleEvents((prev) => [...prev, event]);
      setLiveUserScore(userScore);
      setLiveOpponentScore(opponentScore);
      index++;
      timeoutRef.current = setTimeout(playNext, EVENT_DELAY_MS);
    }

    playNext();
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(BOT_LABELS) as BotDeckId[]).map((bot) => (
          <button
            key={bot}
            type="button"
            disabled={running}
            onClick={() => handleStart(bot)}
            className="rounded-lg border border-black/[.08] bg-white p-4 text-sm font-medium text-black transition-colors hover:border-black/40 disabled:opacity-40 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
          >
            {BOT_LABELS[bot]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {(running || visibleEvents.length > 0) && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-6 text-2xl font-bold text-black dark:text-zinc-50">
            <span>{liveUserScore}</span>
            <span className="text-sm font-normal text-zinc-400">VS</span>
            <span>{liveOpponentScore}</span>
          </div>

          <div className="flex max-h-64 flex-col-reverse gap-1 overflow-y-auto rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
            {[...visibleEvents].reverse().map((event, idx) => (
              <p key={idx} className="battle-event-line text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-400">{event.time}</span> {event.text} (
                {event.successChance}%)
              </p>
            ))}
          </div>
        </div>
      )}

      {finalResult && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
          <p className="text-lg font-bold text-black dark:text-zinc-50">
            {finalResult.result === "win" ? "승리!" : finalResult.result === "loss" ? "패배" : "무승부"}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            최종 스코어 {finalResult.userScore} : {finalResult.opponentScore}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400">획득 재화: {finalResult.reward}</p>
          {finalResult.userBonuses.length > 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              발동 시너지: {finalResult.userBonuses.map((b) => b.label).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
