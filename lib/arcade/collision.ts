// Collision resolution helpers. Arcade-simple: separate overlapping players along x,
// and provide rim/backboard tests for the ball. Pure functions.

import type { ArcadePlayer } from "./types";
import { boxesOverlap, playerBox, playerWidth } from "./physics";

// Push two overlapping players apart along the horizontal axis (side view = x matters most).
// Only separates when their vertical spans also overlap (so a player jumping over another
// doesn't get shoved sideways).
export function separatePlayers(a: ArcadePlayer, b: ArcadePlayer): void {
  const ba = playerBox(a);
  const bb = playerBox(b);
  if (!boxesOverlap(ba, bb)) return;

  const overlapX = Math.min(ba.r, bb.r) - Math.max(ba.l, bb.l);
  if (overlapX <= 0) return;

  const push = overlapX / 2 + 0.5;
  if (a.x <= b.x) {
    a.x -= push;
    b.x += push;
  } else {
    a.x += push;
    b.x -= push;
  }
}

export function resolveAllPlayerCollisions(players: ArcadePlayer[]): void {
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      separatePlayers(players[i], players[j]);
    }
  }
}

// Keep a player within the court after separation (mirror of the clamp in integratePlayer).
export function clampToCourt(p: ArcadePlayer, courtWidth: number): void {
  const halfW = playerWidth(p) / 2;
  if (p.x < halfW) p.x = halfW;
  if (p.x > courtWidth - halfW) p.x = courtWidth - halfW;
}
