"use client";

import { useState } from "react";
import TeamPicker from "@/app/components/TeamPicker";
import { useTeamTheme } from "@/app/components/TeamThemeProvider";
import type { NbaTeam } from "@/lib/nbaTeams";

const DISMISS_KEY = "favoriteTeamBannerDismissed";

function readDismissed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DISMISS_KEY) === "1";
}

export default function FavoriteTeamBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { team, setTeam } = useTeamTheme();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [open, setOpen] = useState(false);

  if (!isLoggedIn || team || dismissed) return null;

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handlePick(picked: NbaTeam) {
    await setTeam(picked);
    setOpen(false);
  }

  return (
    <div className="w-full border-b border-black/[.08] bg-white px-4 py-3 dark:border-white/[.145] dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          🏀 선호 구단을 선택하면 사이트 테마가 그 팀의 컬러로 바뀌어요!
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            구단 선택하기
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            나중에
          </button>
        </div>
      </div>

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
              선호 구단 선택
            </h2>
            <TeamPicker variant="compact" onPick={handlePick} />
          </div>
        </div>
      )}
    </div>
  );
}
