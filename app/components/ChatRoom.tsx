"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};

type ChatEvent =
  | { type: "message"; message: Message }
  | { type: "delete"; id: number }
  | { type: "clear" };

export default function ChatRoom({
  onClose,
  username,
  isAdmin,
}: {
  onClose: () => void;
  username?: string;
  isAdmin?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/chat/messages")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      });

    const eventSource = new EventSource("/api/chat/stream");
    eventSource.onmessage = (event) => {
      const chatEvent: ChatEvent = JSON.parse(event.data);
      if (chatEvent.type === "message") {
        setMessages((prev) => [...prev, chatEvent.message]);
      } else if (chatEvent.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== chatEvent.id));
      } else {
        setMessages([]);
      }
    };

    return () => {
      cancelled = true;
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "메시지를 보내지 못했습니다.");
        return;
      }
      setInput("");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("이 메시지를 삭제할까요?")) return;
    await fetch("/api/chat/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleDeleteAll() {
    if (!confirm("모든 메시지를 삭제할까요? 되돌릴 수 없습니다.")) return;
    await fetch("/api/chat/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex h-[32rem] w-full max-w-md flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-black/[.08] px-4 py-3 dark:border-white/[.145]">
          <h2 className="text-sm font-semibold text-black dark:text-zinc-50">실시간 채팅</h2>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={handleDeleteAll}
                className="text-xs text-red-600 hover:underline dark:text-red-400"
              >
                전체 삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              아직 메시지가 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((message) => {
                const isMine = message.username === username;
                return (
                  <div
                    key={message.id}
                    className="flex flex-col"
                    style={{ alignItems: isMine ? "flex-end" : "flex-start" }}
                  >
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {message.username}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(message.id)}
                          aria-label="메시지 삭제"
                          className="text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          ✕
                        </button>
                      )}
                      <p
                        className="px-3 py-2 text-sm text-black"
                        style={{
                          maxWidth: "20rem",
                          borderRadius: "1rem",
                          backgroundColor: isMine ? "#fde047" : "#e5e7eb",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-black/[.08] px-4 py-3 dark:border-white/[.145]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요"
            maxLength={500}
            className="h-10 flex-1 rounded-full border border-black/[.08] bg-white px-4 text-sm text-black outline-none focus:border-black/40 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-10 rounded-full bg-foreground px-4 text-sm text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            전송
          </button>
        </form>
        {error && <p className="px-4 pb-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}
