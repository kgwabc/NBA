"use client";

import { useEffect, useMemo, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import CardEnhancer from "@/app/components/CardEnhancer";
import type { Card } from "@/lib/db";

type CollectionEntry = Card & { owned_count: number; sample_user_card_id: number; enhancement_level: number };

const RARITY_FILTERS: Array<Card["rarity"] | "전체"> = ["전체", "BRONZE", "SILVER", "GOLD", "LEGEND"];

export default function CollectionGrid() {
  const [cards, setCards] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rarity, setRarity] = useState<Card["rarity"] | "전체">("전체");
  const [enhancing, setEnhancing] = useState<CollectionEntry | null>(null);

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

  if (loading) {
    return <p className="text-zinc-500 dark:text-zinc-400">컬렉션을 불러오는 중...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
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

      {filteredCards.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">보유한 카드가 없습니다. 팩을 열어보세요!</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredCards.map((card) => (
            <div key={card.id} className="flex flex-col gap-2">
              <CardComponent card={card} enhancementLevel={card.enhancement_level} onClick={() => setEnhancing(card)} />
            </div>
          ))}
        </div>
      )}

      {enhancing && (
        <CardEnhancer
          card={enhancing}
          onClose={() => setEnhancing(null)}
          onEnhanced={({ newLevel, card: updatedCard }) => {
            setCards((prev) =>
              prev.map((c) => (c.id === updatedCard.id ? { ...c, ...updatedCard, enhancement_level: newLevel } : c))
            );
            setEnhancing((prev) => (prev ? { ...prev, ...updatedCard, enhancement_level: newLevel } : prev));
          }}
        />
      )}
    </div>
  );
}
