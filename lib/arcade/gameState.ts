// The arcade match engine. Owns the mutable World, steps the simulation at a fixed dt,
// resolves actions (shoot/dunk/steal/shove), scoring, on-fire streaks, and quarters.
// Exposes a subscribe/getSnapshot store so the React HUD can read low-frequency state
// via useSyncExternalStore without ever touching per-frame data.

import { getTeamBySlug } from "@/lib/nbaTeams";
import { cardToArcadeAttributes } from "./attributes";
import { computeAiInput } from "./ai";
import { clampToCourt, resolveAllPlayerCollisions } from "./collision";
import {
  ACTION_COOLDOWN_MS,
  arcVelocity,
  attackingHoopX,
  BALL_PICKUP_RADIUS,
  CEILING_Y,
  clamp,
  COURT_HEIGHT,
  COURT_WIDTH,
  dist,
  DUNK_TRIGGER_DISTANCE,
  FLOOR_Y,
  GRAVITY,
  integratePlayer,
  JUMP_VELOCITY,
  playerHeight,
  playerWidth,
  RIM_CATCH_RADIUS,
  RIM_Y,
  SHOVE_COOLDOWN_MS,
  SHOVE_KNOCKBACK,
  SHOVE_RADIUS,
  SHOVE_STUN_MS,
  STEAL_RADIUS,
  THREE_POINT_DISTANCE,
} from "./physics";
import type {
  ArcadeCharacter,
  ArcadePlayer,
  Ball,
  ControlSource,
  GameStateSnapshot,
  InputState,
  MatchConfig,
  MatchState,
  RosterCard,
  TeamId,
  World,
} from "./types";

const SCORED_PHASE_MS = 1400;
const TIPOFF_MS = 1200;
const QUARTER_BREAK_MS = 2200;
const ON_FIRE_MS = 9000;
const FALLBACK_COLORS = { primary: "#334155", secondary: "#e2e8f0" };

const IDLE_INPUT: InputState = { left: false, right: false, jump: false, action: false };

function characterFromCard(card: RosterCard): ArcadeCharacter {
  const team = getTeamBySlug(card.team_slug);
  return {
    cardId: card.id,
    name: card.name,
    imageUrl: card.image_url,
    primaryColor: team?.primaryColor ?? FALLBACK_COLORS.primary,
    secondaryColor: team?.secondaryColor ?? FALLBACK_COLORS.secondary,
    position: card.position,
    rarity: card.rarity,
  };
}

function makePlayer(id: number, team: TeamId, controlledBy: ControlSource, card: RosterCard, x: number): ArcadePlayer {
  return {
    id,
    team,
    controlledBy,
    character: characterFromCard(card),
    attrs: cardToArcadeAttributes(card),
    x,
    y: FLOOR_Y,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: team === "home" ? 1 : -1,
    state: "idle",
    stateTimer: 0,
    actionCooldownMs: 0,
    stunMs: 0,
  };
}

// Control assignment: player 0 of each side may be human; teammates are always AI.
//   vs_ai:    home0 = P1 human, everyone else AI.
//   local_2p: home0 = P1 human, away0 = P2 human, teammates AI.
function controlFor(team: TeamId, index: number, mode: MatchConfig["mode"]): ControlSource {
  if (team === "home" && index === 0) return "p1";
  if (team === "away" && index === 0 && mode === "local_2p") return "p2";
  return "ai";
}

export function createWorld(config: MatchConfig): World {
  const players: ArcadePlayer[] = [
    makePlayer(0, "home", controlFor("home", 0, config.mode), config.homeCards[0], COURT_WIDTH * 0.36),
    makePlayer(1, "home", controlFor("home", 1, config.mode), config.homeCards[1], COURT_WIDTH * 0.28),
    makePlayer(2, "away", controlFor("away", 0, config.mode), config.awayCards[0], COURT_WIDTH * 0.64),
    makePlayer(3, "away", controlFor("away", 1, config.mode), config.awayCards[1], COURT_WIDTH * 0.72),
  ];

  const ball: Ball = {
    x: COURT_WIDTH / 2,
    y: RIM_Y,
    vx: 0,
    vy: 0,
    state: "loose",
    holderId: null,
    lastShooterId: null,
    madeShot: false,
    shotPoints: 2,
    shotTeam: null,
    targetHoop: null,
  };

  const match: MatchState = {
    quarter: 1,
    totalQuarters: config.totalQuarters,
    clockMs: config.quarterSeconds * 1000,
    scoreHome: 0,
    scoreAway: 0,
    homeStreak: 0,
    awayStreak: 0,
    onFireHome: false,
    onFireAway: false,
    onFireMsHome: 0,
    onFireMsAway: 0,
    phase: "tipoff",
    phaseTimer: TIPOFF_MS,
    screenShake: 0,
    lastEvent: "경기 시작!",
  };

  return {
    players,
    ball,
    match,
    mode: config.mode,
    courtWidth: COURT_WIDTH,
    courtHeight: COURT_HEIGHT,
  };
}

