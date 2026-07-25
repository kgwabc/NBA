// Keyboard input manager for local play. One pair of window listeners feeds two keymaps
// (P1 arrows + "/", P2 WASD + "S"). Left/right are level-triggered (held); jump/action are
// edge-triggered — true only on the poll following the key going down, so a held key won't
// re-fire a dunk/steal every frame.

import type { InputState } from "./types";

type Which = "p1" | "p2";

const KEYMAP: Record<Which, { left: string; right: string; jump: string; action: string }> = {
  p1: { left: "arrowleft", right: "arrowright", jump: "arrowup", action: "/" },
  p2: { left: "a", right: "d", jump: "w", action: "s" },
};

const PREVENT_DEFAULT = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "/", " "]);

function norm(e: KeyboardEvent): string {
  const k = e.key;
  return k.length === 1 ? k.toLowerCase() : k.toLowerCase();
}

export class InputManager {
  private held = new Set<string>();
  private edges = new Set<string>(); // keys that went down since their last poll-consume
  private attached = false;

  private onKeyDown = (e: KeyboardEvent) => {
    const k = norm(e);
    if (PREVENT_DEFAULT.has(k)) e.preventDefault();
    if (!this.held.has(k)) this.edges.add(k); // register a fresh press edge
    this.held.add(k);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.held.delete(norm(e));
  };

  // Losing window focus can drop keyup events, leaving keys "stuck". Clear on blur.
  private onBlur = () => {
    this.held.clear();
    this.edges.clear();
  };

  attach(): void {
    if (this.attached || typeof window === "undefined") return;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.held.clear();
    this.edges.clear();
    this.attached = false;
  }

  // Read a player's input for this tick. Consumes the jump/action edges for that player's keys.
  poll(which: Which): InputState {
    const map = KEYMAP[which];
    const jump = this.consumeEdge(map.jump);
    const action = this.consumeEdge(map.action);
    return {
      left: this.held.has(map.left),
      right: this.held.has(map.right),
      jump,
      action,
    };
  }

  private consumeEdge(key: string): boolean {
    if (this.edges.has(key)) {
      this.edges.delete(key);
      return true;
    }
    return false;
  }
}
