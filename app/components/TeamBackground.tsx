"use client";

import { useTeamTheme } from "@/app/components/TeamThemeProvider";

export default function TeamBackground() {
  const { team } = useTeamTheme();
  if (!team) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ backgroundColor: `${team.primaryColor}0d` }}
    />
  );
}
