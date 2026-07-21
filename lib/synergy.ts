import type { CardPosition } from "./db";

export type DeckCard = {
  position: CardPosition;
  teamSlug: string;
  offRating: number;
  defRating: number;
  synergyTags: string[];
  playerKey: string;
};

export type SynergyBonus = {
  id: string;
  label: string;
  offMultiplier?: number;
  defMultiplier?: number;
  opponentPaintPenalty?: number;
};

type SynergyRule = {
  id: string;
  label: string;
  check: (deck: DeckCard[]) => boolean;
  bonus: Omit<SynergyBonus, "id" | "label">;
};

function teamCounts(deck: DeckCard[]): number[] {
  const counts = new Map<string, number>();
  for (const card of deck) {
    counts.set(card.teamSlug, (counts.get(card.teamSlug) ?? 0) + 1);
  }
  return [...counts.values()];
}

function hasTags(deck: DeckCard[], tag: string, minCount: number): boolean {
  return deck.filter((c) => c.synergyTags.includes(tag)).length >= minCount;
}

const SYNERGY_RULES: SynergyRule[] = [
  {
    id: "TEAM_CHEMISTRY",
    label: "팀 케미스트리",
    check: (deck) => teamCounts(deck).some((count) => count >= 3),
    bonus: { offMultiplier: 1.05, defMultiplier: 1.05 },
  },
  {
    id: "SPLASH_BROTHERS",
    label: "스플래시 브라더스",
    check: (deck) => hasTags(deck, "SPLASH_BROTHERS", 2),
    bonus: { offMultiplier: 1.1 },
  },
  {
    id: "TWIN_TOWERS",
    label: "트윈 타워",
    check: (deck) => {
      const pf = deck.find((c) => c.position === "PF");
      const c = deck.find((c) => c.position === "C");
      return !!pf && !!c && pf.defRating + c.defRating >= 180;
    },
    bonus: { opponentPaintPenalty: 0.15 },
  },
];

export function computeSynergies(deck: DeckCard[]): SynergyBonus[] {
  return SYNERGY_RULES.filter((rule) => rule.check(deck)).map((rule) => ({
    id: rule.id,
    label: rule.label,
    ...rule.bonus,
  }));
}

export function applySynergies(deck: DeckCard[], bonuses: SynergyBonus[]) {
  const offMult = bonuses.reduce((m, b) => m * (b.offMultiplier ?? 1), 1);
  const defMult = bonuses.reduce((m, b) => m * (b.defMultiplier ?? 1), 1);
  const aggregateOff = deck.reduce((s, c) => s + c.offRating, 0) * offMult;
  const aggregateDef = deck.reduce((s, c) => s + c.defRating, 0) * defMult;
  const paintPenalty = bonuses.reduce((s, b) => s + (b.opponentPaintPenalty ?? 0), 0);
  return { aggregateOff, aggregateDef, paintPenalty, bonuses };
}
