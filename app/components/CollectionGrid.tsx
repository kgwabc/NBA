"use client";

import { useEffect, useMemo, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import type { Card } from "@/lib/db";

type CollectionEntry = Card & { owned_count: number };

const RARITY_FILTERS: Array<Card["rarity"] | "전체"> = ["전체", "BRONZE", "SILVER", "GOLD", "LEGEND"];

export default function CollectionGrid() {
  const [cards, setCards] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rarity, setRarity] = useState<Card["rarity"] | "전체">("전체");
  const [fusingId, setFusingId] = useState<number | null>(null);
  const [fusionMessage, setFusionMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetch("/api/game/collection")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "컬렉션을 불러오지 못했습니다.");
          return;
        }
        setCards(data.cards ?? []);
      })
      .catch(() => setError("컬렉션을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount, same pattern as PlayerRoster.tsx
    load();
  }, []);

  const filteredCards = useMemo(() => {
    if (rarity === "전체") return cards;
    return cards.filter((c) => c.rarity === rarity);
  }, [cards, rarity]);

  async function handleFuse(cardId: number) {
    setFusingId(cardId);
    setFusionMessage(null);
    try {
      const res = await fetch("/api/game/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFusionMessage(data.error ?? "합성에 실패했습니다.");
        return;
      }
      setFusionMessage(`${data.resultCard?.name ?? "새 카드"}(으)로 합성 성공!`);
      load();
    } finally {
      setFusingId(null);
    }
  }

  if (loading) {
    return <p className="text-zinc-500 dark:text-zinc-400">컬렉션을 불러오는 중...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex gap-2">
        {RARITY_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRarity(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              rarity === option
                ? "bg-foreground text-background"
                : "border border-black/[.08] text-zinc-600 hover:border-black/40 dark:border-white/[.145] dark:text-zinc-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {fusionMessage && <p className="text-sm text-orange-600 dark:text-orange-400">{fusionMessage}</p>}

      {filteredCards.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">보유한 카드가 없습니다. 팩을 열어보세요!</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredCards.map((card) => (
            <div key={card.id} className="flex flex-col gap-2">
              <CardComponent card={card} ownedCount={card.owned_count} />
              {card.rarity === "BRONZE" && card.owned_count >= 3 && (
                <button
                  type="button"
                  onClick={() => handleFuse(card.id)}
                  disabled={fusingId === card.id}
                  className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
                >
                  {fusingId === card.id ? "합성 중..." : "3장 합성하기"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
