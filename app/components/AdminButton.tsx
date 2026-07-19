"use client";

import { useState } from "react";
import AdminPanel from "@/app/components/AdminPanel";

export default function AdminButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className="flex h-9 items-center justify-center rounded-full border border-solid border-black/[.08] px-3 text-xs transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-10 sm:px-5 sm:text-sm"
      >
        관리자
      </button>
      {isPanelOpen && <AdminPanel onClose={() => setIsPanelOpen(false)} />}
    </>
  );
}
