"use client";

import { useEffect, useRef, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import type { Card, CardPosition, CardRarity } from "@/lib/db";

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

type RosterResponse = { slots: { position: CardPosition; card: Card; enhancement_level: number }[] };

// The shape CardComponent needs — my roster cards already satisfy this; bot "cards" are
// synthesized below since bots aren't real Card rows.
type DisplayCard = Pick<
  Card,
  "name" | "team_slug" | "position" | "rarity" | "off_rating" | "def_rating" | "salary" | "image_url" | "flavor_text"
> & { enhancementLevel?: number };

const BOT_LABELS: Record<BotDeckId, string> = {
  easybot: "이지봇",
  allstarbot: "올스타봇",
  legendbot: "레전드봇",
};

// Difficulty tiers borrow the existing rarity styling (border/glow) so the three bot
// levels read as visually distinct at a glance, same as real card rarities.
const BOT_RARITY: Record<BotDeckId, CardRarity> = {
  easybot: "BRONZE",
  allstarbot: "GOLD",
  legendbot: "LEGEND",
};

const POSITION_ORDER: CardPosition[] = ["PG", "SG", "SF", "PF", "C"];

const EVENT_DELAY_MS = 550;

function sortByPosition<T extends { position: CardPosition }>(players: T[]): T[] {
  return [...players].sort((a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position));
}

function botLineupToDisplayCards(players: LineupPlayer[], bot: BotDeckId): DisplayCard[] {
  return players.map((p) => ({
    name: p.name,
    team_slug: BOT_LABELS[bot],
    position: p.position,
    rarity: BOT_RARITY[bot],
    off_rating: p.offRating,
    def_rating: p.defRating,
    salary: 0,
    image_url: null,
    flavor_text: null,
  }));
}

type LastScore = { team: "user" | "opponent"; name: string; points: 2 | 3; seq: number };

function LineupGrid({
  title,
  cards,
  team,
  lastScore,
}: {
  title: string;
  cards: DisplayCard[];
  team: "user" | "opponent";
  lastScore: LastScore | null;
}) {
  if (cards.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{title}</h3>
      <div className="grid grid-cols-5 gap-1 sm:gap-3 lg:gap-4">
        {sortByPosition(cards).map((card) => {
          const isScoring = lastScore?.team === team && lastScore.name === card.name;
          // Re-keying on the score's seq (instead of just the card name) forces this
          // wrapper to remount when the same player scores again back-to-back, so the
          // one-shot ring/popup animations replay from the start each time.
          const key = isScoring ? `${card.name}-${lastScore.seq}` : card.name;
          return (
            <div key={key} className={`relative ${isScoring ? "score-ring-pulse" : ""}`}>
              <CardComponent card={card} hideFlavorText enhancementLevel={card.enhancementLevel} hideNameOnMobile />
              {isScoring && (
                <span className="score-popup pointer-events-none absolute left-1/2 top-1/3 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-500 px-3 py-1 text-sm font-black text-white shadow-lg">
                  +{lastScore.points} 득점!
                </span>
              )}
            </div>
          );
        })}
      </div>
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
  const [myCards, setMyCards] = useState<DisplayCard[]>([]);
  const [opponentCards, setOpponentCards] = useState<DisplayCard[]>([]);
  const [running, setRunning] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<ScoringEvent[]>([]);
  const [liveUserScore, setLiveUserScore] = useState(0);
  const [liveOpponentScore, setLiveOpponentScore] = useState(0);
  const [currentClock, setCurrentClock] = useState("1쿼터 12:00");
  const [lastScore, setLastScore] = useState<LastScore | null>(null);
  const [finalResult, setFinalResult] = useState<BattleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreSeqRef = useRef(0);

  useEffect(() => {
    fetch("/api/game/roster")
      .then((res) => res.json())
      .then((data: RosterResponse) => {
        setMyCards((data.slots ?? []).map((s) => ({ ...s.card, enhancementLevel: s.enhancement_level })));
      });
  }, []);

  async function handleStart(opponentBot: BotDeckId) {
    setError(null);
    setFinalResult(null);
    setVisibleEvents([]);
    setLiveUserScore(0);
    setLiveOpponentScore(0);
    setCurrentClock("1쿼터 12:00");
    setLastScore(null);
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
    setOpponentCards(botLineupToDisplayCards(data.opponentLineup, opponentBot));

    let index = 0;
    let userScore = 0;
    let opponentScore = 0;

    function playNext() {
      if (index >= data.events.length) {
        setFinalResult(data);
        setLastScore(null);
        setCurrentClock("4쿼터 0:00");
        setRunning(false);
        return;
      }
      const event = data.events[index];
      if (event.team === "user") userScore += event.points;
      else opponentScore += event.points;

      setVisibleEvents((prev) => [...prev, event]);
      setLiveUserScore(userScore);
      setLiveOpponentScore(opponentScore);
      setCurrentClock(event.time);
      scoreSeqRef.current += 1;
      setLastScore({ team: event.team, name: event.scorerName, points: event.points, seq: scoreSeqRef.current });
      index++;
      timeoutRef.current = setTimeout(playNext, EVENT_DELAY_MS);
    }

    playNext();
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-3 sm:gap-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {(Object.keys(BOT_LABELS) as BotDeckId[]).map((bot) => (
          <button
            key={bot}
            type="button"
            disabled={running}
            onClick={() => handleStart(bot)}
            className="rounded-lg border border-black/[.08] bg-white p-3 text-sm font-medium text-black transition-colors hover:border-black/40 disabled:opacity-40 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50 sm:p-4"
          >
            {BOT_LABELS[bot]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {(running || visibleEvents.length > 0) && (
        <div className="flex items-center justify-center gap-4 text-4xl font-black text-black sm:gap-8 sm:text-5xl dark:text-zinc-50">
          <span>{liveUserScore}</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-base font-normal text-zinc-400 sm:text-lg">VS</span>
            <span className="whitespace-nowrap text-xs font-semibold text-zinc-500 dark:text-zinc-400">{currentClock}</span>
          </div>
          <span>{liveOpponentScore}</span>
        </div>
      )}

      <LineupGrid title="내 팀" cards={myCards} team="user" lastScore={lastScore} />
      <LineupGrid title="상대 팀" cards={opponentCards} team="opponent" lastScore={lastScore} />

      {(running || visibleEvents.length > 0) && (
        <div className="flex flex-col gap-3">
          <div className="flex max-h-40 flex-col-reverse gap-1 overflow-y-auto rounded-lg border border-black/[.08] p-3 dark:border-white/[.145] sm:max-h-64">
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
