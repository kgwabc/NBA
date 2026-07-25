import ArcadeApp from "./ArcadeApp";

// Auth is enforced by app/game/layout.tsx (redirects to /login if no session).
// The owned-card roster is fetched client-side in RosterPicker, matching the
// /api/game/collection pattern used across the game section.
export default function ArcadePage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">🏀 아케이드 2대2</h2>
      <ArcadeApp />
    </>
  );
}
