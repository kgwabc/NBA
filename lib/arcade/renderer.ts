// Canvas renderer for the arcade court. Stage-1 "photo-badge" sprites: a team-colored body
// with the card's portrait as a circular head badge — zero new art, recognizable players.
// All per-player drawing goes through renderPlayer() so a real sprite-sheet animator can be
// swapped in later (Stage 3) without touching game logic.

import {
  COURT_HEIGHT,
  COURT_WIDTH,
  FLOOR_Y,
  LEFT_RIM_X,
  playerHeight,
  playerWidth,
  RIGHT_RIM_X,
  RIM_Y,
  THREE_POINT_DISTANCE,
} from "./physics";
import type { ArcadePlayer, World } from "./types";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export class ArcadeRenderer {
  private ctx: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // Lazy-load a portrait; returns the element only once fully loaded (else null → colored head).
  private getImage(url: string | null): HTMLImageElement | null {
    if (!url) return null;
    const cached = this.images.get(url);
    if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;
    if (typeof window === "undefined") return null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    this.images.set(url, img);
    return null;
  }

  draw(world: World): void {
    const ctx = this.ctx;
    const m = world.match;

    ctx.save();
    if (m.screenShake > 0) {
      const s = m.screenShake;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    this.drawCourt();

    // On-fire auras behind players.
    for (const p of world.players) {
      const onFire = p.team === "home" ? m.onFireHome : m.onFireAway;
      if (onFire) this.drawFireAura(p);
    }

    // Players sorted by feet-y so nearer ones overlap correctly.
    const order = [...world.players].sort((a, b) => a.y - b.y);
    for (const p of order) this.renderPlayer(p);

    this.drawBall(world);

    ctx.restore();
  }

  private drawCourt(): void {
    const ctx = this.ctx;

    // Backdrop.
    const sky = ctx.createLinearGradient(0, 0, 0, COURT_HEIGHT);
    sky.addColorStop(0, "#0b1020");
    sky.addColorStop(1, "#161d33");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

    // Crowd rows (blocky pixels).
    for (let row = 0; row < 3; row++) {
      const y = 44 + row * 26;
      for (let x = 8; x < COURT_WIDTH - 8; x += 22) {
        const shade = 40 + ((x + row * 13) % 40);
        ctx.fillStyle = `rgb(${shade},${shade + 8},${shade + 20})`;
        ctx.fillRect(x, y, 16, 16);
      }
    }

    // Floor.
    const floor = ctx.createLinearGradient(0, RIM_Y, 0, COURT_HEIGHT);
    floor.addColorStop(0, "#8a5a2b");
    floor.addColorStop(1, "#6b431e");
    ctx.fillStyle = floor;
    ctx.fillRect(0, FLOOR_Y, COURT_WIDTH, COURT_HEIGHT - FLOOR_Y);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, FLOOR_Y, COURT_WIDTH, 3);

    // Center line + logo circle.
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(COURT_WIDTH / 2, FLOOR_Y);
    ctx.lineTo(COURT_WIDTH / 2, COURT_HEIGHT);
    ctx.stroke();

    // Three-point arcs (floor markings) for each hoop.
    this.drawThreeLine(RIGHT_RIM_X, -1);
    this.drawThreeLine(LEFT_RIM_X, 1);

    // Hoops.
    this.drawHoop(RIGHT_RIM_X, -1);
    this.drawHoop(LEFT_RIM_X, 1);
  }

  private drawThreeLine(rimX: number, dir: number): void {
    const ctx = this.ctx;
    const x = rimX + dir * THREE_POINT_DISTANCE;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, FLOOR_Y);
    ctx.lineTo(x, FLOOR_Y - 4);
    ctx.stroke();
    // Small painted key near the rim.
    ctx.strokeRect(Math.min(rimX, rimX + dir * 90), FLOOR_Y - 3, 90, 3);
  }

  private drawHoop(rimX: number, dir: number): void {
    const ctx = this.ctx;
    const boardX = rimX - dir * 6;

    // Pole + backboard.
    ctx.fillStyle = "#c9ced6";
    ctx.fillRect(rimX - dir * 8 - 3, RIM_Y - 62, 6, 62);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(boardX - 3, RIM_Y - 60, 6, 76);
    ctx.fillStyle = "rgba(255,80,60,0.9)";
    ctx.fillRect(boardX - 2, RIM_Y - 22, 4, 22);

    // Rim.
    ctx.strokeStyle = "#ff5a3c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rimX, RIM_Y);
    ctx.lineTo(rimX + dir * 34, RIM_Y);
    ctx.stroke();

    // Net.
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const nx = rimX + (dir * 34 * i) / 5;
      ctx.beginPath();
      ctx.moveTo(nx, RIM_Y);
      ctx.lineTo(rimX + dir * 17, RIM_Y + 26);
      ctx.stroke();
    }
  }

  private drawFireAura(p: ArcadePlayer): void {
    const ctx = this.ctx;
    const h = playerHeight(p);
    const cx = p.x;
    const cy = p.y - h * 0.5;
    const g = ctx.createRadialGradient(cx, cy, 6, cx, cy, h * 0.9);
    g.addColorStop(0, "rgba(255,180,40,0.55)");
    g.addColorStop(0.5, "rgba(255,90,20,0.35)");
    g.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, h * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- the swappable per-player draw seam ----
  private renderPlayer(p: ArcadePlayer): void {
    const ctx = this.ctx;
    const w = playerWidth(p);
    const h = playerHeight(p);
    const bodyH = h * 0.58;
    const headR = w * 0.5;
    const feetY = p.y;
    const bodyTop = feetY - bodyH;
    const headCy = bodyTop - headR * 0.6;

    // Squash/stretch from vertical velocity for a bit of juice.
    const stretch = 1 + Math.max(-0.15, Math.min(0.2, -p.vy / 4000));
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, stretch);
    ctx.translate(-p.x, -feetY);

    // Shadow.
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(p.x, feetY + 2, w * 0.55, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs.
    ctx.fillStyle = p.character.secondaryColor;
    roundRect(ctx, p.x - w * 0.4, feetY - h * 0.28, w * 0.8, h * 0.28, 4);
    ctx.fill();

    // Torso (jersey).
    ctx.fillStyle = p.character.primaryColor;
    roundRect(ctx, p.x - w * 0.5, bodyTop, w, bodyH, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arm — raised when shooting/dunking.
    const raising = p.state === "jump" || p.state === "dunk" || p.state === "shove" || p.state === "steal";
    ctx.fillStyle = p.character.primaryColor;
    const armX = p.x + p.facing * w * 0.42;
    if (raising) {
      roundRect(ctx, armX - 4, headCy - headR - h * 0.14, 8, h * 0.2, 4);
    } else {
      roundRect(ctx, armX - 4, bodyTop + 4, 8, bodyH * 0.6, 4);
    }
    ctx.fill();

    // Head badge: circular portrait clip, or colored circle with initial.
    const img = this.getImage(p.character.imageUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, headCy, headR, 0, Math.PI * 2);
    ctx.closePath();
    if (img) {
      ctx.clip();
      const size = headR * 2;
      ctx.drawImage(img, p.x - headR, headCy - headR, size, size);
      ctx.restore();
      ctx.strokeStyle = p.character.secondaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, headCy, headR, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#e7c9a0";
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#1f2937";
      ctx.font = `bold ${Math.round(headR)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.character.name.slice(0, 1), p.x, headCy);
    }

    // Rarity glow ring for legends.
    if (p.character.rarity === "LEGEND") {
      ctx.strokeStyle = "rgba(255,215,0,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, headCy, headR + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawBall(world: World): void {
    const ctx = this.ctx;
    const b = world.ball;
    const r = 9;
    ctx.save();
    ctx.fillStyle = "#e8863b";
    ctx.strokeStyle = "#7a3d10";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Seam.
    ctx.beginPath();
    ctx.moveTo(b.x - r, b.y);
    ctx.lineTo(b.x + r, b.y);
    ctx.moveTo(b.x, b.y - r);
    ctx.lineTo(b.x, b.y + r);
    ctx.stroke();
    ctx.restore();
  }
}

export const ARCADE_DIMENSIONS = { width: COURT_WIDTH, height: COURT_HEIGHT };
