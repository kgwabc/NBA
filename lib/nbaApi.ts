const BALLDONTLIE_BASE_URL = "https://api.balldontlie.io/v1";

function getAuthHeaders() {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) {
    throw new Error("BALLDONTLIE_API_KEY environment variable is not set");
  }
  return { Authorization: apiKey };
}

type BalldontlieTeam = {
  id: number;
  abbreviation: string;
};

type BalldontlieTeamsResponse = {
  data: BalldontlieTeam[];
};

type BalldontliePlayer = {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: string | null;
  height: string | null;
  weight: string | null;
};

type BalldontliePlayersResponse = {
  data: BalldontliePlayer[];
  meta: { next_cursor: number | null };
};

const MAX_PLAYER_PAGES = 2;

export class NbaApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type NbaPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber: string | null;
  height: string | null;
  weight: string | null;
  photoUrl: string | null;
};

type EspnSearchResult = {
  sport?: string;
  description?: string;
  image?: { default?: string };
};

type EspnSearchResponse = {
  results?: { type: string; contents: EspnSearchResult[] }[];
};

// balldontlie doesn't return player photos, and its player ids don't map to
// stats.nba.com person ids used by cdn.nba.com headshots. ESPN's (unofficial,
// undocumented) player search returns a headshot URL directly per name match,
// so we look photos up by name instead. Best-effort: returns null on any
// failure or no confident NBA match rather than throwing.
async function getEspnHeadshotUrl(fullName: string): Promise<string | null> {
  try {
    const url = new URL("https://site.web.api.espn.com/apis/search/v2");
    url.searchParams.set("query", fullName);
    url.searchParams.set("type", "player");

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const { results } = (await res.json()) as EspnSearchResponse;
    const players = results?.find((r) => r.type === "player")?.contents ?? [];
    const match = players.find(
      (p) => p.sport === "basketball" && p.description?.toUpperCase().includes("NBA"),
    );
    return match?.image?.default ?? null;
  } catch {
    return null;
  }
}

async function getBalldontlieTeamId(abbreviation: string): Promise<number> {
  const res = await fetch(`${BALLDONTLIE_BASE_URL}/teams`, {
    headers: getAuthHeaders(),
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new NbaApiError(`Failed to fetch teams: ${res.status}`, res.status);
  }

  const { data } = (await res.json()) as BalldontlieTeamsResponse;
  const team = data.find((t) => t.abbreviation === abbreviation);
  if (!team) {
    throw new Error(`No balldontlie team found for abbreviation ${abbreviation}`);
  }
  return team.id;
}

function mapPlayer(player: BalldontliePlayer): NbaPlayer {
  return {
    id: player.id,
    firstName: player.first_name,
    lastName: player.last_name,
    position: player.position,
    jerseyNumber: player.jersey_number,
    height: player.height,
    weight: player.weight,
    photoUrl: null,
  };
}

async function attachPhotos(players: NbaPlayer[]): Promise<NbaPlayer[]> {
  const photoUrls = await Promise.all(
    players.map((p) => getEspnHeadshotUrl(`${p.firstName} ${p.lastName}`)),
  );
  return players.map((p, i) => ({ ...p, photoUrl: photoUrls[i] }));
}

function sortByJerseyNumber(players: NbaPlayer[]): NbaPlayer[] {
  return [...players].sort((a, b) => {
    const aNum = a.jerseyNumber ? Number(a.jerseyNumber) : NaN;
    const bNum = b.jerseyNumber ? Number(b.jerseyNumber) : NaN;
    const aValid = Number.isFinite(aNum);
    const bValid = Number.isFinite(bNum);

    if (aValid && bValid) return aNum - bNum;
    if (aValid) return -1;
    if (bValid) return 1;
    return 0;
  });
}

export async function getPlayersByAbbreviation(abbreviation: string): Promise<NbaPlayer[]> {
  const teamId = await getBalldontlieTeamId(abbreviation);

  const players: NbaPlayer[] = [];
  let cursor: number | null = null;

  for (let page = 0; page < MAX_PLAYER_PAGES; page++) {
    const url = new URL(`${BALLDONTLIE_BASE_URL}/players`);
    url.searchParams.set("team_ids[]", String(teamId));
    url.searchParams.set("per_page", "100");
    if (cursor !== null) {
      url.searchParams.set("cursor", String(cursor));
    }

    const res = await fetch(url, {
      headers: getAuthHeaders(),
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new NbaApiError(`Failed to fetch players: ${res.status}`, res.status);
    }

    const { data, meta } = (await res.json()) as BalldontliePlayersResponse;
    players.push(...data.map(mapPlayer));

    if (!meta.next_cursor) {
      break;
    }
    cursor = meta.next_cursor;
  }

  return attachPhotos(sortByJerseyNumber(players));
}
