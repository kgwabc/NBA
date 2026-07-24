"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { NbaTeam } from "@/lib/nbaTeams";

type TeamThemeContextValue = {
  team: NbaTeam | null;
  setTeam: (team: NbaTeam) => Promise<void>;
};

const TeamThemeContext = createContext<TeamThemeContextValue | null>(null);

export function TeamThemeProvider({
  initialTeam,
  children,
}: {
  initialTeam: NbaTeam | null;
  children: ReactNode;
}) {
  const [team, setTeamState] = useState<NbaTeam | null>(initialTeam);

  const setTeam = useCallback(async (next: NbaTeam) => {
    const previous = team;
    setTeamState(next);
    try {
      const res = await fetch("/api/user/favorite-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamSlug: next.slug }),
      });
      if (!res.ok) {
        setTeamState(previous);
      }
    } catch {
      setTeamState(previous);
    }
  }, [team]);

  return (
    <TeamThemeContext.Provider value={{ team, setTeam }}>
      <div
        className="contents"
        style={
          {
            "--team-primary": team?.primaryColor ?? "var(--foreground)",
            "--team-secondary": team?.secondaryColor ?? "var(--background)",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </TeamThemeContext.Provider>
  );
}

export function useTeamTheme() {
  const ctx = useContext(TeamThemeContext);
  if (!ctx) {
    throw new Error("useTeamTheme must be used within TeamThemeProvider");
  }
  return ctx;
}
