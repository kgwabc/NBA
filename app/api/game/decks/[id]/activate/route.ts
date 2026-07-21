import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbGet, dbRun, type Deck } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const deckId = Number(id);
  const deck = await dbGet<Deck>("SELECT * FROM decks WHERE id = ?", [deckId]);
  if (!deck || deck.user_id !== session.userId) {
    return NextResponse.json({ error: "덱을 찾을 수 없습니다." }, { status: 404 });
  }

  await dbRun("UPDATE decks SET is_active = 0 WHERE user_id = ?", [session.userId]);
  await dbRun("UPDATE decks SET is_active = 1 WHERE id = ?", [deckId]);

  return NextResponse.json({ success: true });
}
