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

function teamCounts(deck: DeckCard[]): number[] {
  const counts = new Map<string, number>();
  for (const card of deck) {
    counts.set(card.teamSlug, (counts.get(card.teamSlug) ?? 0) + 1);
  }
  return [...counts.values()];
}

// 팀 케미스트리는 인원수에 따라 배율이 달라지는 유일한 시너지라 고정 룰 테이블 대신 여기서 직접 계산한다.
const TEAM_CHEMISTRY_BONUS_BY_COUNT: Record<number, number> = { 3: 0.05, 4: 0.07, 5: 0.1 };

export function computeSynergies(deck: DeckCard[]): SynergyBonus[] {
  const maxTeamCount = Math.max(0, ...teamCounts(deck));
  const bonusRate = TEAM_CHEMISTRY_BONUS_BY_COUNT[maxTeamCount];
  if (!bonusRate) return [];

  return [
    {
      id: "TEAM_CHEMISTRY",
      label: "팀 케미스트리",
      offMultiplier: 1 + bonusRate,
      defMultiplier: 1 + bonusRate,
    },
  ];
}

export function applySynergies(deck: DeckCard[], bonuses: SynergyBonus[]) {
  const offMult = bonuses.reduce((m, b) => m * (b.offMultiplier ?? 1), 1);
  const defMult = bonuses.reduce((m, b) => m * (b.defMultiplier ?? 1), 1);
  const aggregateOff = deck.reduce((s, c) => s + c.offRating, 0) * offMult;
  const aggregateDef = deck.reduce((s, c) => s + c.defRating, 0) * defMult;
  const paintPenalty = bonuses.reduce((s, b) => s + (b.opponentPaintPenalty ?? 0), 0);
  return { aggregateOff, aggregateDef, paintPenalty, bonuses };
}
