// Arcade physics constants + low-level helpers. Pure, framework-agnostic, unit-testable.
// Units: pixels and SECONDS (the engine steps at a fixed dt). Up is negative y.

import type { ArcadePlayer, TeamId } from "./types";

// ---- Court geometry (logical canvas coordinates) ----
export const COURT_WIDTH = 960;
export const COURT_HEIGHT = 540;
export const FLOOR_Y = 476; // players' feet rest here when grounded
export const CEILING_Y = 40; // top clamp for jumps/ball

// Rims: home team attacks the RIGHT hoop, away team attacks the LEFT hoop.
export const RIM_Y = 210; // height of the rim (from top)
export const LEFT_RIM_X = 96;
export const RIGHT_RIM_X = COURT_WIDTH - 96;
export const RIM_CATCH_RADIUS = 46; // how close the ball must land to resolve a shot
export const BACKBOARD_HALF_H = 60;

// Three-point arc: horizontal distance from the attacking hoop.
export const THREE_POINT_DISTANCE = 300;

// ---- Movement / physics tuning ----
export const GRAVITY = 2400; // px/s^2
export const RUN_SPEED = 260; // px/s at attrs.speed = 1
export const JUMP_VELOCITY = 760; // px/s upward at jumpPower = 1
export const AIR_CONTROL = 0.55; // fraction of run accel available mid-air
export const GROUND_FRICTION = 0.82; // per-frame damping when no input
export const ON_FIRE_SPEED_BONUS = 1.25;

// ---- Player body (scaled by attrs.size) ----
export const PLAYER_BASE_W = 40;
export const PLAYER_BASE_H = 88;

// ---- Interaction ----
export const BALL_PICKUP_RADIUS = 40;
export const STEAL_RADIUS = 62;
export const SHOVE_RADIUS = 52;
export const DUNK_TRIGGER_DISTANCE = 120; // horizontal distance to rim to allow a dunk
export const ACTION_COOLDOWN_MS = 420;
// Shove is deliberately weak/brief and has a long self-cooldown so defenders can't
// chain-shove a ball-carrier into a permanent stun-lock (arcade = keep the ball moving).
export const SHOVE_STUN_MS = 240;
export const SHOVE_KNOCKBACK = 170;
export const SHOVE_COOLDOWN_MS = 750;

export function playerWidth(p: ArcadePlayer): number {
  return PLAYER_BASE_W * p.attrs.size;
}
export function playerHeight(p: ArcadePlayer): number {
  return PLAYER_BASE_H * p.attrs.size;
}

export function rimXFor(attackingTeam: TeamId): number {
  return attackingTeam === "home" ? RIGHT_RIM_X : LEFT_RIM_X;
}

// The hoop a team defends is the one they DON'T attack.
export function attackingHoopX(team: TeamId): number {
  return rimXFor(team);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

// AABB centered on a player's (x, feetY). Returns left/right/top/bottom.
export function playerBox(p: ArcadePlayer): { l: number; r: number; t: number; b: number } {
  const w = playerWidth(p);
  const h = playerHeight(p);
  return { l: p.x - w / 2, r: p.x + w / 2, t: p.y - h, b: p.y };
}

export function boxesOverlap(
  a: { l: number; r: number; t: number; b: number },
  b: { l: number; r: number; t: number; b: number }
): boolean {
  return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
}

// Integrate one player's kinematics for dt seconds given a desired horizontal move (-1..1).
// Handles gravity, floor clamp, friction, and side-wall clamp. Does NOT resolve player-player
// collisions (collision.ts does that after all players integrate).
export function integratePlayer(p: ArcadePlayer, moveDir: number, dt: number, onFire: boolean): void {
  const speedMult = p.attrs.speed * (onFire ? ON_FIRE_SPEED_BONUS : 1);
  const targetVx = moveDir * RUN_SPEED * speedMult;

  if (p.stunMs > 0) {
    // While stunned, no self-driven movement; momentum only.
    p.vx *= 0.9;
  } else if (moveDir !== 0) {
    const control = p.grounded ? 1 : AIR_CONTROL;
    // Lerp toward target velocity for snappy-but-not-instant accel.
    p.vx += (targetVx - p.vx) * Math.min(1, 12 * control * dt);
    p.facing = moveDir > 0 ? 1 : -1;
  } else if (p.grounded) {
    p.vx *= GROUND_FRICTION;
    if (Math.abs(p.vx) < 4) p.vx = 0;
  }

  // Gravity + vertical integrate.
  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // Floor.
  if (p.y >= FLOOR_Y) {
    p.y = FLOOR_Y;
    p.vy = 0;
    p.grounded = true;
  } else {
    p.grounded = false;
  }

  // Side walls.
  const halfW = playerWidth(p) / 2;
  p.x = clamp(p.x, halfW, COURT_WIDTH - halfW);
}

// Compute a ballistic launch velocity from (x0,y0) to (xt,yt) over time T under gravity.
export function arcVelocity(
  x0: number,
  y0: number,
  xt: number,
  yt: number,
  T: number
): { vx: number; vy: number } {
  const vx = (xt - x0) / T;
  const vy = (yt - y0) / T - 0.5 * GRAVITY * T;
  return { vx, vy };
}
