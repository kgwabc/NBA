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

export type CardComponentProps = {
  card: Pick<Card, "name" | "team_slug" | "position" | "rarity" | "off_rating" | "def_rating" | "salary">;
  ownedCount?: number;
  selected?: boolean;
  onClick?: () => void;
};

export default function CardComponent({ card, ownedCount, selected, onClick }: CardComponentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col gap-2 rounded-lg bg-white p-3 text-left transition-transform dark:bg-zinc-900 ${
        RARITY_CLASS[card.rarity]
      } ${onClick ? "cursor-pointer hover:-translate-y-0.5" : ""} ${
        selected ? "ring-2 ring-offset-2 ring-orange-500 dark:ring-offset-black" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-black dark:text-zinc-50">{card.name}</p>
        <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {card.position}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        {RARITY_LABELS[card.rarity]} · {card.team_slug.toUpperCase()}
      </p>
      <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <span>OFF {card.off_rating}</span>
        <span>DEF {card.def_rating}</span>
        <span>${card.salary}M</span>
      </div>
      {typeof ownedCount === "number" && (
        <span className="self-end text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
          보유 {ownedCount}장
        </span>
      )}
    </button>
  );
}
