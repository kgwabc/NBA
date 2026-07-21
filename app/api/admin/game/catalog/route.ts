import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbAll, type Card } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const cards = await dbAll<Card>("SELECT * FROM cards ORDER BY rarity DESC, name ASC");
  return NextResponse.json({ cards });
}
