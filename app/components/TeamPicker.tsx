"use client";

import { useMemo, useState } from "react";
import type { Conference, NbaTeam } from "@/lib/nbaTeams";
import { nbaTeams } from "@/lib/nbaTeams";

const CONFERENCE_FILTERS: Array<Conference | "전체"> = ["전체", "동부", "서부"];

type TeamPickerProps = {
  variant: "full" | "compact";
  onPick: (team: NbaTeam) => void | Promise<void>;
  onSkip?: () => void;
  selectedSlug?: string | null;
};

export default function TeamPicker({ variant, onPick, onSkip, selectedSlug }: TeamPickerProps) {
  const [conference, setConference] = useState<Conference | "전체">("전체");
  const [picking, setPicking] = useState<string | null>(null);

  const filteredTeams = useMemo(() => {
    if (conference === "전체") return nbaTeams;
    return nbaTeams.filter((team) => team.conference === conference);
  }, [conference]);

  async function handlePick(team: NbaTeam) {
    setPicking(team.slug);
    try {
      await onPick(team);
    } finally {
      setPicking(null);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        {CONFERENCE_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setConference(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              conference === option
                ? "bg-foreground text-background"
                : "border border-black/[.08] text-zinc-600 hover:border-black/40 dark:border-white/[.145] dark:text-zinc-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-3 ${
          variant === "full"
            ? "grid-cols-3 sm:grid-cols-5"
            : "max-h-72 grid-cols-3 overflow-y-auto sm:grid-cols-5"
        }`}
      >
        {filteredTeams.map((team) => (
          <button
            key={team.slug}
            type="button"
            disabled={picking !== null}
            onClick={() => handlePick(team)}
            className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors disabled:opacity-50 ${
              selectedSlug === team.slug
                ? "border-black/60 dark:border-white/60"
                : "border-black/[.08] hover:border-black/40 dark:border-white/[.145] dark:hover:border-white/40"
            }`}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: team.primaryColor }}
            >
              {team.abbreviation}
            </div>
            <p className="text-xs font-medium text-black dark:text-zinc-50">{team.name}</p>
          </button>
        ))}
      </div>

      {variant === "full" && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 text-center text-sm font-medium text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          나중에 선택할게요
        </button>
      )}
    </div>
  );
}