// ---- Engine ----

export class ArcadeEngine {
  readonly world: World;
  private config: MatchConfig;
  private listeners = new Set<() => void>();
  private snapshot: GameStateSnapshot;
  private flightTimer = 0;

  constructor(config: MatchConfig) {
    this.config = config;
    this.world = createWorld(config);
    this.snapshot = this.buildSnapshot();
  }

  // ---- store API for useSyncExternalStore ----
  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  getSnapshot = (): GameStateSnapshot => this.snapshot;

  private buildSnapshot(): GameStateSnapshot {
    const m = this.world.match;
    const [h0, h1] = this.world.players.filter((p) => p.team === "home");
    const [a0, a1] = this.world.players.filter((p) => p.team === "away");
    return {
      quarter: m.quarter,
      totalQuarters: m.totalQuarters,
      clockMs: m.clockMs,
      scoreHome: m.scoreHome,
      scoreAway: m.scoreAway,
      onFireHome: m.onFireHome,
      onFireAway: m.onFireAway,
      phase: m.phase,
      lastEvent: m.lastEvent,
      homeName: `${h0.character.name} · ${h1.character.name}`,
      awayName: `${a0.character.name} · ${a1.character.name}`,
    };
  }

  // Rebuild + notify only when a HUD-relevant field changed (keeps snapshot ref stable).
  private syncSnapshot(): void {
    const next = this.buildSnapshot();
    const prev = this.snapshot;
    const changed =
      next.scoreHome !== prev.scoreHome ||
      next.scoreAway !== prev.scoreAway ||
      next.quarter !== prev.quarter ||
      Math.round(next.clockMs / 250) !== Math.round(prev.clockMs / 250) ||
      next.onFireHome !== prev.onFireHome ||
      next.onFireAway !== prev.onFireAway ||
      next.phase !== prev.phase ||
      next.lastEvent !== prev.lastEvent;
    if (changed) {
      this.snapshot = next;
      this.listeners.forEach((cb) => cb());
    }
  }

  isGameOver(): boolean {
    return this.world.match.phase === "gameover";
  }

  getResult(): { homeScore: number; awayScore: number; homeWon: boolean; draw: boolean } {
    const m = this.world.match;
    return {
      homeScore: m.scoreHome,
      awayScore: m.scoreAway,
      homeWon: m.scoreHome > m.scoreAway,
      draw: m.scoreHome === m.scoreAway,
    };
  }

