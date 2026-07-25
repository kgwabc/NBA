// Maps a collected Card into arcade gameplay attributes.
// Pure function — reusable for a future "player stat sheet" UI and unit-testable.

import type { CardPosition, CardRarity } from "@/lib/db";
import type { ArcadePlayerAttributes, RosterCard } from "./types";

// Ratings in the seed data span ~57..99 (off) and ~60..95 (def). Normalize against a
// generous 40..99 band so even a weak card lands above 0 and stars approach 1.
const RATING_MIN = 40;
const RATING_MAX = 99;

function norm(rating: number): number {
  const t = (rating - RATING_MIN) / (RATING_MAX - RATING_MIN);
  return Math.max(0, Math.min(1, t));
}

// Per-position base curve: a small archetype bias applied on top of card ratings.
// speed/size trade off along the PG..C axis; bigs dunk & block better, guards shoot & steal.
const POSITION_CURVE: Record<
  CardPosition,
  { speed: number; size: number; dunk: number; three: number; steal: number; block: number }
> = {
  PG: { speed: 1.15, size: 0.82, dunk: 0.85, three: 1.15, steal: 1.15, block: 0.75 },
  SG: { speed: 1.08, size: 0.9, dunk: 0.95, three: 1.12, steal: 1.05, block: 0.85 },
  SF: { speed: 1.0, size: 1.0, dunk: 1.05, three: 1.0, steal: 1.0, block: 1.0 },
  PF: { speed: 0.9, size: 1.12, dunk: 1.12, three: 0.9, steal: 0.9, block: 1.12 },
  C: { speed: 0.82, size: 1.25, dunk: 1.2, three: 0.8, steal: 0.82, block: 1.25 },
};

// Rarity multiplier lifts the overall ceiling; legends also catch fire sooner.
const RARITY_MULT: Record<CardRarity, number> = {
  BRONZE: 0.9,
  SILVER: 0.97,
  GOLD: 1.04,
  LEGEND: 1.12,
};

const RARITY_FIRE_THRESHOLD: Record<CardRarity, number> = {
  BRONZE: 3,
  SILVER: 3,
  GOLD: 2,
  LEGEND: 2,
};

export function cardToArcadeAttributes(card: RosterCard): ArcadePlayerAttributes {
  const off = norm(card.off_rating);
  const def = norm(card.def_rating);
  const curve = POSITION_CURVE[card.position] ?? POSITION_CURVE.SF;
  const mult = RARITY_MULT[card.rarity] ?? 1;

  // Clamp helper so multiplied values stay in a sane 0.35..1.25 gameplay band.
  const c = (v: number) => Math.max(0.35, Math.min(1.25, v));

  return {
    speed: c(curve.speed * (0.7 + off * 0.4) * mult),
    jumpPower: c((0.75 + off * 0.35) * curve.dunk * mult),
    size: c(curve.size),
    dunkRange: c((0.6 + off * 0.5) * curve.dunk),
    threeAccuracy: c((0.35 + off * 0.5) * curve.three * mult),
    midAccuracy: c((0.5 + off * 0.45) * mult),
    stealChance: c((0.3 + def * 0.5) * curve.steal * mult),
    shoveStrength: c((0.5 + def * 0.4) * curve.size * mult),
    blockStrength: c((0.4 + def * 0.5) * curve.block * mult),
    onFireThreshold: RARITY_FIRE_THRESHOLD[card.rarity] ?? 3,
  };
}
