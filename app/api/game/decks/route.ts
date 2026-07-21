import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbRun } from "@/lib/db";
import { loadDecksForUser, validateAndFetchSlots } from "@/lib/deckQueries";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const decks = await loadDecksForUser(session.userId);
  return NextResponse.json({ decks });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "내 덱";
  const slotsInput = Array.isArray(body?.slots) ? body.slots : [];

  const result = await validateAndFetchSlots(session.userId, slotsInput);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  if (!result.validation.valid) {
    return NextResponse.json({ error: result.validation.errors.join(" ") }, { status: 400 });
  }

  const deck = await dbRun("INSERT INTO decks (user_id, name) VALUES (?, ?)", [session.userId, name]);
  for (const slot of result.resolvedSlots) {
    await dbRun("INSERT INTO deck_slots (deck_id, position, user_card_id) VALUES (?, ?, ?)", [
      deck.lastInsertRowid,
      slot.position,
      slot.userCardId,
    ]);
  }

  return NextResponse.json({ deckId: deck.lastInsertRowid });
}
