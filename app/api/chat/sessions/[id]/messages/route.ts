import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getChatMessages, addChatMessage, updateChatSessionUpdatedAt } from "@/lib/db/chat";
import { sql } from "@/lib/db";

async function ensureSessionBelongsToUser(sessionId: string, userId: string): Promise<boolean> {
  if (!sql) return false;
  const rows = await sql`
    SELECT id FROM public.zenly_chat_sessions WHERE id = ${sessionId} AND user_id = ${userId} LIMIT 1
  `;
  return rows.length > 0;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: sessionId } = await params;
  const ok = await ensureSessionBelongsToUser(sessionId, user.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const messages = await getChatMessages(sessionId);
  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: sessionId } = await params;
  const ok = await ensureSessionBelongsToUser(sessionId, user.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = await request.json();
    const { role, content } = body as { role?: string; content?: string };
    if (role !== "user" && role !== "assistant") {
      return NextResponse.json({ error: "role must be 'user' or 'assistant'" }, { status: 400 });
    }
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }
    const result = await addChatMessage(sessionId, role, content.trim());
    if (!result) {
      return NextResponse.json({ error: "Failed to add message" }, { status: 500 });
    }
    await updateChatSessionUpdatedAt(sessionId);
    return NextResponse.json({ id: result.id });
  } catch (e) {
    console.error("Chat message POST error:", e);
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 });
  }
}
