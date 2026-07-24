import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, verifySessionToken, isAdmin } from "@/lib/auth";
import LogoutButton from "@/app/components/LogoutButton";
import ChatButton from "@/app/components/ChatButton";
import AdminButton from "@/app/components/AdminButton";
import AdminGameButton from "@/app/components/AdminGameButton";
import TeamGrid from "@/app/components/TeamGrid";
import TeamSwitcher from "@/app/components/TeamSwitcher";
import { nbaTeams } from "@/lib/nbaTeams";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const userIsAdmin = session ? isAdmin(session.username) : false;

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="flex w-full flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50 sm:text-xl">
          🏀 NBA NIGHT NIGHT
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/history"
            className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-orange-500 sm:px-4 sm:py-2 sm:text-sm"
          >
            NBA HISTORY
          </Link>
          <Link
            href="/game"
            className="rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-purple-500 sm:px-4 sm:py-2 sm:text-sm"
          >
            🎴 카드 게임
          </Link>
          <ChatButton
            isLoggedIn={!!session}
            username={session?.username}
            isAdmin={userIsAdmin}
          />
          {userIsAdmin && <AdminButton />}
          {userIsAdmin && <AdminGameButton />}

          {session ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
                <span className="font-medium text-black dark:text-zinc-50">{session.username}</span>님
              </p>
              <TeamSwitcher />
              <LogoutButton />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm">
              <Link href="/login" className="text-black dark:text-zinc-50">
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-3 py-1.5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:px-4 sm:py-2"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-8 px-4 py-12">
        <TeamGrid teams={nbaTeams} />
      </main>
    </div>
  );
}
