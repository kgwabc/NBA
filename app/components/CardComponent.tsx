"use client";

import { useState } from "react";
import type { Card } from "@/lib/db";

const RARITY_LABELS: Record<Card["rarity"], string> = {
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  LEGEND: "레전드",
};

const RARITY_CLASS: Record<Card["rarity"], string> = {
  BRONZE: "card-rarity-bronze",
  SILVER: "card-rarity-silver",
  GOLD: "card-rarity-gold",
  LEGEND: "card-rarity-legend",
};

const PLACEHOLDER_GRADIENT: Record<Card["rarity"], string> = {
  BRONZE: "from-amber-700 to-amber-950",
  SILVER: "from-zinc-400 to-zinc-600",
  GOLD: "from-yellow-500 to-amber-700",
  LEGEND: "from-orange-500 via-red-500 to-fuchsia-700",
};

// 기본 크롭(상단 중앙)으로는 사진 속 선수가 프레임 밖으로 잘려나가는 카드에 한해
// 이름으로 개별 크롭 위치를 지정한다. 없는 카드는 기존 기본값(top center)을 그대로 쓴다.
const IMAGE_POSITION_OVERRIDES: Record<string, string> = {
  // 원본 사진(3941x2382, 가로로 매우 넓음)에서 커리가 중앙이 아닌 좌측 35~40% 지점에 있어
  // 기본 중앙 크롭으로는 잘려나갔다 — 실제 위치에 맞춰 가로 크롭 기준점만 조정.
  "스테판 커리": "37% center",
};

export type CardComponentProps = {
  card: Pick<
    Card,
    "name" | "team_slug" | "position" | "rarity" | "off_rating" | "def_rating" | "salary" | "image_url"
  >;
  ownedCount?: number;
  selected?: boolean;
  onClick?: () => void;
};

export default function CardComponent({ card, ownedCount, selected, onClick }: CardComponentProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = !!card.image_url && !imageFailed;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-300 dark:bg-zinc-900 ${
        RARITY_CLASS[card.rarity]
      } ${onClick ? "cursor-pointer hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-2xl hover:brightness-110" : ""} ${
        selected ? "ring-4 ring-orange-500 ring-offset-2 dark:ring-offset-black" : ""
      }`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Wikimedia photo, not a local/optimizable asset
          <img
            src={card.image_url!}
            alt={card.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            style={{ objectPosition: IMAGE_POSITION_OVERRIDES[card.name] ?? "top" }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${PLACEHOLDER_GRADIENT[card.rarity]}`}
          >
            <span className="text-6xl font-black text-white/90 drop-shadow-lg">{card.name.charAt(0)}</span>
          </div>
        )}

        {(card.rarity === "GOLD" || card.rarity === "LEGEND") && (
          <div className="card-shine pointer-events-none absolute inset-0" />
        )}

        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {card.position}
        </span>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-8">
          <p className="text-base font-bold text-white drop-shadow-md">{card.name}</p>
          <p className="text-xs font-medium text-white/80">
            {RARITY_LABELS[card.rarity]} · {card.team_slug.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-zinc-600 dark:text-zinc-400">
        <span>OFF {card.off_rating}</span>
        <span>DEF {card.def_rating}</span>
        <span>${card.salary}M</span>
      </div>

      {typeof ownedCount === "number" && (
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          × {ownedCount}
        </span>
      )}
    </button>
  );
}
