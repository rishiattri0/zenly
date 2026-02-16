import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { deleteChatSession } from "@/lib/db/chat";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureSessionBelongsToUser(sessionId: string, userId: string): Promise<boolean> {
  if (!sql) return false;
  const result = (await sql`
    SELECT id FROM public.zenly_chat_sessions WHERE id = ${sessionId} AND user_id = ${userId} LIMIT 1
  `) as unknown as Array<Record<string, unknown>>;
  return Array.isArray(result) && result.length > 0;
}

export async function DELETE(
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

  const deleted = await deleteChatSession(sessionId);
  if (!deleted) {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
