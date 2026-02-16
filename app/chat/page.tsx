"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, MessageSquare, Loader2, Bot, User, X, Menu, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

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
  onDelete,
  isMobile = false,
}: {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}) {
  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      <div className="p-3 sm:p-4 border-b border-border flex-shrink-0">
        <div className="flex flex-col gap-3 pr-10 md:pr-0">
          <Link href="/dashboard" className="w-fit hover:opacity-80 transition-opacity">
            <p className="font-extrabold text-xl sm:text-2xl md:text-4xl leading-none">ZENLY</p>
          </Link>
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="font-semibold text-sm sm:text-lg truncate">Conversations</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {sessions.length === 0 ? (
          <div className="p-4 sm:p-8 text-center">
            <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start your first chat below</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((s) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "w-full text-left p-3 sm:p-4 hover:bg-muted/50 transition-colors",
                  selectedId === s.id && "bg-muted border-l-2 border-primary"
                )}
                onClick={() => onSelect(s.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(s.id);
                  }
                }}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium truncate">{s.title || "New Conversation"}</div>
                    {s.updated_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(s.updated_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          ...(isMobile ? {} : { hour: '2-digit', minute: '2-digit' })
                        })}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete chat"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
    <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
            <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">Welcome to Zenly Chat</h3>
          <p className="text-sm text-muted-foreground max-w-sm sm:max-w-md">
            I&apos;m here to support your mental wellness journey. How are you feeling today?
          </p>
        </div>
      ) : (
        <>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-2 sm:gap-3 max-w-3xl sm:max-w-4xl",
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className="flex-shrink-0">
                <div className={cn(
                  "h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center",
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted border border-border"
                )}>
                  {m.role === "user" ? (
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className={cn(
                "flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl",
                m.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted border border-border"
              )}>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function onDeleteSession(id: string) {
    setError(null);
    try {
      const ok = window.confirm("Delete this chat?");
      if (!ok) return;

      const res = await fetch(`/api/chat/sessions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete chat");

      let nextSelected: string | null = null;
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (id === sessionId) nextSelected = remaining[0]?.id ?? null;
        return remaining;
      });
      setMessages((prev) => (id === sessionId ? [] : prev));
      setSessionId((prev) => (prev === id ? nextSelected : prev));
      setSidebarOpen(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Failed to delete chat");
    }
  }

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

    const titleCandidate = content
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 6)
      .join(" ")
      .slice(0, 48);
    if (titleCandidate) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId && (!s.title || s.title === "Chat") ? { ...s, title: titleCandidate } : s))
      );
    }

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
    <div className="h-screen bg-background flex overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-background border-r border-border transform transition-transform duration-300 ease-in-out md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close sidebar"
          className="absolute right-2 top-2 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <SessionList
          sessions={sessions}
          selectedId={sessionId}
          onSelect={(id) => {
            setSessionId(id);
            setSidebarOpen(false);
          }}
          onNew={() => {
            onNewSession();
            setSidebarOpen(false);
          }}
          onDelete={onDeleteSession}
          isMobile={true}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 lg:w-80 h-full flex-shrink-0">
        <SessionList
          sessions={sessions}
          selectedId={sessionId}
          onSelect={setSessionId}
          onNew={onNewSession}
          onDelete={onDeleteSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen((v) => !v)}
                className="md:hidden p-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm sm:text-lg">Zenly Assistant</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Your mental wellness companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onNewSession}
                className="gap-1 sm:gap-2 h-8 sm:h-auto px-2 sm:px-3"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          {error && (
            <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 p-2 sm:p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="p-3 sm:p-4 pb-[env(safe-area-inset-bottom,1rem)]">
            <div className="flex gap-2 sm:gap-3 max-w-3xl sm:max-w-4xl mx-auto">
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
                  className="resize-none h-10 sm:h-12 pr-10 sm:pr-12 bg-background border-border focus:border-primary text-sm"
                  disabled={!sessionId || loading}
                />
              </div>
              <Button 
                onClick={onSend} 
                disabled={!canSend}
                size="lg"
                className="gap-1 sm:gap-2 px-3 sm:px-6 bg-primary hover:bg-primary/90 h-10 sm:h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Send</span>
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