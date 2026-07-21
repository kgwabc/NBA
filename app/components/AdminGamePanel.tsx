"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/db";

type UserRow = { id: number; username: string; balance: number };
type OwnedCard = Card & { owned_count: number };

export default function AdminGamePanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deltaInputs, setDeltaInputs] = useState<Record<number, string>>({});

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [catalog, setCatalog] = useState<Card[]>([]);
  const [grantCardId, setGrantCardId] = useState<string>("");

  function loadUsers() {
    setLoading(true);
    setError(null);
    fetch("/api/admin/game/users")
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

  function loadCatalog() {
    fetch("/api/admin/game/catalog")
      .then((res) => res.json())
      .then((data) => setCatalog(data.cards ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load on mount
    loadUsers();
    loadCatalog();
  }, []);

  function loadOwnedCards(userId: number) {
    fetch(`/api/admin/game/cards?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setOwnedCards(data.cards ?? []));
  }

  function handleSelectUser(userId: number) {
    setSelectedUserId(userId);
    loadOwnedCards(userId);
  }

  async function handleApplyDelta(userId: number) {
    const raw = deltaInputs[userId];
    const delta = Number(raw);
    if (!raw || !Number.isFinite(delta) || delta === 0) return;
    const res = await fetch("/api/admin/game/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, delta }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "재화 수정에 실패했습니다.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, balance: data.balance } : u)));
    setDeltaInputs((prev) => ({ ...prev, [userId]: "" }));
  }

  async function handleGrant() {
    if (!selectedUserId || !grantCardId) return;
    const res = await fetch("/api/admin/game/cards/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId, cardId: Number(grantCardId) }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "지급에 실패했습니다.");
      return;
    }
    loadOwnedCards(selectedUserId);
  }

  async function handleRevoke(cardId: number) {
    if (!selectedUserId) return;
    const res = await fetch("/api/admin/game/cards/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId, cardId }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "회수에 실패했습니다.");
      return;
    }
    loadOwnedCards(selectedUserId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex h-[36rem] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-black/[.08] px-4 py-3 dark:border-white/[.145]">
          <h2 className="text-sm font-semibold text-black dark:text-zinc-50">게임 데이터 관리</h2>
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            닫기
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 overflow-y-auto border-r border-black/[.08] px-4 py-3 dark:border-white/[.145]">
            {loading && <p className="text-sm text-zinc-500 dark:text-zinc-400">불러오는 중...</p>}
            {!loading && error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {!loading && !error && (
              <div className="flex flex-col gap-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className={`flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2 ${
                      selectedUserId === user.id
                        ? "border-orange-500"
                        : "border-black/[.08] dark:border-white/[.145]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black dark:text-zinc-50">{user.username}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">재화 {user.balance}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        placeholder="+100 / -50"
                        value={deltaInputs[user.id] ?? ""}
                        onChange={(e) => setDeltaInputs((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        className="h-8 w-28 rounded-full border border-black/[.08] bg-white px-3 text-xs text-black outline-none dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
                      />
                      <button
                        onClick={() => handleApplyDelta(user.id)}
                        className="rounded-full border border-black/[.08] px-3 py-1 text-xs text-zinc-600 hover:border-black/40 dark:border-white/[.145] dark:text-zinc-400"
                      >
                        적용
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-1/2 flex-col gap-3 overflow-y-auto px-4 py-3">
            {!selectedUserId ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">왼쪽에서 유저를 선택하세요.</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <select
                    value={grantCardId}
                    onChange={(e) => setGrantCardId(e.target.value)}
                    className="h-9 flex-1 rounded-full border border-black/[.08] bg-white px-3 text-xs text-black outline-none dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
                  >
                    <option value="">카드 선택...</option>
                    {catalog.map((card) => (
                      <option key={card.id} value={card.id}>
                        [{card.rarity}] {card.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGrant}
                    disabled={!grantCardId}
                    className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    지급
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {ownedCards.length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">보유한 카드가 없습니다.</p>
                  )}
                  {ownedCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
                    >
                      <span className="text-xs text-black dark:text-zinc-50">
                        [{card.rarity}] {card.name} × {card.owned_count}
                      </span>
                      <button
                        onClick={() => handleRevoke(card.id)}
                        className="rounded-full border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        1장 회수
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
