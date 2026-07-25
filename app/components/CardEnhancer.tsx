"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/db";
import {
  MAX_ENHANCEMENT_LEVEL,
  OFF_DEF_BONUS_PER_LEVEL,
  enhancementCost,
  enhancementSuccessChance,
} from "@/lib/enhancementRules";

type EnhanceableCard = Card & { sample_user_card_id: number; enhancement_level: number };

type Props = {
  card: EnhanceableCard;
  onClose: () => void;
  onEnhanced: (updated: { newLevel: number; card: Card }) => void;
};

export default function CardEnhancer({ card, onClose, onEnhanced }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; newLevel: number; cost: number } | null>(null);

  function loadBalance() {
    fetch("/api/game/gacha/status")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance ?? null))
      .catch(() => {});
  }

  useEffect(() => {
    loadBalance();
  }, []);

  const level = card.enhancement_level;
  const maxed = level >= MAX_ENHANCEMENT_LEVEL;
  const cost = enhancementCost(card.rarity, level);
  const chance = enhancementSuccessChance(level);
  const canAfford = balance !== null && balance >= cost;

  async function handleEnhance() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/game/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCardId: card.sample_user_card_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "강화에 실패했습니다.");
        return;
      }
      setResult({ success: data.success, newLevel: data.newLevel, cost: data.cost });
      loadBalance();
      onEnhanced({ newLevel: data.newLevel, card: data.card });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black dark:text-zinc-50">{card.name} 강화</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-black dark:hover:text-zinc-50"
          >
            닫기
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            현재 레벨 <span className="font-semibold text-black dark:text-zinc-50">+{level}</span>
          </span>
          <span>
            OFF {card.off_rating} · DEF {card.def_rating}
          </span>
        </div>

        {balance !== null && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            보유 재화: <span className="font-semibold text-black dark:text-zinc-50">{balance}</span>
          </p>
        )}

        {maxed ? (
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">이미 최대 레벨입니다.</p>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">다음 레벨</span>
              <span className="font-semibold text-black dark:text-zinc-50">+{level + 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">예상 스탯</span>
              <span className="font-semibold text-black dark:text-zinc-50">
                OFF {card.off_rating + OFF_DEF_BONUS_PER_LEVEL} · DEF {card.def_rating + OFF_DEF_BONUS_PER_LEVEL}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">비용</span>
              <span className="font-semibold text-black dark:text-zinc-50">{cost} 재화</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">성공 확률</span>
              <span className="font-semibold text-black dark:text-zinc-50">{Math.round(chance * 100)}%</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              실패 시 재화는 소모되고 레벨이 1 하락합니다 (카드는 유지됩니다).
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-black/[.08] dark:border-white/[.145]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/[.08] text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
                <th className="px-2 py-1.5 text-left font-medium">레벨</th>
                <th className="px-2 py-1.5 text-right font-medium">비용</th>
                <th className="px-2 py-1.5 text-right font-medium">성공 확률</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: MAX_ENHANCEMENT_LEVEL }, (_, lvl) => (
                <tr
                  key={lvl}
                  className={`border-b border-black/[.04] last:border-0 dark:border-white/[.08] ${
                    lvl === level ? "bg-amber-500/10 font-semibold" : ""
                  }`}
                >
                  <td className="px-2 py-1 text-left text-zinc-700 dark:text-zinc-300">
                    +{lvl} → +{lvl + 1}
                  </td>
                  <td className="px-2 py-1 text-right text-zinc-700 dark:text-zinc-300">
                    {enhancementCost(card.rarity, lvl)}
                  </td>
                  <td className="px-2 py-1 text-right text-zinc-700 dark:text-zinc-300">
                    {Math.round(enhancementSuccessChance(lvl) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {result && (
          <p
            className={`text-sm font-medium ${
              result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {result.success ? `강화 성공! +${result.newLevel}가 되었습니다.` : `강화 실패... 레벨이 +${result.newLevel}로 하락했습니다.`}
          </p>
        )}

        {!maxed && (
          <button
            type="button"
            disabled={busy || !canAfford}
            onClick={handleEnhance}
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
          >
            {busy ? "강화 중..." : canAfford ? "강화하기" : "재화가 부족합니다"}
          </button>
        )}
      </div>
    </div>
  );
}
