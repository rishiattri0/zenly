"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Role = "user" | "assistant";
interface ChatSession { id: string; title?: string; created_at?: string; updated_at?: string }
interface ChatMessage { id: string; role: Role; content: string; created_at: string }

function SessionList({
  sessions,
  selectedId,
  onSelect,
  onNew,
}: {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle className="text-base">Your Chats</CardTitle>
        <Button size="sm" onClick={onNew}>New</Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        {sessions.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No chats yet.</div>
        ) : (
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-muted ${selectedId === s.id ? "bg-muted" : ""}`}
                  onClick={() => onSelect(s.id)}
                >
                  <div className="text-sm font-medium truncate">{s.title || "Chat"}</div>
                  {s.updated_at && (
                    <div className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleString()}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="h-[60vh] overflow-auto p-4">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Say hi to start a conversation.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div className={`inline-block px-3 py-2 rounded-md text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.content}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/chat/sessions", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) throw new Error("Please sign in to view your chats.");
        if (!res.ok) throw new Error("Failed to load chat sessions");
        const data = await res.json();
        if (mounted) {
          setSessions(Array.isArray(data) ? data : []);
          setSessionId(data?.[0]?.id ?? null);
        }
      })
      .catch((e) => setError(e.message));
    return () => { mounted = false; };
  }, []);

  // Load messages for selected session
  useEffect(() => {
    if (!sessionId) { setMessages([]); return; }
    let mounted = true;
    fetch(`/api/chat/sessions/${sessionId}/messages`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        if (mounted) setMessages(data);
      })
      .catch((e) => setError(e.message));
    return () => { mounted = false; };
  }, [sessionId]);

  async function onNewSession() {
    setError(null);
    try {
      const res = await fetch("/api/chat/sessions", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Failed to create chat session");
      const data = await res.json();
      const next = [{ id: data.id, title: data.title || "Chat" }, ...sessions];
      setSessions(next);
      setSessionId(data.id);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create session");
    }
  }

  const canSend = useMemo(() => input.trim().length > 0 && !!sessionId && !loading, [input, sessionId, loading]);

  async function onSend() {
    if (!sessionId || !input.trim()) return;
    const content = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content, created_at: new Date().toISOString() }]);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Model error");
      }
      const data = await res.json();
      const assistantText = data?.message ?? "";
      setMessages((prev) => [
        ...prev,
        { id: data?.id ?? `asst-${Date.now()}`, role: "assistant", content: assistantText, created_at: new Date().toISOString() },
      ]);
      // Update session updated_at order optimistically
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === sessionId);
        if (idx === -1) return prev;
        const updated = { ...prev[idx], updated_at: new Date().toISOString() };
        const rest = [...prev];
        rest.splice(idx, 1);
        return [updated, ...rest];
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        <SessionList
          sessions={sessions}
          selectedId={sessionId}
          onSelect={setSessionId}
          onNew={onNewSession}
        />
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Zenly Chat</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-red-600 border border-red-300 bg-red-50 p-2 rounded mb-3">{error}</div>
            )}
            <MessageList messages={messages} />
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Type your message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSend) onSend();
                }}
              />
              <Button onClick={onSend} disabled={!canSend}>
                {loading ? "Thinking…" : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}