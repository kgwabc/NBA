"use client";

import { useTeamTheme } from "@/app/components/TeamThemeProvider";

export default function TeamBackground() {
  const { team } = useTeamTheme();
  if (!team) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 20%, ${team.primaryColor}22 0%, transparent 45%),
          radial-gradient(circle at 85% 80%, ${team.secondaryColor}22 0%, transparent 45%),
          repeating-linear-gradient(135deg, ${team.primaryColor}0d 0px, ${team.primaryColor}0d 2px, transparent 2px, transparent 28px)
        `,
      }}
    />
  );
}
