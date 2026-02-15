export interface ChatSession {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export async function getAllChatSessions(): Promise<ChatSession[]> {
  try {
    const res = await fetch("/api/chat/sessions", { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
