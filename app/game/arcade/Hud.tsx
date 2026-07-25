"use client";

// Score bug / clock / on-fire banner overlay. Reads the engine's low-frequency snapshot
// via useSyncExternalStore so it re-renders only when HUD-relevant state changes — never
// per animation frame.

import { useSyncExternalStore } from "react";
import type { ArcadeEngine } from "@/lib/arcade/gameState";
import type { MatchMode } from "@/lib/arcade/types";

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export default function Hud({ engine, mode }: { engine: ArcadeEngine; mode: MatchMode }) {
  const snap = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* Score bar */}
      <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/70 px-4 py-1.5 text-white shadow-lg">
        <div className="flex items-center gap-1.5">
          {snap.onFireHome && <span className="text-sm">🔥</span>}
          <span className="max-w-[110px] truncate text-[11px] text-blue-300">{snap.homeName}</span>
          <span className="text-lg font-bold tabular-nums">{snap.scoreHome}</span>
        </div>
        <div className="flex flex-col items-center px-1">
          <span className="text-[10px] text-zinc-400">
            {snap.quarter}/{snap.totalQuarters}Q
          </span>
          <span className="text-sm font-semibold tabular-nums">{formatClock(snap.clockMs)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tabular-nums">{snap.scoreAway}</span>
          <span className="max-w-[110px] truncate text-[11px] text-red-300">{snap.awayName}</span>
          {snap.onFireAway && <span className="text-sm">🔥</span>}
        </div>
      </div>

      {/* Event banner */}
      {snap.lastEvent && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 animate-pulse text-center">
          <span className="rounded-lg bg-orange-500/90 px-4 py-1.5 text-xl font-black text-white shadow-xl">
            {snap.lastEvent}
          </span>
        </div>
      )}

      {/* Controls legend */}
      <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-[10px] leading-tight text-zinc-200">
        <div>P1: ← → 이동 · ↑ 점프 · / 슛·스틸</div>
        {mode === "local_2p" && <div>P2: A D 이동 · W 점프 · S 슛·스틸</div>}
      </div>
    </div>
  );
}
