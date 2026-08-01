"use client";

import { useEffect, useMemo, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import type { Card, CardPosition } from "@/lib/db";
import { REQUIRED_POSITIONS, ROSTER_SALARY_CAP, validateRoster } from "@/lib/rosterValidation";

type CollectionEntry = Card & { owned_count: number; sample_user_card_id: number; enhancement_level: number };

type SlotState = { position: CardPosition; card: CollectionEntry } | null;

export default function RosterBuilder() {
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [slots, setSlots] = useState<Record<CardPosition, SlotState>>({
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null,
  });
  const [pickerPosition, setPickerPosition] = useState<CardPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount, same pattern as CollectionGrid.tsx
    setLoading(true);
    Promise.all([
      fetch("/api/game/collection").then((res) => res.json()),
      fetch("/api/game/roster").then((res) => res.json()),
    ]).then(([collectionData, rosterData]) => {
      const cards: CollectionEntry[] = collectionData.cards ?? [];
      setCollection(cards);

      const byId = new Map(cards.map((c) => [c.id, c]));
      const nextSlots: Record<CardPosition, SlotState> = { PG: null, SG: null, SF: null, PF: null, C: null };
      for (const slot of rosterData.slots ?? []) {
        const card = byId.get(slot.card.id);
        if (card) nextSlots[slot.position as CardPosition] = { position: slot.position, card };
      }
      setSlots(nextSlots);
      setLoading(false);
    });
  }, []);

  const validation = useMemo(() => {
    const filled = REQUIRED_POSITIONS.map((pos) => slots[pos]).filter(Boolean) as {
      position: CardPosition;
      card: CollectionEntry;
    }[];
    return validateRoster(filled.map((s) => ({ position: s.position, card: s.card })));
  }, [slots]);

  function selectCard(position: CardPosition, card: CollectionEntry) {
    setSlots((prev) => ({ ...prev, [position]: { position, card } }));
    setPickerPosition(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const slotsPayload = REQUIRED_POSITIONS.filter((pos) => slots[pos]).map((pos) => ({
        position: pos,
        userCardId: slots[pos]!.card.sample_user_card_id,
      }));
      const res = await fetch("/api/game/roster", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: slotsPayload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "로스터 저장에 실패했습니다.");
        return;
      }
      setMessage("로스터가 저장되었습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-zinc-500">로스터 불러오는 중…</p>;

  const gaugePercent = Math.min(100, (validation.totalSalary / ROSTER_SALARY_CAP) * 100);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-3 sm:gap-6">
      <section className="flex flex-col gap-3 sm:gap-4">
        <div className="grid grid-cols-5 gap-1 sm:gap-3 lg:gap-4">
          {REQUIRED_POSITIONS.map((pos) => {
            const slot = slots[pos];
            return (
              <div key={pos} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{pos}</span>
                {slot ? (
                  <CardComponent
                    card={slot.card}
                    onClick={() => setPickerPosition(pos)}
                    selected
                    enhancementLevel={slot.card.enhancement_level}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerPosition(pos)}
                    className="flex aspect-[3/4] items-center justify-center rounded-2xl border-2 border-dashed border-black/[.15] text-xs text-zinc-400 hover:border-black/40 dark:border-white/[.2]"
                  >
                    카드 선택
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <div className="gauge-bar-track">
            <div
              className={`gauge-bar-fill ${validation.totalSalary > ROSTER_SALARY_CAP ? "over-cap" : "under-cap"}`}
              style={{ width: `${gaugePercent}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ${validation.totalSalary}M / ${ROSTER_SALARY_CAP}M
          </span>
        </div>

        {!validation.valid && (
          <ul className="list-inside list-disc text-xs text-red-600 dark:text-red-400">
            {validation.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!validation.valid || saving}
          className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-40 dark:hover:bg-[#ccc]"
        >
          {saving ? "저장 중..." : "로스터 저장"}
        </button>

        {message && <p className="text-sm text-orange-600 dark:text-orange-400">{message}</p>}
      </section>

      {pickerPosition && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 sm:items-center">
          <div className="flex max-h-[85dvh] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-t-lg bg-white p-4 dark:bg-zinc-900 sm:rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-black dark:text-zinc-50">{pickerPosition} 카드 선택</h3>
              <button
                type="button"
                onClick={() => setPickerPosition(null)}
                className="text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                닫기
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
              {collection
                .filter((c) => c.position === pickerPosition)
                .map((card) => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    onClick={() => selectCard(pickerPosition, card)}
                    enhancementLevel={card.enhancement_level}
                  />
                ))}
            </div>
            {collection.filter((c) => c.position === pickerPosition).length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                해당 포지션의 카드를 보유하고 있지 않습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
