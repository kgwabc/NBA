import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamBySlug, nbaTeams } from "@/lib/nbaTeams";
import { getFamousPlayers } from "@/lib/famousPlayers";
import PlayerRoster from "@/app/components/PlayerRoster";

export function generateStaticParams() {
  return nbaTeams.map((team) => ({ slug: team.slug }));
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  const famousPlayers = getFamousPlayers(team.slug);

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header
        className="flex flex-col gap-4 px-6 py-10 text-white sm:flex-row sm:items-center sm:gap-6"
        style={{ backgroundColor: team.primaryColor }}
      >
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border-4 text-xl font-extrabold tracking-wide shadow-xl sm:h-28 sm:w-28 sm:text-2xl"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
            borderColor: team.secondaryColor,
            color: "#fff",
            boxShadow: `0 6px 24px ${team.primaryColor}66`,
          }}
        >
          {team.abbreviation}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">{team.name}</h1>
          <p className="text-sm opacity-90">
            {team.conference} 컨퍼런스 · {team.division} 디비전
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 px-6 py-10">
        <Link href="/" className="text-sm font-medium text-black dark:text-zinc-50">
          ← 팀 목록으로
        </Link>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">창단 연도</p>
            <p className="text-base font-medium text-black dark:text-zinc-50">{team.founded}년</p>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">홈구장</p>
            <p className="text-base font-medium text-black dark:text-zinc-50">{team.arena}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">약어</p>
            <p className="text-base font-medium text-black dark:text-zinc-50">{team.abbreviation}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">디비전</p>
            <p className="text-base font-medium text-black dark:text-zinc-50">{team.division}</p>
          </div>
        </div>

        <div className="flex max-w-2xl flex-col gap-2">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">팀 소개</h2>
          <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{team.description}</p>
        </div>

        {famousPlayers.length > 0 && (
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">레전드 선수</h2>
            <div className="flex flex-col gap-3">
              {famousPlayers.map((player) => (
                <div
                  key={player.name}
                  className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
                >
                  <p className="text-sm font-medium text-black dark:text-zinc-50">{player.name}</p>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {player.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">선수단</h2>
          <PlayerRoster slug={team.slug} />
        </div>
      </main>
    </div>
  );
}
