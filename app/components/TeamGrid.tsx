"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Conference, NbaTeam } from "@/lib/nbaTeams";

type TeamGridProps = {
  teams: NbaTeam[];
};

const CONFERENCE_FILTERS: Array<Conference | "전체"> = ["전체", "동부", "서부"];

export default function TeamGrid({ teams }: TeamGridProps) {
  const [query, setQuery] = useState("");
  const [conference, setConference] = useState<Conference | "전체">("전체");

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return teams.filter((team) => {
      const matchesConference = conference === "전체" || team.conference === conference;
      const matchesQuery =
        !normalizedQuery ||
        team.name.toLowerCase().includes(normalizedQuery) ||
        team.abbreviation.toLowerCase().includes(normalizedQuery);
      return matchesConference && matchesQuery;
    });
  }, [teams, query, conference]);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="팀 이름을 검색해보세요"
          className="h-12 w-full rounded-full border border-black/[.08] bg-white px-5 text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:bg-black dark:text-zinc-50 sm:max-w-xs"
        />

        <div className="flex gap-2">
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
      </div>

      {filteredTeams.length === 0 && (
        <p className="text-center text-zinc-500 dark:text-zinc-400">검색 결과가 없습니다.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filteredTeams.map((team) => (
          <Link
            key={team.slug}
            href={`/teams/${team.slug}`}
            className="flex flex-col gap-3 rounded-lg border border-black/[.08] p-4 transition-colors hover:border-black/40 dark:border-white/[.145] dark:hover:border-white/40"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-base"
              style={{
                background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
                border: `3px solid ${team.secondaryColor}`,
                boxShadow: `0 4px 14px ${team.primaryColor}55`,
              }}
            >
              {team.abbreviation}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-black dark:text-zinc-50">{team.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {team.conference} · {team.division}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
