"use client";

import { useTeamTheme } from "@/app/components/TeamThemeProvider";

export default function TeamBackground() {
  const { team } = useTeamTheme();
  if (!team) return null;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${team.primaryColor}40 0%, ${team.secondaryColor}22 55%, transparent 85%)`,
        }}
      />
      <span
        className="absolute -bottom-[6vw] -right-[4vw] select-none text-[32vw] font-black leading-none"
        style={{ color: `${team.secondaryColor}1a` }}
      >
        {team.abbreviation}
      </span>
    </div>
  );
}
