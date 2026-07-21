"use client";

import { useEffect, useState } from "react";
import CardComponent from "@/app/components/CardComponent";
import type { Card, CardRarity } from "@/lib/db";

type PackType = "free" | "basic" | "premium" | "legend";

type GachaStatus = {
  balance: number;
  nextFreePackAt: number | null;
  packTypes: Record<PackType, { cost: number }>;
};

const PACK_LABELS: Record<PackType, string> = {
  free: "무료 팩",
  basic: "베이직 팩",
  premium: "프리미엄 팩",
  legend: "레전드 팩",
};

const SHAKE_CLASS: Partial<Record<CardRarity, string>> = {
  GOLD: "card-shake-gold",
  LEGEND: "card-shake-legend",
};

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}시간 ${minutes}분 ${seconds}초`;
}

export default function PackOpener() {
  const [status, setStatus] = useState<GachaStatus | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [opening, setOpening] = useState<PackType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pulledCard, setPulledCard] = useState<{ card: Card; rarity: CardRarity } | null>(null);
  const [flipped, setFlipped] = useState(false);

  function loadStatus() {
    fetch("/api/game/gacha/status")
      .then((res) => res.json())
      .then((data) => setStatus(data));
  }

  useEffect(() => {
    loadStatus();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleOpen(packType: PackType) {
    setOpening(packType);
    setError(null);
    setPulledCard(null);
    setFlipped(false);
    try {
      const res = await fetch("/api/game/gacha/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "팩을 열지 못했습니다.");
        return;
      }
      setPulledCard({ card: data.card, rarity: data.rarity });
      requestAnimationFrame(() => setFlipped(true));
      if (data.rarity === "LEGEND") {
        new Audio("/sounds/legend.mp3").play().catch(() => {});
      }
      loadStatus();
    } finally {
      setOpening(null);
    }
  }

  const freeCooldownRemaining = status?.nextFreePackAt ? status.nextFreePackAt - now : 0;
  const freeAvailable = !status?.nextFreePackAt || freeCooldownRemaining <= 0;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      {status && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          보유 재화: <span className="font-semibold text-black dark:text-zinc-50">{status.balance}</span>
        </p>
      )}

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(PACK_LABELS) as PackType[]).map((packType) => {
          const cost = status?.packTypes[packType]?.cost ?? 0;
          const disabled =
            opening !== null || (packType === "free" && !freeAvailable) || (status ? status.balance < cost : false);
          return (
            <button
              key={packType}
              type="button"
              disabled={disabled}
              onClick={() => handleOpen(packType)}
              className="flex flex-col items-center gap-1 rounded-lg border border-black/[.08] bg-white p-4 text-sm font-medium text-black transition-colors hover:border-black/40 disabled:opacity-40 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
            >
              <span>{PACK_LABELS[packType]}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {packType === "free"
                  ? freeAvailable
                    ? "지금 열기 가능"
                    : formatCountdown(freeCooldownRemaining)
                  : `${cost} 재화`}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {pulledCard && (
        <div className="card-flip-container h-56 w-40">
          <div className={`card-flip-inner ${flipped ? "is-flipped" : ""}`}>
            <div className="card-face flex items-center justify-center rounded-lg bg-zinc-800 text-3xl">🎴</div>
            <div className={`card-face card-face-back ${flipped ? SHAKE_CLASS[pulledCard.rarity] ?? "" : ""}`}>
              <CardComponent card={pulledCard.card} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
