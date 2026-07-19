"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm text-zinc-600 dark:text-zinc-400">
              아이디 (영문/숫자/밑줄 4~20자)
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              pattern="[a-zA-Z0-9_]{4,20}"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 rounded-md border border-black/[.08] bg-white px-3 text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-zinc-600 dark:text-zinc-400">
              비밀번호 (8자 이상)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-md border border-black/[.08] bg-white px-3 text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm text-zinc-600 dark:text-zinc-400">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-md border border-black/[.08] bg-white px-3 text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-black dark:text-zinc-50">
            로그인
          </Link>
        </p>
      </main>
    </div>
  );
}
