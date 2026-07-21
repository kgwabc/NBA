"use client";

import { useState } from "react";
import AdminGamePanel from "@/app/components/AdminGamePanel";

export default function AdminGameButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className="flex h-9 items-center justify-center rounded-full border border-solid border-black/[.08] px-3 text-xs transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-10 sm:px-5 sm:text-sm"
      >
        게임 관리
      </button>
      {isPanelOpen && <AdminGamePanel onClose={() => setIsPanelOpen(false)} />}
    </>
  );
}
