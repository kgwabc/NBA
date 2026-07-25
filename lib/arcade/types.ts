// Shared types for the 2v2 arcade basketball game.
// Kept dependency-free (only imports Card-related types) so physics/AI/state modules
// stay pure and unit-testable, and so both server and client can import freely.

import type { Card, CardPosition, CardRarity } from "@/lib/db";

export type TeamId = "home" | "away";
export type ControlSource = "p1" | "p2" | "ai";
export type MatchMode = "vs_ai" | "local_2p";

// Per-player gameplay stats derived from a Card (see attributes.ts). All roughly 0..1
// unless noted, so tuning constants in physics.ts stay readable.
export type ArcadePlayerAttributes = {
  speed: number; // horizontal run speed multiplier
  jumpPower: number; // vertical jump velocity multiplier
  size: number; // body height/width multiplier (affects reach & hitbox)
  dunkRange: number; // how far from the rim a dunk can trigger
  threeAccuracy: number; // make chance from three-point range
  midAccuracy: number; // make chance from mid/close range
  stealChance: number; // chance to strip the ball on a steal attempt
  shoveStrength: number; // knockback dealt on a shove
  blockStrength: number; // shot contest / block effectiveness on defense
  onFireThreshold: number; // consecutive makes needed to catch fire (lower = easier)
};

// A player's static identity for rendering (name + portrait + team colors).
export type ArcadeCharacter = {
  cardId: number;
  name: string;
  imageUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  position: CardPosition;
  rarity: CardRarity;
};

export type PlayerState = "idle" | "run" | "jump" | "dunk" | "shove" | "steal";

export type ArcadePlayer = {
  id: number; // 0..3, stable index into world.players
  team: TeamId;
  controlledBy: ControlSource;
  character: ArcadeCharacter;
  attrs: ArcadePlayerAttributes;
  // Kinematics. x = horizontal center, y = feet position (court floor = FLOOR_Y).
  // Jumping decreases y (up is negative). z-lane is ignored (pure side view).
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 1 | -1;
  state: PlayerState;
  stateTimer: number; // ms remaining in a transient state (shove/steal/dunk anim)
  actionCooldownMs: number; // gate on shoot/steal/shove re-trigger
  stunMs: number; // knockback stun after being shoved
};

export type BallState = "held" | "flight" | "loose";

export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: BallState;
  holderId: number | null; // player.id when held
  lastShooterId: number | null;
  // For an in-flight shot we pre-decide the outcome (arcade style) and animate toward it.
  madeShot: boolean;
  shotPoints: 2 | 3;
  shotTeam: TeamId | null; // team that attempted the shot (for streak/scoring)
  targetHoop: TeamId | null; // which basket the shot is heading to
};

export type GamePhase = "tipoff" | "playing" | "scored" | "quarterBreak" | "gameover";

export type MatchState = {
  quarter: number;
  totalQuarters: number;
  clockMs: number; // remaining in current quarter
  scoreHome: number;
  scoreAway: number;
  homeStreak: number; // consecutive made baskets
  awayStreak: number;
  onFireHome: boolean;
  onFireAway: boolean;
  onFireMsHome: number;
  onFireMsAway: number;
  phase: GamePhase;
  phaseTimer: number; // ms until phase auto-advances (scored/quarterBreak/tipoff)
  screenShake: number; // decays each frame; renderer offsets by this
  lastEvent: string | null; // short label for HUD banner ("덩크!", "온 파이어!")
};

// Full mutable simulation world owned by the engine.
export type World = {
  players: ArcadePlayer[];
  ball: Ball;
  match: MatchState;
  mode: MatchMode;
  courtWidth: number;
  courtHeight: number;
};

// What one player wants to do this tick. Produced by input.ts (human) or ai.ts (CPU).
export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean; // edge-triggered (true only on the frame the key goes down)
  action: boolean; // edge-triggered: shoot (on offense) / steal-or-shove (on defense)
};

// Low-frequency snapshot the React HUD subscribes to (never per-frame React state).
export type GameStateSnapshot = {
  quarter: number;
  totalQuarters: number;
  clockMs: number;
  scoreHome: number;
  scoreAway: number;
  onFireHome: boolean;
  onFireAway: boolean;
  phase: GamePhase;
  lastEvent: string | null;
  homeName: string;
  awayName: string;
};

export type RosterCard = Pick<
  Card,
  "id" | "name" | "team_slug" | "position" | "rarity" | "off_rating" | "def_rating" | "image_url"
>;

export type MatchConfig = {
  mode: MatchMode;
  homeCards: RosterCard[]; // exactly 2
  awayCards: RosterCard[]; // exactly 2
  quarterSeconds: number;
  totalQuarters: number;
};
