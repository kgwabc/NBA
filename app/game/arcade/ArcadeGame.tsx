"use client";

// Canvas host + fixed-timestep game loop. Owns the ArcadeEngine and InputManager, wires
// human/AI input into the engine each simulation step, and renders every animation frame.
// React never holds per-frame state — only the HUD subscribes to the engine's snapshot store.

import { useEffect, useRef, useState } from "react";
import { ArcadeEngine, IDLE_INPUT } from "@/lib/arcade/gameState";
import { InputManager } from "@/lib/arcade/input";
import { ArcadeRenderer, ARCADE_DIMENSIONS } from "@/lib/arcade/renderer";
import type { MatchConfig } from "@/lib/arcade/types";
import type { MatchResult } from "./ArcadeApp";
import Hud from "./Hud";

const SIM_DT = 1 / 60; // fixed simulation step (seconds)
const MAX_FRAME = 0.25; // clamp huge gaps (tab switch) to avoid a spiral of death

export default function ArcadeGame({
  config,
  onGameOver,
}: {
  config: MatchConfig;
  onGameOver: (result: MatchResult) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine] = useState(() => new ArcadeEngine(config));
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPR-aware sizing so the pixel art stays crisp; renderer draws in logical coords.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = ARCADE_DIMENSIONS.width * dpr;
    canvas.height = ARCADE_DIMENSIONS.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const input = new InputManager();
    input.attach();
    const renderer = new ArcadeRenderer(ctx);

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let finished = false;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_FRAME);
      last = now;
      acc += dt;

      while (acc >= SIM_DT) {
        const p1 = input.poll("p1");
        const p2 = config.mode === "local_2p" ? input.poll("p2") : IDLE_INPUT;
        engine.step(SIM_DT, { p1, p2 });
        acc -= SIM_DT;
        if (engine.isGameOver()) break;
      }

      renderer.draw(engine.world);

      if (engine.isGameOver()) {
        if (!finished) {
          finished = true;
          onGameOverRef.current(engine.getResult());
        }
        return; // stop the loop
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      input.detach();
    };
  }, [engine, config.mode]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-black/15 bg-black dark:border-white/15">
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ aspectRatio: `${ARCADE_DIMENSIONS.width} / ${ARCADE_DIMENSIONS.height}`, imageRendering: "pixelated" }}
      />
      <Hud engine={engine} mode={config.mode} />
    </div>
  );
}
