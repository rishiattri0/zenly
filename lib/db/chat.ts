import { sql } from "./index";

export interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessageRow {
  id: string;
  chat_session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: Date;
}

export async function getChatSessionsByUser(userId: string): Promise<ChatSessionRow[]> {
  if (!sql) return [];
  const rows = await sql`
    SELECT id, user_id, title, created_at, updated_at
    FROM public.zenly_chat_sessions
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;
  return rows as ChatSessionRow[];
}

export async function createChatSession(userId: string, title = "Chat"): Promise<{ id: string } | null> {
  if (!sql) return null;
  const rows = await sql`
    INSERT INTO public.zenly_chat_sessions (user_id, title)
    VALUES (${userId}, ${title})
    RETURNING id
  `;
  const row = rows[0] as { id: string } | undefined;
  return row ? { id: row.id } : null;
}

export async function getChatMessages(sessionId: string): Promise<ChatMessageRow[]> {
  if (!sql) return [];
  const rows = await sql`
    SELECT id, chat_session_id, role, content, created_at
    FROM public.zenly_chat_messages
    WHERE chat_session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
  return rows as ChatMessageRow[];
}

export async function addChatMessage(
  chatSessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<{ id: string } | null> {
  if (!sql) return null;
  const rows = await sql`
    INSERT INTO public.zenly_chat_messages (chat_session_id, role, content)
    VALUES (${chatSessionId}, ${role}, ${content})
    RETURNING id
  `;
  const row = rows[0] as { id: string } | undefined;
  return row ? { id: row.id } : null;
}

export async function updateChatSessionUpdatedAt(sessionId: string): Promise<void> {
  if (!sql) return;
  await sql`
    UPDATE public.zenly_chat_sessions SET updated_at = now() WHERE id = ${sessionId}
  `;
}
