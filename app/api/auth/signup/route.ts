import { NextRequest, NextResponse } from "next/server";
import { db, User } from "@/lib/db";
import { createSessionToken, hashPassword, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: "올바른 아이디를 입력해주세요(영문/숫자/밑줄 4~20자)." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const result = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);

  const user: Pick<User, "id" | "username"> = { id: Number(result.lastInsertRowid), username };
  const token = await createSessionToken({ userId: user.id, username: user.username });

  const response = NextResponse.json({ username: user.username });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
