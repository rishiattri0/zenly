import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getChatSessionsByUser, createChatSession } from "@/lib/db/chat";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await getChatSessionsByUser(user.id);
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title : "Chat";
    const result = await createChatSession(user.id, title);
    if (!result) {
      return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
    }
    return NextResponse.json({ id: result.id, title });
  } catch (e) {
    console.error("Chat session POST error:", e);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
