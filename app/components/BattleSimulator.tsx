"use client";

import { useEffect, useRef, useState } from "react";
import type { CardPosition } from "@/lib/db";

type BotDeckId = "easybot" | "allstarbot" | "legendbot";

type LineupPlayer = { name: string; position: CardPosition; offRating: number; defRating: number };

type ScoringEvent = {
  quarter: number;
  time: string;
  team: "user" | "opponent";
  scorerName: string;
  points: 2 | 3;
  assistName?: string;
};

type PlayerStatLine = { name: string; position: CardPosition; pts: number; reb: number; ast: number };

type BattleResponse = {
  events: ScoringEvent[];
  userScore: number;
  opponentScore: number;
  result: "win" | "loss" | "draw";
  boxScore: { user: PlayerStatLine[]; opponent: PlayerStatLine[] };
  userLineup: LineupPlayer[];
  opponentLineup: LineupPlayer[];
  userBonuses: { id: string; label: string }[];
  botBonuses: { id: string; label: string }[];
  error?: string;
};

type RosterResponse = { slots: { position: CardPosition; card: { name: string; off_rating: number; def_rating: number } }[] };

const BOT_LABELS: Record<BotDeckId, string> = {
  easybot: "이지봇",
  allstarbot: "올스타봇",
  legendbot: "레전드봇",
};

const POSITION_ORDER: CardPosition[] = ["PG", "SG", "SF", "PF", "C"];

const EVENT_DELAY_MS = 350;

function sortByPosition<T extends { position: CardPosition }>(players: T[]): T[] {
  return [...players].sort((a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position));
}

function LineupPanel({ title, players }: { title: string; players: LineupPlayer[] }) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
      <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{title}</h3>
      <ul className="flex flex-col gap-1">
        {sortByPosition(players).map((p) => (
          <li key={p.name} className="flex items-center justify-between text-sm text-black dark:text-zinc-50">
            <span className="flex items-center gap-2">
              <span className="w-7 text-[10px] font-semibold text-zinc-400">{p.position}</span>
              {p.name}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              OFF {p.offRating} / DEF {p.defRating}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BoxScoreTable({ title, lines }: { title: string; lines: PlayerStatLine[] }) {
  const sorted = sortByPosition(lines);
  const totals = sorted.reduce(
    (acc, l) => ({ pts: acc.pts + l.pts, reb: acc.reb + l.reb, ast: acc.ast + l.ast }),
    { pts: 0, reb: 0, ast: 0 }
  );
  return (
    <div className="flex-1 overflow-x-auto rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <table className="w-full min-w-[280px] text-left text-xs">
        <thead>
          <tr className="border-b border-black/[.08] text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
            <th className="px-2 py-1.5" colSpan={2}>
              {title}
            </th>
            <th className="px-2 py-1.5 text-right">PTS</th>
            <th className="px-2 py-1.5 text-right">REB</th>
            <th className="px-2 py-1.5 text-right">AST</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((l) => (
            <tr key={l.name} className="border-b border-black/[.05] last:border-0 dark:border-white/[.08]">
              <td className="px-2 py-1 text-[10px] font-semibold text-zinc-400">{l.position}</td>
              <td className="px-2 py-1 text-black dark:text-zinc-50">{l.name}</td>
              <td className="px-2 py-1 text-right tabular-nums text-black dark:text-zinc-50">{l.pts}</td>
              <td className="px-2 py-1 text-right tabular-nums text-zinc-600 dark:text-zinc-400">{l.reb}</td>
              <td className="px-2 py-1 text-right tabular-nums text-zinc-600 dark:text-zinc-400">{l.ast}</td>
            </tr>
          ))}
          <tr className="font-semibold text-black dark:text-zinc-50">
            <td className="px-2 py-1.5" colSpan={2}>
              합계
            </td>
            <td className="px-2 py-1.5 text-right tabular-nums">{totals.pts}</td>
            <td className="px-2 py-1.5 text-right tabular-nums">{totals.reb}</td>
            <td className="px-2 py-1.5 text-right tabular-nums">{totals.ast}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function BattleSimulator() {
  const [myLineup, setMyLineup] = useState<LineupPlayer[]>([]);
  const [opponentLineup, setOpponentLineup] = useState<LineupPlayer[]>([]);
  const [running, setRunning] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<ScoringEvent[]>([]);
  const [liveUserScore, setLiveUserScore] = useState(0);
  const [liveOpponentScore, setLiveOpponentScore] = useState(0);
  const [finalResult, setFinalResult] = useState<BattleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/game/roster")
      .then((res) => res.json())
      .then((data: RosterResponse) => {
        setMyLineup(
          (data.slots ?? []).map((s) => ({
            name: s.card.name,
            position: s.position,
            offRating: s.card.off_rating,
            defRating: s.card.def_rating,
          }))
        );
      });
  }, []);

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
    setOpponentLineup(data.opponentLineup);

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
      if (event.team === "user") userScore += event.points;
      else opponentScore += event.points;

      setVisibleEvents((prev) => [...prev, event]);
      setLiveUserScore(userScore);
      setLiveOpponentScore(opponentScore);
      index++;
      timeoutRef.current = setTimeout(playNext, EVENT_DELAY_MS);
    }

    playNext();
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <LineupPanel title="내 팀" players={myLineup} />
        <LineupPanel title="상대 팀" players={opponentLineup} />
      </div>

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
                <span className="font-semibold text-zinc-400">{event.time}</span>{" "}
                {event.team === "user" ? "우리 팀" : "상대 팀"} {event.scorerName}
                {event.points === 3 ? " 3점슛 성공!" : " 득점 성공!"}
                {event.assistName && <span className="text-zinc-400"> ({event.assistName} 어시스트)</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {finalResult && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <p className="text-lg font-bold text-black dark:text-zinc-50">
              {finalResult.result === "win" ? "승리!" : finalResult.result === "loss" ? "패배" : "무승부"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              최종 스코어 {finalResult.userScore} : {finalResult.opponentScore}
            </p>
            {finalResult.userBonuses.length > 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                발동 시너지: {finalResult.userBonuses.map((b) => b.label).join(", ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BoxScoreTable title="내 팀" lines={finalResult.boxScore.user} />
            <BoxScoreTable title="상대 팀" lines={finalResult.boxScore.opponent} />
          </div>
        </div>
      )}
    </div>
  );
}
