// Lightweight utility AI for CPU-controlled players. Returns an InputState per tick,
// consumed by the same action handlers as human input (so behavior stays symmetric).
// Difficulty is a few numeric knobs; the engine gates action spam via per-player cooldowns.

import type { ArcadePlayer, InputState, World } from "./types";
import { attackingHoopX, dist, DUNK_TRIGGER_DISTANCE, STEAL_RADIUS } from "./physics";

export type AiDifficulty = {
  reactionJitter: number; // 0..1 chance per tick to "hesitate" (skip acting)
  shotTendency: number; // 0..1 base chance to pull up for a shot when in range
  aggressiveness: number; // 0..1 how eagerly it contests/steals
};

export const DEFAULT_AI: AiDifficulty = {
  reactionJitter: 0.1,
  shotTendency: 0.05,
  aggressiveness: 0.55,
};

const IDLE: InputState = { left: false, right: false, jump: false, action: false };

function moveToward(fromX: number, toX: number, deadzone = 8): Pick<InputState, "left" | "right"> {
  if (Math.abs(toX - fromX) <= deadzone) return { left: false, right: false };
  return toX < fromX ? { left: true, right: false } : { left: false, right: true };
}

function teammateOf(world: World, p: ArcadePlayer): ArcadePlayer | undefined {
  return world.players.find((o) => o.id !== p.id && o.team === p.team);
}

function nearestOpponent(world: World, p: ArcadePlayer): ArcadePlayer | undefined {
  let best: ArcadePlayer | undefined;
  let bestD = Infinity;
  for (const o of world.players) {
    if (o.team === p.team) continue;
    const d = dist(p.x, p.y, o.x, o.y);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return best;
}

export function computeAiInput(p: ArcadePlayer, world: World, diff: AiDifficulty = DEFAULT_AI): InputState {
  const { ball } = world;
  if (Math.random() < diff.reactionJitter) return IDLE;

  const rimX = attackingHoopX(p.team);
  const holder = ball.holderId != null ? world.players[ball.holderId] : null;

  // --- I have the ball: drive & finish ---
  if (holder && holder.id === p.id) {
    const distToRim = Math.abs(p.x - rimX);
    const move = moveToward(p.x, rimX, 6);

    // Dunk: close to rim -> jump, then slam once airborne.
    if (distToRim < DUNK_TRIGGER_DISTANCE) {
      if (p.grounded) return { ...move, jump: true, action: false };
      return { ...move, jump: false, action: true };
    }

    // How closely is the nearest defender guarding me?
    let nearestDefender = Infinity;
    for (const o of world.players) {
      if (o.team === p.team) continue;
      nearestDefender = Math.min(nearestDefender, dist(p.x, p.y, o.x, o.y));
    }
    const pressured = nearestDefender < 70;

    // Arcade shooting: a carrier can pull up from ANYWHERE (accuracy is distance-scaled in
    // the engine). Eagerness rises the closer they are and spikes when a defender is on top
    // of them — so possessions always resolve in a shot instead of dribbling into a steal.
    if (p.grounded) {
      const closeness = Math.max(0, 1 - distToRim / 900);
      const urge = diff.shotTendency + closeness * 0.1 + (pressured ? 0.25 : 0);
      if (Math.random() < urge) {
        return { left: false, right: false, jump: false, action: true };
      }
    }
    return { ...move, jump: false, action: false };
  }

  // --- Teammate has the ball: get ahead toward our hoop to spread the floor ---
  if (holder && holder.team === p.team) {
    const spot = rimX + (p.team === "home" ? -140 : 140);
    return { ...moveToward(p.x, spot), jump: false, action: false };
  }

  // --- Opponent has the ball: defend ---
  if (holder && holder.team !== p.team) {
    const move = moveToward(p.x, holder.x, 4);
    const d = dist(p.x, p.y, holder.x, holder.y);
    // Contest: if the carrier is airborne right next to us, jump to block.
    if (!holder.grounded && d < STEAL_RADIUS && Math.random() < diff.aggressiveness) {
      return { ...move, jump: true, action: true };
    }
    // Steal/shove attempt when adjacent.
    if (d < STEAL_RADIUS && Math.random() < diff.aggressiveness) {
      return { ...move, jump: false, action: true };
    }
    return { ...move, jump: false, action: false };
  }

  // --- Loose ball: chase it (nearest defender-ish behavior) ---
  if (ball.state === "loose") {
    return { ...moveToward(p.x, ball.x, 4), jump: false, action: false };
  }

  // Fallback: shadow nearest opponent.
  const opp = nearestOpponent(world, p);
  if (opp) return { ...moveToward(p.x, opp.x, 20), jump: false, action: false };
  return IDLE;
}
