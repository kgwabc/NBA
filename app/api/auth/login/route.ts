import { NextRequest, NextResponse } from "next/server";
import { db, User } from "@/lib/db";
import { createSessionToken, verifyPassword, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const invalidCredentials = () =>
    NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });

  if (!username || !password) {
    return invalidCredentials();
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
  if (!user) {
    return invalidCredentials();
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return invalidCredentials();
  }

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