  // ---- main step ----
  step(dt: number, humanInputs: { p1: InputState; p2: InputState }): void {
    const m = this.world.match;
    if (m.screenShake > 0) m.screenShake = Math.max(0, m.screenShake - dt * 60);

    if (m.phase !== "playing") {
      this.stepNonPlaying(dt);
      this.syncSnapshot();
      return;
    }

    // Clock.
    m.clockMs -= dt * 1000;
    if (m.clockMs <= 0) {
      m.clockMs = 0;
      this.endQuarter();
      this.syncSnapshot();
      return;
    }

    // Resolve inputs for every player.
    const inputs = this.world.players.map((p) => this.inputFor(p, humanInputs));

    // Movement + jump.
    this.world.players.forEach((p, i) => {
      const inp = inputs[i];
      if (p.actionCooldownMs > 0) p.actionCooldownMs -= dt * 1000;
      if (p.stunMs > 0) p.stunMs -= dt * 1000;

      const moveDir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (inp.jump && p.grounded && p.stunMs <= 0) {
        p.vy = -JUMP_VELOCITY * p.attrs.jumpPower;
        p.grounded = false;
        p.state = "jump";
      }
      const onFire = p.team === "home" ? m.onFireHome : m.onFireAway;
      integratePlayer(p, moveDir, dt, onFire);
      if (p.grounded && p.stunMs <= 0) {
        p.state = Math.abs(p.vx) > 20 ? "run" : "idle";
      }
    });

    resolveAllPlayerCollisions(this.world.players);
    this.world.players.forEach((p) => clampToCourt(p, this.world.courtWidth));

    // Actions (edge-triggered by input).
    this.world.players.forEach((p, i) => {
      if (inputs[i].action) this.handleAction(p);
    });

    // Ball.
    this.updateBall(dt);

    // On-fire timers.
    if (m.onFireHome) {
      m.onFireMsHome -= dt * 1000;
      if (m.onFireMsHome <= 0) {
        m.onFireHome = false;
        m.homeStreak = 0;
      }
    }
    if (m.onFireAway) {
      m.onFireMsAway -= dt * 1000;
      if (m.onFireMsAway <= 0) {
        m.onFireAway = false;
        m.awayStreak = 0;
      }
    }

    this.syncSnapshot();
  }

  private stepNonPlaying(dt: number): void {
    const m = this.world.match;
    m.phaseTimer -= dt * 1000;
    // Keep the ball glued to its holder during dead-ball phases.
    this.updateBall(dt);
    if (m.phaseTimer > 0) return;

    if (m.phase === "tipoff" || m.phase === "scored") {
      m.phase = "playing";
      m.lastEvent = null;
    } else if (m.phase === "quarterBreak") {
      this.resetPositions(this.world.match.quarter % 2 === 1 ? "home" : "away");
      m.phase = "playing";
      m.lastEvent = null;
    }
  }

  private inputFor(p: ArcadePlayer, human: { p1: InputState; p2: InputState }): InputState {
    if (p.controlledBy === "p1") return human.p1;
    if (p.controlledBy === "p2") return human.p2;
    return computeAiInput(p, this.world);
  }

  // ---- actions ----
  private handleAction(p: ArcadePlayer): void {
    if (p.actionCooldownMs > 0 || p.stunMs > 0) return;
    const ball = this.world.ball;

    if (ball.holderId === p.id) {
      // Offense with the ball.
      const rimX = attackingHoopX(p.team);
      const nearRim = Math.abs(p.x - rimX) < DUNK_TRIGGER_DISTANCE;
      if (!p.grounded && nearRim) {
        this.doDunk(p);
      } else {
        this.doShoot(p);
      }
      p.actionCooldownMs = ACTION_COOLDOWN_MS;
      return;
    }

    // Defense: try to strip/shove the nearest opposing ball-carrier.
    const carrier = ball.holderId != null ? this.world.players[ball.holderId] : null;
    if (carrier && carrier.team !== p.team) {
      const d = dist(p.x, p.y, carrier.x, carrier.y);
      if (d < SHOVE_RADIUS) {
        this.doShove(p, carrier);
        p.actionCooldownMs = SHOVE_COOLDOWN_MS;
      } else if (d < STEAL_RADIUS) {
        this.doSteal(p, carrier);
        p.actionCooldownMs = ACTION_COOLDOWN_MS;
      }
    }
  }

