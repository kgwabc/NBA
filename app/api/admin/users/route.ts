import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, isAdmin, ADMIN_USERNAME } from "@/lib/auth";
import { db, User } from "@/lib/db";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  if (!isAdmin(session.username)) {
    return { error: NextResponse.json({ error: "권한이 없습니다." }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const users = db
    .prepare("SELECT id, username, created_at FROM users ORDER BY id")
    .all() as Pick<User, "id" | "username" | "created_at">[];

  return NextResponse.json({ users });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "number" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  const target = db.prepare("SELECT username FROM users WHERE id = ?").get(id) as
    | Pick<User, "username">
    | undefined;

  if (target && target.username === ADMIN_USERNAME) {
    return NextResponse.json({ error: "관리자 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
