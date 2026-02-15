import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, createSession } from "@/lib/db/auth";
import { setSessionCookie } from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const session = await createSession(user.id);
    if (!session) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
    await setSessionCookie(session.session_token);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
