"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex h-9 items-center justify-center rounded-full border border-solid border-black/[.08] px-3 text-xs transition-colors hover:border-transparent hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-10 sm:px-5 sm:text-sm"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
