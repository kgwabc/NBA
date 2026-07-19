"use client";

import { useState } from "react";
import ChatRoom from "@/app/components/ChatRoom";

export default function ChatButton({
  isLoggedIn,
  username,
  isAdmin,
}: {
  isLoggedIn: boolean;
  username?: string;
  isAdmin?: boolean;
}) {
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);

  function handleClick() {
    if (!isLoggedIn) {
      setShowLoginNotice(true);
      return;
    }
    setIsRoomOpen(true);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        실시간 채팅
      </button>
      {showLoginNotice && !isLoggedIn && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">로그인을 해주세요</p>
      )}
      {isRoomOpen && (
        <ChatRoom onClose={() => setIsRoomOpen(false)} username={username} isAdmin={isAdmin} />
      )}
    </div>
  );
}
