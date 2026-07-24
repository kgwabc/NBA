"use client";

import { useState } from "react";
import TeamPicker from "@/app/components/TeamPicker";
import { useTeamTheme } from "@/app/components/TeamThemeProvider";
import type { NbaTeam } from "@/lib/nbaTeams";

export default function TeamSwitcher() {
  const { team, setTeam } = useTeamTheme();
  const [open, setOpen] = useState(false);

  if (!team) return null;

  async function handlePick(picked: NbaTeam) {
    await setTeam(picked);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-black/[.08] px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-black/40 dark:border-white/[.145] dark:text-zinc-400 dark:hover:border-white/40 sm:text-sm"
      >
        구단 변경
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              선호 구단 변경
            </h2>
            <TeamPicker variant="compact" onPick={handlePick} selectedSlug={team.slug} />
          </div>
        </div>
      )}
    </>
  );
}
