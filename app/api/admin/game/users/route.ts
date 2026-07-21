import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbAll } from "@/lib/db";

export type AdminGameUserRow = {
  id: number;
  username: string;
  balance: number;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const users = await dbAll<AdminGameUserRow>(
    `SELECT u.id, u.username, COALESCE(uc.balance, 0) AS balance
     FROM users u
     LEFT JOIN user_currency uc ON uc.user_id = u.id
     ORDER BY u.id`
  );

  return NextResponse.json({ users });
}
