import type { CardPosition } from "./db";

export type BattlePlayer = {
  name: string;
  position: CardPosition;
  offRating: number;
  defRating: number;
};

export type TeamSynergy = {
  offMultiplier: number;
  defMultiplier: number;
  opponentPaintPenalty: number;
};

export type ScoringEvent = {
  quarter: 1 | 2 | 3 | 4;
  time: string;
  team: "user" | "opponent";
  scorerName: string;
  points: 2 | 3;
  assistName?: string;
};

export type PlayerStatLine = {
  name: string;
  position: CardPosition;
  pts: number;
  reb: number;
  ast: number;
};

export type BattleResult = {
  events: ScoringEvent[];
  userScore: number;
  opponentScore: number;
  result: "win" | "loss" | "draw";
  boxScore: { user: PlayerStatLine[]; opponent: PlayerStatLine[] };
};

// Tuned so an evenly-matched game (both aggregate off ~= aggregate def) lands the
// per-team score in the ~90-115 range over a full 4-quarter game — see scripts used
// during development for the calibration runs.
const POSSESSIONS_PER_QUARTER_PER_TEAM = 23;
const THREE_POINT_RATE = 0.25;
const OFFENSIVE_REBOUND_RATE = 0.25;
const ASSIST_RATE = 0.65;
const CHANCE_SCALE = 1.1;

// Real-world-ish tendencies: bigs crash the offensive/defensive glass, guards distribute.
const REBOUND_POSITION_WEIGHT: Record<CardPosition, number> = { C: 2.0, PF: 1.6, SF: 1.1, SG: 0.8, PG: 0.6 };
const ASSIST_POSITION_WEIGHT: Record<CardPosition, number> = { PG: 2.0, SG: 1.3, SF: 1.0, PF: 0.7, C: 0.5 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatClock(quarter: number, possessionIndex: number, totalPossessions: number): string {
  const remainingFraction = 1 - possessionIndex / totalPossessions;
  const remainingSeconds = Math.round(remainingFraction * 12 * 60);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${quarter}쿼터 ${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Weighted pick without replacement concerns (a player can be picked again next call).
function weightedPick<T>(items: T[], weight: (item: T) => number, rng: () => number): T {
  const weights = items.map(weight);
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[Math.floor(rng() * items.length)];
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

function avgDef(players: BattlePlayer[]): number {
  return players.reduce((s, p) => s + p.defRating, 0) / players.length;
}

type TeamState = {
  players: BattlePlayer[];
  synergy: TeamSynergy;
  stats: Map<string, PlayerStatLine>;
};

function makeTeamState(players: BattlePlayer[], synergy: TeamSynergy): TeamState {
  const stats = new Map<string, PlayerStatLine>();
  for (const p of players) {
    stats.set(p.name, { name: p.name, position: p.position, pts: 0, reb: 0, ast: 0 });
  }
  return { players, synergy, stats };
}

export function simulateBattle(
  userPlayers: BattlePlayer[],
  userSynergy: TeamSynergy,
  opponentPlayers: BattlePlayer[],
  opponentSynergy: TeamSynergy,
  rng: () => number = Math.random
): BattleResult {
  const user = makeTeamState(userPlayers, userSynergy);
  const opponent = makeTeamState(opponentPlayers, opponentSynergy);

  const events: ScoringEvent[] = [];
  let userScore = 0;
  let opponentScore = 0;

  for (let quarter = 1; quarter <= 4; quarter++) {
    for (let p = 0; p < POSSESSIONS_PER_QUARTER_PER_TEAM * 2; p++) {
      const isUserPossession = p % 2 === 0;
      const offense = isUserPossession ? user : opponent;
      const defense = isUserPossession ? opponent : user;
      const possessionIndex = Math.floor(p / 2);

      const shooter = weightedPick(offense.players, (pl) => pl.offRating, rng);
      const effectiveOff = shooter.offRating * offense.synergy.offMultiplier;
      const effectiveDef =
        avgDef(defense.players) * defense.synergy.defMultiplier * (1 + defense.synergy.opponentPaintPenalty);
      const chance = clamp(50 + (effectiveOff - effectiveDef) * CHANCE_SCALE, 8, 92);
      const made = rng() * 100 < chance;

      if (made) {
        const points: 2 | 3 = rng() < THREE_POINT_RATE ? 3 : 2;
        const shooterLine = offense.stats.get(shooter.name)!;
        shooterLine.pts += points;

        let assistName: string | undefined;
        if (rng() < ASSIST_RATE) {
          const passers = offense.players.filter((pl) => pl.name !== shooter.name);
          if (passers.length > 0) {
            const passer = weightedPick(passers, (pl) => pl.offRating * ASSIST_POSITION_WEIGHT[pl.position], rng);
            offense.stats.get(passer.name)!.ast += 1;
            assistName = passer.name;
          }
        }

        if (isUserPossession) userScore += points;
        else opponentScore += points;

        events.push({
          quarter: quarter as 1 | 2 | 3 | 4,
          time: formatClock(quarter, possessionIndex, POSSESSIONS_PER_QUARTER_PER_TEAM),
          team: isUserPossession ? "user" : "opponent",
          scorerName: shooter.name,
          points,
          assistName,
        });
      } else {
        // Rebound: defense usually secures it, offense occasionally crashes the glass.
        const reboundingTeam = rng() < OFFENSIVE_REBOUND_RATE ? offense : defense;
        const rebounder = weightedPick(
          reboundingTeam.players,
          (pl) => pl.defRating * REBOUND_POSITION_WEIGHT[pl.position],
          rng
        );
        reboundingTeam.stats.get(rebounder.name)!.reb += 1;
      }
    }
  }

  const result = userScore > opponentScore ? "win" : userScore < opponentScore ? "loss" : "draw";
  return {
    events,
    userScore,
    opponentScore,
    result,
    boxScore: {
      user: [...user.stats.values()],
      opponent: [...opponent.stats.values()],
    },
  };
}
