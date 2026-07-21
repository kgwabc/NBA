import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbGet, dbRun, type Deck } from "@/lib/db";
import { validateAndFetchSlots } from "@/lib/deckQueries";

async function requireOwnedDeck(userId: number, deckId: number) {
  const deck = await dbGet<Deck>("SELECT * FROM decks WHERE id = ?", [deckId]);
  if (!deck || deck.user_id !== userId) return null;
  return deck;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const deckId = Number(id);
  const deck = await requireOwnedDeck(session.userId, deckId);
  if (!deck) return NextResponse.json({ error: "덱을 찾을 수 없습니다." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : deck.name;
  const slotsInput = Array.isArray(body?.slots) ? body.slots : [];

  const result = await validateAndFetchSlots(session.userId, slotsInput);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  if (!result.validation.valid) {
    return NextResponse.json({ error: result.validation.errors.join(" ") }, { status: 400 });
  }

  await dbRun("UPDATE decks SET name = ?, updated_at = datetime('now') WHERE id = ?", [name, deckId]);
  await dbRun("DELETE FROM deck_slots WHERE deck_id = ?", [deckId]);
  for (const slot of result.resolvedSlots) {
    await dbRun("INSERT INTO deck_slots (deck_id, position, user_card_id) VALUES (?, ?, ?)", [
      deckId,
      slot.position,
      slot.userCardId,
    ]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const deckId = Number(id);
  const deck = await requireOwnedDeck(session.userId, deckId);
  if (!deck) return NextResponse.json({ error: "덱을 찾을 수 없습니다." }, { status: 404 });

  await dbRun("DELETE FROM deck_slots WHERE deck_id = ?", [deckId]);
  await dbRun("DELETE FROM decks WHERE id = ?", [deckId]);

  return NextResponse.json({ success: true });
}
