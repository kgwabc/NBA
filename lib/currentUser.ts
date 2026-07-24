import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { getUserById, type User } from "@/lib/db";
import { getTeamBySlug, type NbaTeam } from "@/lib/nbaTeams";

export async function getCurrentUserWithTeam(): Promise<{
  session: SessionPayload | null;
  user: User | undefined;
  team: NbaTeam | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { session: null, user: undefined, team: null };
  }

  const user = await getUserById(session.userId);
  const team = user?.favorite_team_slug ? getTeamBySlug(user.favorite_team_slug) ?? null : null;
  return { session, user, team };
}
