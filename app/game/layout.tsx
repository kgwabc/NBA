import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/game", label: "홈" },
  { href: "/game/collection", label: "컬렉션" },
  { href: "/game/deck", label: "덱 빌더" },
  { href: "/game/battle", label: "배틀" },
];

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex w-full flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/" className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50">
            ← 홈
          </Link>
          <h1 className="text-lg font-semibold text-black dark:text-zinc-50 sm:text-xl">🎴 카드 가챠</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-black/[.08] px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-black/40 dark:border-white/[.145] dark:text-zinc-400 sm:px-4 sm:py-2 sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center gap-8 px-4 py-8">{children}</main>
    </div>
  );
}
