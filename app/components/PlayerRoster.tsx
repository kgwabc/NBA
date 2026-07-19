"use client";

import { useEffect, useState } from "react";

type Player = {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber: string | null;
  height: string | null;
  weight: string | null;
};

type PlayersResponse = {
  players: Player[];
  error?: string;
};

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
      <p className="text-sm font-medium text-black dark:text-zinc-50">
        {player.jerseyNumber ? (
          <span className="mr-1.5 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            #{player.jerseyNumber}
          </span>
        ) : null}
        {player.firstName} {player.lastName}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{player.position || "포지션 미상"}</p>
      {(player.height || player.weight) && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {player.height ? `${player.height}` : ""}
          {player.height && player.weight ? " · " : ""}
          {player.weight ? `${player.weight}lbs` : ""}
        </p>
      )}
    </div>
  );
}

export default function PlayerRoster({ slug }: { slug: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading/error state for the new slug before the fetch below resolves
    setLoading(true);
    setError(null);

    fetch(`/api/teams/${slug}/players`, { signal: controller.signal })
      .then(async (res) => {
        const data: PlayersResponse = await res.json();
        if (!res.ok) {
          setError(data.error ?? "선수 정보를 불러오지 못했습니다.");
          setPlayers([]);
          return;
        }
        setPlayers(data.players);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("선수 정보를 불러오지 못했습니다.");
          setPlayers([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return <p className="text-zinc-500 dark:text-zinc-400">선수 정보를 불러오는 중...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  if (players.length === 0) {
    return <p className="text-zinc-500 dark:text-zinc-400">선수 정보가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
