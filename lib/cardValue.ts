import type { CardRarity } from "./db";

// Rough per-rarity worth, estimated off the basic/premium/legend pack costs and each
// rarity's typical drop frequency. Used only to price out a duplicate pull.
export const RARITY_VALUE: Record<CardRarity, number> = {
  BRONZE: 20,
  SILVER: 60,
  GOLD: 200,
  LEGEND: 600,
};

export function duplicateRefund(rarity: CardRarity): number {
  return Math.round(RARITY_VALUE[rarity] / 2);
}
