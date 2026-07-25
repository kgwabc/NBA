"use client";

// Roster + mode selection before a match. Fetches the logged-in user's owned cards
// (same /api/game/collection endpoint the collection view uses), lets the player pick
// exactly 2 cards for their team, and picks/derives the opponent's 2 cards.

import { useEffect, useMemo, useState } from "react";
import type { CardRarity } from "@/lib/db";
import type { MatchConfig, MatchMode, RosterCard } from "@/lib/arcade/types";

const QUARTER_SECONDS = 60;
const TOTAL_QUARTERS = 2;

type CollectionEntry = RosterCard & { owned_count: number };

const RARITY_COLOR: Record<CardRarity, string> = {
  BRONZE: "border-amber-700",
  SILVER: "border-zinc-400",
  GOLD: "border-yellow-400",
  LEGEND: "border-fuchsia-500",
};

function pickAwayTeam(pool: CollectionEntry[], chosen: RosterCard[]): RosterCard[] {
  // Prefer cards the player didn't pick, so the opponent feels distinct; fall back to
  // the full pool (with repeats) when the collection is tiny.
  const chosenIds = new Set(chosen.map((c) => c.id));
  const rest = pool.filter((c) => !chosenIds.has(c.id));
  const source = rest.length >= 2 ? rest : pool;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const away = shuffled.slice(0, 2);
  while (away.length < 2 && pool.length > 0) away.push(pool[away.length % pool.length]);
  return away;
}

export default function RosterPicker({ onStart }: { onStart: (config: MatchConfig) => void }) {
  const [cards, setCards] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<MatchMode>("vs_ai");
  const [homeIds, setHomeIds] = useState<number[]>([]);
  const [awayIds, setAwayIds] = useState<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount, same pattern as CollectionGrid.tsx
    setLoading(true);
    fetch("/api/game/collection")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "컬렉션을 불러오지 못했습니다.");
          return;
        }
        setCards((data.cards ?? []) as CollectionEntry[]);
      })
      .catch(() => setError("컬렉션을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  function toggle(teamIds: number[], setTeamIds: (v: number[]) => void, id: number) {
    if (teamIds.includes(id)) {
      setTeamIds(teamIds.filter((x) => x !== id));
    } else if (teamIds.length < 2) {
      setTeamIds([...teamIds, id]);
    }
  }

  function start() {
    const homeCards = homeIds.map((id) => byId.get(id)!).filter(Boolean);
    if (homeCards.length !== 2) {
      setError("내 팀 선수 2명을 선택하세요.");
      return;
    }
    let awayCards: RosterCard[];
    if (mode === "local_2p") {
      awayCards = awayIds.map((id) => byId.get(id)!).filter(Boolean);
      if (awayCards.length !== 2) {
        setError("2P 팀 선수 2명을 선택하세요.");
        return;
      }
    } else {
      awayCards = pickAwayTeam(cards, homeCards);
    }
    if (awayCards.length !== 2) {
      setError("상대 팀을 구성할 카드가 부족합니다. 팩을 더 열어보세요.");
      return;
    }
    onStart({ mode, homeCards, awayCards, quarterSeconds: QUARTER_SECONDS, totalQuarters: TOTAL_QUARTERS });
  }

  if (loading) return <p className="text-zinc-500">컬렉션 불러오는 중…</p>;

  if (cards.length < 2) {
    return (
      <div className="rounded-xl border border-black/10 p-6 text-center dark:border-white/15">
        <p className="mb-2 text-zinc-700 dark:text-zinc-300">아케이드를 플레이하려면 선수 카드가 최소 2장 필요해요.</p>
        <a href="/game" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          팩 열러 가기 →
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["vs_ai", "local_2p"] as MatchMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-black/15 text-zinc-600 dark:border-white/20 dark:text-zinc-300"
            }`}
          >
            {m === "vs_ai" ? "1인 (vs AI)" : "로컬 2인"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Home roster */}
      <RosterColumn
        title={`내 팀 (${homeIds.length}/2)`}
        cards={cards}
        selected={homeIds}
        otherSelected={mode === "local_2p" ? awayIds : []}
        onToggle={(id) => toggle(homeIds, setHomeIds, id)}
      />

      {/* Away roster (only manual in local 2P) */}
      {mode === "local_2p" ? (
        <RosterColumn
          title={`2P 팀 (${awayIds.length}/2)`}
          cards={cards}
          selected={awayIds}
          otherSelected={homeIds}
          onToggle={(id) => toggle(awayIds, setAwayIds, id)}
        />
      ) : (
        <p className="text-sm text-zinc-500">상대 팀은 컬렉션에서 자동으로 구성됩니다.</p>
      )}

      <button
        onClick={start}
        className="self-start rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
      >
        경기 시작 🏀
      </button>
    </div>
  );
}

function RosterColumn({
  title,
  cards,
  selected,
  otherSelected,
  onToggle,
}: {
  title: string;
  cards: CollectionEntry[];
  selected: number[];
  otherSelected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((c) => {
          const isSelected = selected.includes(c.id);
          const isTakenByOther = otherSelected.includes(c.id);
          return (
            <button
              key={c.id}
              disabled={isTakenByOther}
              onClick={() => onToggle(c.id)}
              className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all ${
                isSelected ? "ring-2 ring-orange-500 " + RARITY_COLOR[c.rarity] : RARITY_COLOR[c.rarity]
              } ${isTakenByOther ? "opacity-30" : "hover:scale-[1.02]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm dark:bg-zinc-700">
                  {c.name.slice(0, 1)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-black dark:text-zinc-100">{c.name}</span>
                <span className="block text-[10px] text-zinc-500">
                  {c.position} · 공{c.off_rating} 수{c.def_rating}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
