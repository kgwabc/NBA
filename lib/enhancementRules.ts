import { RARITY_VALUE } from "./cardValue";
import type { Card, CardRarity } from "./db";

export const MAX_ENHANCEMENT_LEVEL = 10;
export const OFF_DEF_BONUS_PER_LEVEL = 2;

export function enhancementCost(rarity: CardRarity, level: number): number {
  return Math.round(RARITY_VALUE[rarity] * 0.5 * (level + 1));
}

export function enhancementSuccessChance(level: number): number {
  return Math.min(100, Math.max(10, 100 - level * 10)) / 100;
}

export type FailureOutcomeShares = { stay: number; downgrade: number; destroy: number };

// Failure isn't always a downgrade — higher levels risk outright destroying the card,
// at the cost of a shrinking "nothing happens" chance. Ratios chosen so level 0 matches
// the originally agreed 50/40/10 stay/downgrade/destroy split.
export function enhancementFailureOutcomeShares(level: number): FailureOutcomeShares {
  const destroy = Math.min(0.5, Math.max(0.1, 0.1 + level * 0.04));
  const remaining = 1 - destroy;
  return {
    stay: remaining * (5 / 9),
    downgrade: remaining * (4 / 9),
    destroy,
  };
}

export type EnhancementOutcomeProbabilities = { success: number; stay: number; downgrade: number; destroy: number };

// Same shares as enhancementFailureOutcomeShares, but expressed as absolute probabilities
// over the whole attempt (all four sum to 1) — what the enhancement panel actually shows.
export function enhancementOutcomeProbabilities(level: number): EnhancementOutcomeProbabilities {
  const success = enhancementSuccessChance(level);
  const failChance = 1 - success;
  const shares = enhancementFailureOutcomeShares(level);
  return {
    success,
    stay: failChance * shares.stay,
    downgrade: failChance * shares.downgrade,
    destroy: failChance * shares.destroy,
  };
}

export function applyEnhancement<T extends Pick<Card, "off_rating" | "def_rating">>(card: T, level: number): T {
  return {
    ...card,
    off_rating: card.off_rating + level * OFF_DEF_BONUS_PER_LEVEL,
    def_rating: card.def_rating + level * OFF_DEF_BONUS_PER_LEVEL,
  };
}
