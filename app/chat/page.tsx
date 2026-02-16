"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, MessageSquare, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
interface ChatSession {
  id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
}
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  created_at: string;
}

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
    <div className="h-full bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          <Button 
            size="sm" 
            onClick={onNew}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start your first chat below</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((s) => (
              <button
                key={s.id}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                  selectedId === s.id && "bg-muted border-l-2 border-primary"
                )}
                onClick={() => onSelect(s.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.title || "New Conversation"}</div>
                    {s.updated_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(s.updated_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to Zenly Chat</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            I&apos;m here to support your mental wellness journey. How are you feeling today?
          </p>
        </div>
      ) : (
        <>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-3 max-w-4xl",
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className="flex-shrink-0">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted border border-border"
                )}>
                  {m.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className={cn(
                "flex-1 px-4 py-3 rounded-2xl",
                m.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted border border-border"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(m.created_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
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
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Failed to create session");
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
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-background flex">
      {/* Sidebar */}
      <div className="w-80 h-full flex-shrink-0 hidden md:flex">
        <SessionList
          sessions={sessions}
          selectedId={sessionId}
          onSelect={setSessionId}
          onNew={onNewSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Zenly Assistant</h1>
                <p className="text-xs text-muted-foreground">Your mental wellness companion</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNewSession}
              className="md:hidden gap-2"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {error && (
            <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="p-4">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  placeholder="Share what's on your mind..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && canSend) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  className="resize-none h-12 pr-12 bg-background border-border focus:border-primary"
                  disabled={!sessionId || loading}
                />
              </div>
              <Button 
                onClick={onSend} 
                disabled={!canSend}
                size="lg"
                className="gap-2 px-6 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}