  private doShoot(shooter: ArcadePlayer): void {
    const m = this.world.match;
    const ball = this.world.ball;
    const rimX = attackingHoopX(shooter.team);
    const distToRim = Math.abs(shooter.x - rimX);
    const points: 2 | 3 = distToRim > THREE_POINT_DISTANCE ? 3 : 2;

    // Base accuracy from attributes, distance-scaled.
    const baseAcc = points === 3 ? shooter.attrs.threeAccuracy : shooter.attrs.midAccuracy;
    const distFactor = clamp(1 - distToRim / (THREE_POINT_DISTANCE + 200), 0.35, 1);

    // Contest: nearest opponent within reach lowers the make chance.
    let contest = 0;
    for (const o of this.world.players) {
      if (o.team === shooter.team) continue;
      const d = dist(shooter.x, shooter.y, o.x, o.y);
      if (d < 90) contest = Math.max(contest, (1 - d / 90) * 0.35 * o.attrs.blockStrength);
    }

    const onFire = shooter.team === "home" ? m.onFireHome : m.onFireAway;
    const fireBonus = onFire ? 0.35 : 0;
    const makeProb = clamp(baseAcc * distFactor + fireBonus - contest, 0.05, 0.95);
    const made = Math.random() < makeProb;

    // Launch a ballistic arc toward the rim (miss aims at the front rim so it visibly clanks).
    const dirToRim = Math.sign(rimX - shooter.x) || 1;
    const targetX = made ? rimX : rimX - dirToRim * 34;
    const targetY = made ? RIM_Y : RIM_Y + 6;
    const T = clamp(0.55 + distToRim / 900, 0.55, 1.05);
    const { vx, vy } = arcVelocity(ball.x, ball.y, targetX, targetY, T);

    ball.state = "flight";
    ball.holderId = null;
    ball.vx = vx;
    ball.vy = vy;
    ball.lastShooterId = shooter.id;
    ball.shotTeam = shooter.team;
    ball.targetHoop = shooter.team;
    ball.shotPoints = points;
    ball.madeShot = made;
    this.flightTimer = T;

    shooter.state = "jump";
  }

  private doDunk(dunker: ArcadePlayer): void {
    const m = this.world.match;
    const ball = this.world.ball;
    dunker.state = "dunk";
    ball.state = "flight";
    ball.holderId = null;
    ball.madeShot = true;
    ball.shotPoints = 2;
    ball.shotTeam = dunker.team;
    ball.targetHoop = dunker.team;
    ball.lastShooterId = dunker.id;
    // Snap the ball to the rim and resolve almost immediately for a slam feel.
    const rimX = attackingHoopX(dunker.team);
    ball.x = rimX;
    ball.y = RIM_Y;
    ball.vx = 0;
    ball.vy = 0;
    this.flightTimer = 0.12;
    m.screenShake = 16;
    m.lastEvent = "덩크!!";
  }

  private doShove(defender: ArcadePlayer, carrier: ArcadePlayer): void {
    const m = this.world.match;
    defender.state = "shove";
    const dir = Math.sign(carrier.x - defender.x) || defender.facing;
    carrier.vx += dir * SHOVE_KNOCKBACK * defender.attrs.shoveStrength;
    carrier.stunMs = SHOVE_STUN_MS;
    m.screenShake = Math.max(m.screenShake, 8);
    // Chance to knock the ball loose.
    if (Math.random() < 0.3 * defender.attrs.shoveStrength) {
      this.dislodgeBall(carrier, dir);
      m.lastEvent = "볼 스틸!";
    } else {
      m.lastEvent = "밀치기!";
    }
  }

  private doSteal(defender: ArcadePlayer, carrier: ArcadePlayer): void {
    const m = this.world.match;
    defender.state = "steal";
    const prob = clamp(defender.attrs.stealChance * 0.55 - carrier.attrs.midAccuracy * 0.15, 0.05, 0.7);
    if (Math.random() < prob) {
      this.giveBallTo(defender);
      m.lastEvent = "스틸!";
    }
  }

  private dislodgeBall(from: ArcadePlayer, dir: number): void {
    const ball = this.world.ball;
    ball.state = "loose";
    ball.holderId = null;
    ball.x = from.x + dir * 20;
    ball.y = from.y - playerHeight(from) * 0.5;
    ball.vx = dir * 180;
    ball.vy = -260;
  }

  private giveBallTo(p: ArcadePlayer): void {
    const ball = this.world.ball;
    ball.state = "held";
    ball.holderId = p.id;
    ball.vx = 0;
    ball.vy = 0;
  }

  // ---- ball update ----
  private updateBall(dt: number): void {
    const ball = this.world.ball;

    if (ball.state === "held") {
      if (ball.holderId == null) {
        ball.state = "loose";
        return;
      }
      const h = this.world.players[ball.holderId];
      ball.x = h.x + h.facing * (playerWidth(h) * 0.5 + 8);
      ball.y = h.y - playerHeight(h) * 0.62;
      return;
    }

    if (ball.state === "flight") {
      ball.vy += GRAVITY * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      this.flightTimer -= dt;
      if (this.flightTimer <= 0) this.resolveShot();
      return;
    }

    // Loose: gravity + floor bounce, then pickup by nearest close player.
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.y >= FLOOR_Y) {
      ball.y = FLOOR_Y;
      ball.vy *= -0.5;
      ball.vx *= 0.7;
      if (Math.abs(ball.vy) < 60) ball.vy = 0;
    }
    ball.x = clamp(ball.x, 10, this.world.courtWidth - 10);
    ball.y = clamp(ball.y, CEILING_Y, FLOOR_Y);

