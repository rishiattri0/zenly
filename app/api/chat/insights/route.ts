import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { sql } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Basic fallback for development without a database
  if (!sql) {
    return NextResponse.json({
      totalSessions: 0,
      totalMessages: 0,
      lastActivityAt: null,
      avgMessagesPerSession: 0,
    });
  }

  try {
    const [{ count: totalSessionsStr }] = (await sql`
      SELECT COUNT(*)::int AS count
      FROM public.zenly_chat_sessions s
      WHERE s.user_id = ${user.id}
    `) as unknown as Array<{ count: number }>;

    const [{ count: totalMessagesStr }] = (await sql`
      SELECT COUNT(m.*)::int AS count
      FROM public.zenly_chat_messages m
      JOIN public.zenly_chat_sessions s ON s.id = m.chat_session_id
      WHERE s.user_id = ${user.id}
    `) as unknown as Array<{ count: number }>;

    // Last activity from sessions.updated_at or messages.created_at
    const [{ last_session_update }] = (await sql`
      SELECT COALESCE(MAX(s.updated_at), 'epoch'::timestamptz) AS last_session_update
      FROM public.zenly_chat_sessions s
      WHERE s.user_id = ${user.id}
    `) as unknown as Array<{ last_session_update: string }>;

    const [{ last_message_time }] = (await sql`
      SELECT COALESCE(MAX(m.created_at), 'epoch'::timestamptz) AS last_message_time
      FROM public.zenly_chat_messages m
      JOIN public.zenly_chat_sessions s ON s.id = m.chat_session_id
      WHERE s.user_id = ${user.id}
    `) as unknown as Array<{ last_message_time: string }>;

    const lastActivityAt = new Date(
      Math.max(new Date(last_session_update).getTime(), new Date(last_message_time).getTime())
    );

    // Average messages per session
    const [{ avg }] = (await sql`
      SELECT COALESCE(AVG(cnt), 0) AS avg
      FROM (
        SELECT COUNT(m.*)::float AS cnt
        FROM public.zenly_chat_sessions s
        LEFT JOIN public.zenly_chat_messages m ON m.chat_session_id = s.id
        WHERE s.user_id = ${user.id}
        GROUP BY s.id
      ) t
    `) as unknown as Array<{ avg: number }>;

    return NextResponse.json({
      totalSessions: Number(totalSessionsStr) || 0,
      totalMessages: Number(totalMessagesStr) || 0,
      lastActivityAt: isNaN(lastActivityAt.getTime()) ? null : lastActivityAt.toISOString(),
      avgMessagesPerSession: Number(avg) || 0,
    });
  } catch (e) {
    console.error("Chat insights error:", e);
    return NextResponse.json({ error: "Failed to compute chat insights" }, { status: 500 });
  }
}