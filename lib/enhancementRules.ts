import { RARITY_VALUE } from "./cardValue";
import type { Card, CardRarity } from "./db";

export const MAX_ENHANCEMENT_LEVEL = 10;
export const OFF_DEF_BONUS_PER_LEVEL = 2;

export function enhancementCost(rarity: CardRarity, level: number): number {
  return Math.round(RARITY_VALUE[rarity] * 0.5 * (level + 1));
}

export function enhancementSuccessChance(level: number): number {
  return Math.min(95, Math.max(30, 95 - level * 7)) / 100;
}

export function applyEnhancement<T extends Pick<Card, "off_rating" | "def_rating">>(card: T, level: number): T {
  return {
    ...card,
    off_rating: card.off_rating + level * OFF_DEF_BONUS_PER_LEVEL,
    def_rating: card.def_rating + level * OFF_DEF_BONUS_PER_LEVEL,
  };
}
