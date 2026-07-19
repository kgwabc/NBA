import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, verifySessionToken, isAdmin } from "@/lib/auth";
import LogoutButton from "@/app/components/LogoutButton";
import ChatButton from "@/app/components/ChatButton";
import AdminButton from "@/app/components/AdminButton";
import TeamGrid from "@/app/components/TeamGrid";
import { nbaTeams } from "@/lib/nbaTeams";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const userIsAdmin = session ? isAdmin(session.username) : false;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex w-full items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">🏀 NBA 팀 소개</h1>

        <div className="flex items-center gap-3">
          <ChatButton
            isLoggedIn={!!session}
            username={session?.username}
            isAdmin={userIsAdmin}
          />
          {userIsAdmin && <AdminButton />}

          {session ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-black dark:text-zinc-50">{session.username}</span>님
              </p>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link href="/login" className="text-black dark:text-zinc-50">
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-4 py-2 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
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
