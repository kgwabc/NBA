export type AggregateStats = { off: number; def: number; paintPenalty?: number };

export type BattleEvent = {
  quarter: 1 | 2 | 3 | 4;
  time: string;
  text: string;
  successChance: number;
  success: boolean;
  pointsScored: number;
  isUserPossession: boolean;
};

export type BattleResult = {
  events: BattleEvent[];
  userScore: number;
  opponentScore: number;
  result: "win" | "loss" | "draw";
};

const POSSESSIONS_PER_QUARTER = 6;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatClock(quarter: number, possessionIndex: number, totalPossessions: number) {
  const remainingFraction = 1 - possessionIndex / totalPossessions;
  const remainingSeconds = Math.round(remainingFraction * 12 * 60);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${quarter}쿼터 ${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function pickFlavorText(isUserPossession: boolean, success: boolean, points: number) {
  const side = isUserPossession ? "우리 팀" : "상대 팀";
  if (!success) return `${side}의 슛 시도, 실패!`;
  if (points === 3) return `${side}의 3점슛 성공!`;
  return `${side}의 득점 성공!`;
}

export function simulateBattle(
  userStats: AggregateStats,
  opponentStats: AggregateStats,
  rng: () => number = Math.random
): BattleResult {
  const events: BattleEvent[] = [];
  let userScore = 0;
  let opponentScore = 0;

  for (let quarter = 1; quarter <= 4; quarter++) {
    for (let p = 0; p < POSSESSIONS_PER_QUARTER; p++) {
      const isUserPossession = p % 2 === 0;
      const attacker = isUserPossession ? userStats : opponentStats;
      const defender = isUserPossession ? opponentStats : userStats;
      const effectiveDef = defender.def * (1 + (defender.paintPenalty ?? 0));
      const baseChance = 50 + (attacker.off - effectiveDef) * 0.6;
      const chance = clamp(baseChance, 5, 95);
      const roll = rng() * 100;
      const success = roll < chance;
      const points = success ? (rng() < 0.25 ? 3 : 2) : 0;

      if (success) {
        if (isUserPossession) userScore += points;
        else opponentScore += points;
      }

      events.push({
        quarter: quarter as 1 | 2 | 3 | 4,
        time: formatClock(quarter, p, POSSESSIONS_PER_QUARTER),
        text: pickFlavorText(isUserPossession, success, points),
        successChance: Math.round(chance),
        success,
        pointsScored: points,
        isUserPossession,
      });
    }
  }

  const result = userScore > opponentScore ? "win" : userScore < opponentScore ? "loss" : "draw";
  return { events, userScore, opponentScore, result };
}
