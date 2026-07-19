import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, isAdmin } from "@/lib/auth";
import { db, ChatMessage } from "@/lib/db";
import { publish } from "@/lib/chatBroadcast";

const MAX_CONTENT_LENGTH = 500;
const HISTORY_LIMIT = 50;

async function requireSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const messages = db
    .prepare(
      "SELECT id, username, content, created_at FROM messages ORDER BY id DESC LIMIT ?",
    )
    .all(HISTORY_LIMIT) as ChatMessage[];

  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `메시지는 1~${MAX_CONTENT_LENGTH}자여야 합니다.` },
      { status: 400 },
    );
  }

  const result = db
    .prepare("INSERT INTO messages (username, content) VALUES (?, ?)")
    .run(session.username, content);

  const message = db
    .prepare("SELECT id, username, content, created_at FROM messages WHERE id = ?")
    .get(result.lastInsertRowid) as ChatMessage;

  publish({ type: "message", message });

  return NextResponse.json({ message });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdmin(session.username)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (body?.all === true) {
    db.prepare("DELETE FROM messages").run();
    publish({ type: "clear" });
    return NextResponse.json({ success: true });
  }

  const id = typeof body?.id === "number" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  db.prepare("DELETE FROM messages WHERE id = ?").run(id);
  publish({ type: "delete", id });

  return NextResponse.json({ success: true });
}
