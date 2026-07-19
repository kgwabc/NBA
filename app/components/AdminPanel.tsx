"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: number;
  username: string;
  created_at: string;
};

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadUsers() {
    setLoading(true);
    setError(null);
    fetch("/api/admin/users")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "목록을 불러오지 못했습니다.");
          return;
        }
        setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load on mount
    loadUsers();
  }, []);

  async function handleDelete(id: number, username: string) {
    if (!confirm(`"${username}" 계정을 삭제할까요?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "삭제하지 못했습니다.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex h-[32rem] w-full max-w-md flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-black/[.08] px-4 py-3 dark:border-white/[.145]">
          <h2 className="text-sm font-semibold text-black dark:text-zinc-50">계정 관리</h2>
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            닫기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && <p className="text-sm text-zinc-500 dark:text-zinc-400">불러오는 중...</p>}
          {!loading && error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {!loading && !error && users.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">가입된 계정이 없습니다.</p>
          )}
          {!loading && !error && users.length > 0 && (
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black dark:text-zinc-50">
                      {user.username}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      가입일: {user.created_at}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(user.id, user.username)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