    let nearest: ArcadePlayer | null = null;
    let nearestD = BALL_PICKUP_RADIUS;
    for (const p of this.world.players) {
      const d = dist(p.x, p.y - playerHeight(p) * 0.5, ball.x, ball.y);
      if (d < nearestD) {
        nearestD = d;
        nearest = p;
      }
    }
    if (nearest) this.giveBallTo(nearest);
  }

  private resolveShot(): void {
    const ball = this.world.ball;
    const m = this.world.match;
    const team = ball.shotTeam;
    if (!team) {
      ball.state = "loose";
      return;
    }

    if (ball.madeShot) {
      const pts = ball.shotPoints;
      if (team === "home") {
        m.scoreHome += pts;
        m.homeStreak += 1;
      } else {
        m.scoreAway += pts;
        m.awayStreak += 1;
      }
      this.checkOnFire(team);
      if (m.lastEvent !== "덩크!!" && m.lastEvent !== "온 파이어!!") {
        m.lastEvent = pts === 3 ? "3점 성공!" : "득점!";
      }
      m.screenShake = Math.max(m.screenShake, pts === 3 ? 12 : 8);
      // Dead ball; conceding team inbounds after a brief pause.
      ball.state = "held";
      ball.holderId = null;
      m.phase = "scored";
      m.phaseTimer = SCORED_PHASE_MS;
      this.resetPositions(team === "home" ? "away" : "home");
    } else {
      // Miss: reset the shooting team's streak/fire, ball becomes a live rebound.
      if (team === "home") {
        m.homeStreak = 0;
        m.onFireHome = false;
      } else {
        m.awayStreak = 0;
        m.onFireAway = false;
      }
      m.lastEvent = "빗나감";
      ball.state = "loose";
      ball.vx = (Math.random() - 0.5) * 160;
      ball.vy = -180;
    }
  }

  private checkOnFire(team: TeamId): void {
    const m = this.world.match;
    const streak = team === "home" ? m.homeStreak : m.awayStreak;
    // Use the best (lowest) fire threshold on the team.
    const threshold = Math.min(
      ...this.world.players.filter((p) => p.team === team).map((p) => p.attrs.onFireThreshold)
    );
    if (streak >= threshold) {
      if (team === "home") {
        m.onFireHome = true;
        m.onFireMsHome = ON_FIRE_MS;
      } else {
        m.onFireAway = true;
        m.onFireMsAway = ON_FIRE_MS;
      }
      m.lastEvent = "온 파이어!!";
    }
  }

  // ---- flow ----
  private endQuarter(): void {
    const m = this.world.match;
    if (m.quarter >= m.totalQuarters) {
      m.phase = "gameover";
      m.lastEvent = "경기 종료";
      return;
    }
    m.quarter += 1;
    m.clockMs = this.config.quarterSeconds * 1000;
    m.phase = "quarterBreak";
    m.phaseTimer = QUARTER_BREAK_MS;
    m.lastEvent = `${m.quarter}쿼터`;
  }

  private resetPositions(possession: TeamId): void {
    const spots: Record<number, number> = {
      0: COURT_WIDTH * 0.36,
      1: COURT_WIDTH * 0.28,
      2: COURT_WIDTH * 0.64,
      3: COURT_WIDTH * 0.72,
    };
    for (const p of this.world.players) {
      p.x = spots[p.id];
      p.y = FLOOR_Y;
      p.vx = 0;
      p.vy = 0;
      p.grounded = true;
      p.state = "idle";
      p.stunMs = 0;
      p.actionCooldownMs = 0;
      p.facing = p.team === "home" ? 1 : -1;
    }
    // Give the ball to the possession team's guard (player index 0 of that side).
    const guard = this.world.players.find((p) => p.team === possession && (p.id === 0 || p.id === 2));
    if (guard) this.giveBallTo(guard);
  }
}

export { IDLE_INPUT };
