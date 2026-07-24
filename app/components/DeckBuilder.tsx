"use client";

import { useEffect, useMemo, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import type { Card, CardPosition } from "@/lib/db";
import { REQUIRED_POSITIONS, SALARY_CAP, validateDeck } from "@/lib/deckValidation";

type CollectionEntry = Card & { owned_count: number; sample_user_card_id: number };

type SlotState = { position: CardPosition; card: CollectionEntry } | null;

type DeckSummary = {
  id: number;
  name: string;
  is_active: number;
  slots: { position: CardPosition; card: Card }[];
};

export default function DeckBuilder() {
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [slots, setSlots] = useState<Record<CardPosition, SlotState>>({
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null,
  });
  const [pickerPosition, setPickerPosition] = useState<CardPosition | null>(null);
  const [deckName, setDeckName] = useState("내 덱");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function loadCollection() {
    fetch("/api/game/collection")
      .then((res) => res.json())
      .then((data) => setCollection(data.cards ?? []));
  }

  function loadDecks() {
    fetch("/api/game/decks")
      .then((res) => res.json())
      .then((data) => setDecks(data.decks ?? []));
  }

  useEffect(() => {
    loadCollection();
    loadDecks();
  }, []);

  const validation = useMemo(() => {
    const filled = REQUIRED_POSITIONS.map((pos) => slots[pos]).filter(Boolean) as {
      position: CardPosition;
      card: CollectionEntry;
    }[];
    return validateDeck(filled.map((s) => ({ position: s.position, card: s.card })));
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
      const res = await fetch("/api/game/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deckName, slots: slotsPayload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "덱 저장에 실패했습니다.");
        return;
      }
      setMessage("덱이 저장되었습니다.");
      loadDecks();
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(deckId: number) {
    await fetch(`/api/game/decks/${deckId}/activate`, { method: "POST" });
    loadDecks();
  }

  async function handleDelete(deckId: number) {
    if (!confirm("이 덱을 삭제할까요?")) return;
    await fetch(`/api/game/decks/${deckId}`, { method: "DELETE" });
    loadDecks();
  }

  const gaugePercent = Math.min(100, (validation.totalSalary / SALARY_CAP) * 100);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="h-10 w-full max-w-xs rounded-full border border-black/[.08] bg-white px-4 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {REQUIRED_POSITIONS.map((pos) => {
            const slot = slots[pos];
            return (
              <div key={pos} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{pos}</span>
                {slot ? (
                  <CardComponent card={slot.card} onClick={() => setPickerPosition(pos)} selected />
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
              className={`gauge-bar-fill ${validation.totalSalary > SALARY_CAP ? "over-cap" : "under-cap"}`}
              style={{ width: `${gaugePercent}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ${validation.totalSalary}M / ${SALARY_CAP}M
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
          {saving ? "저장 중..." : "덱 저장"}
        </button>

        {message && <p className="text-sm text-orange-600 dark:text-orange-400">{message}</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-black dark:text-zinc-50">저장된 덱</h3>
        {decks.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 저장된 덱이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]"
              >
                <div>
                  <p className="text-sm font-medium text-black dark:text-zinc-50">
                    {deck.name} {deck.is_active === 1 && <span className="text-orange-600">(활성)</span>}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {deck.slots.map((s) => s.card.name).join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {deck.is_active !== 1 && (
                    <button
                      type="button"
                      onClick={() => handleActivate(deck.id)}
                      className="rounded-full border border-black/[.08] px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-black/40 dark:border-white/[.145] dark:text-zinc-400"
                    >
                      활성화
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(deck.id)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-400 dark:border-red-900 dark:text-red-400"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {pickerPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex max-h-[80vh] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-lg bg-white p-4 dark:bg-zinc-900">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {collection
                .filter((c) => c.position === pickerPosition)
                .map((card) => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    ownedCount={card.owned_count}
                    onClick={() => selectCard(pickerPosition, card)}
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
