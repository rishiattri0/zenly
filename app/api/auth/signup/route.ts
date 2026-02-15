import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/db/auth";
import { setSessionCookie } from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body as { email?: string; name?: string; password?: string };
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const displayName = (typeof name === "string" && name.trim()) ? name.trim() : email.split("@")[0] || "User";
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const user = await createUser(email, displayName, password);
    if (!user) {
      return NextResponse.json({ error: "Database unavailable or email already registered" }, { status: 500 });
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
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
