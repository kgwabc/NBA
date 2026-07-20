import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, isAdmin } from "@/lib/auth";
import { dbAll, dbGet, dbRun, ChatMessage } from "@/lib/db";
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

  const messages = await dbAll<ChatMessage>(
    "SELECT id, username, content, created_at FROM messages ORDER BY id DESC LIMIT ?",
    [HISTORY_LIMIT],
  );

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

  const result = await dbRun("INSERT INTO messages (username, content) VALUES (?, ?)", [
    session.username,
    content,
  ]);

  const message = (await dbGet<ChatMessage>(
    "SELECT id, username, content, created_at FROM messages WHERE id = ?",
    [result.lastInsertRowid],
  )) as ChatMessage;

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
    await dbRun("DELETE FROM messages");
    publish({ type: "clear" });
    return NextResponse.json({ success: true });
  }

  const id = typeof body?.id === "number" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  await dbRun("DELETE FROM messages WHERE id = ?", [id]);
  publish({ type: "delete", id });

  return NextResponse.json({ success: true });
}
