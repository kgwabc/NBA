"use client";

import { useState } from "react";
import AdminPanel from "@/app/components/AdminPanel";

export default function AdminButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        관리자
      </button>
      {isPanelOpen && <AdminPanel onClose={() => setIsPanelOpen(false)} />}
    </>
  );
}
