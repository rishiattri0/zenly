"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Bot,
  Loader2,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  User,
  X,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";
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

interface SessionSummary {
  summary: string;
  keyThemes: string[];
  moodTrend: "improving" | "stable" | "declining" | "mixed";
  suggestedNextStep: string;
  updatedAt: string;
}

function SummaryPanel({
  summaryLoading,
  summary,
}: {
  summaryLoading: boolean;
  summary: SessionSummary | null;
}) {
  if (summaryLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Building summary...
      </div>
    );
  }

  if (!summary) {
    return <p className="text-sm text-muted-foreground">No summary yet.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">{summary.summary}</p>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Mood Trend</p>
        <p className="mt-1 font-medium capitalize">{summary.moodTrend}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Key Themes</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {summary.keyThemes.length > 0 ? (
            summary.keyThemes.map((theme) => (
              <span
                key={theme}
                className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
              >
                {theme}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No themes detected</span>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Next Step</p>
        <p className="mt-1 text-muted-foreground">{summary.suggestedNextStep}</p>
      </div>
    </div>
  );
}

function SessionSidebar({
  sessions,
  selectedId,
  onSelect,
  onDelete,
}: {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="h-full border-r border-border/70 bg-card/60 backdrop-blur-sm">
      <div className="border-b border-border/70 p-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
            <Image src="/zenly-logo.ico" alt="Zenly logo" width={18} height={18} className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Zenly</p>
            <p className="text-sm font-semibold">Conversations</p>
          </div>
        </Link>
      </div>

      <div className="h-[calc(100%-73px)] overflow-y-auto p-3">
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No chats yet. Start one to begin tracking your progress.
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelect(session.id)}
                className={cn(
                  "group w-full rounded-xl border p-3 text-left transition",
                  selectedId === session.id
                    ? "border-primary/30 bg-primary/10"
                    : "border-border/60 hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {session.title || "New Chat"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {session.updated_at
                        ? new Date(session.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Just now"}
                    </p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Delete chat"
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(session.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessagePane({ messages, loading }: { messages: ChatMessage[]; loading: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Start a conversation</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Share how you are feeling today. Zenly will respond with supportive and practical guidance.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-4 sm:p-6">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
          >
            {message.role === "assistant" && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/70 bg-card"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              <p
                className={cn(
                  "mt-2 text-[11px]",
                  message.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {new Date(message.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {message.role === "user" && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
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
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const loadSummary = useCallback(async (id: string) => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions/${id}/summary`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load summary");
      const data = await res.json();
      setSummary(data as SessionSummary);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/chat/sessions", { credentials: "include" });
    if (res.status === 401) {
      throw new Error("Please sign in to access chat.");
    }
    if (!res.ok) {
      throw new Error("Failed to load chat sessions");
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setSessions(list);
    setSessionId((prev) => prev ?? list[0]?.id ?? null);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/chat/sessions/${id}/messages`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to load messages");
    }
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let active = true;
    loadSessions().catch((e) => {
      if (active) setError(e instanceof Error ? e.message : "Failed to load");
    });
    return () => {
      active = false;
    };
  }, [loadSessions]);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setSummary(null);
      return;
    }

    loadMessages(sessionId).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    });
    loadSummary(sessionId);
  }, [sessionId, loadMessages, loadSummary]);

  const onNewSession = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to create chat session");
      const data = await res.json();
      const now = new Date().toISOString();
      const next: ChatSession = {
        id: data.id,
        title: data.title || "Chat",
        created_at: now,
        updated_at: now,
      };

      setSessions((prev) => [next, ...prev]);
      setSessionId(data.id);
      setMessages([]);
      setSummary(null);
      setCrisisAlert(null);
      setSidebarOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
    }
  }, []);

  const onDeleteSession = useCallback(
    async (id: string) => {
      const ok = window.confirm("Delete this chat?");
      if (!ok) return;

      try {
        const res = await fetch(`/api/chat/sessions/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to delete chat");

        setSessions((prev) => {
          const next = prev.filter((s) => s.id !== id);
          if (sessionId === id) {
            setSessionId(next[0]?.id ?? null);
            setMessages([]);
            setSummary(null);
            setCrisisAlert(null);
          }
          return next;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete chat");
      }
    },
    [sessionId]
  );

  const canSend = useMemo(
    () => Boolean(sessionId && input.trim().length > 0 && !loading),
    [sessionId, input, loading]
  );

  const onSend = useCallback(async () => {
    if (!sessionId || !input.trim() || loading) return;

    const content = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    setCrisisAlert(null);

    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate response");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: data?.id ?? `asst-${Date.now()}`,
          role: "assistant",
          content: data?.message ?? "",
          created_at: new Date().toISOString(),
        },
      ]);
      if (data?.crisisMode) {
        setCrisisAlert(
          "Crisis safety mode is active. If you are in immediate danger call 911. You can also call or text 988."
        );
      }

      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === sessionId);
        if (idx < 0) return prev;

        const titleCandidate =
          content
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .slice(0, 6)
            .join(" ")
            .slice(0, 48) || prev[idx].title || "Chat";

        const updated = {
          ...prev[idx],
          title: prev[idx].title && prev[idx].title !== "Chat" ? prev[idx].title : titleCandidate,
          updated_at: new Date().toISOString(),
        };

        const next = [...prev];
        next.splice(idx, 1);
        return [updated, ...next];
      });
      await loadSummary(sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }, [sessionId, input, loading, loadSummary]);

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
          <SessionSidebar
            sessions={sessions}
            selectedId={sessionId}
            onSelect={(id) => {
              setSessionId(id);
              setSidebarOpen(false);
            }}
            onDelete={onDeleteSession}
          />
        </div>
      </aside>

      <div className="relative z-10 flex h-full">
        <aside className="hidden h-full w-80 shrink-0 md:block">
          <SessionSidebar
            sessions={sessions}
            selectedId={sessionId}
            onSelect={setSessionId}
            onDelete={onDeleteSession}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border/70 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen((v) => !v)}
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <div>
                  <h1 className="text-sm font-semibold sm:text-base">
                    {sessions.find((s) => s.id === sessionId)?.title || "Wellness Assistant"}
                  </h1>
                  <p className="text-xs text-muted-foreground">Private and supportive conversation space</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 lg:hidden"
                  onClick={() => setMobileSummaryOpen(true)}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Summary</span>
                </Button>
                <AnimatedThemeToggler />
                <Button size="sm" onClick={onNewSession} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
              </div>
            </div>
          </header>

          <section className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_20rem] sm:px-6">
              <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-card/60">
                {crisisAlert && (
                  <div className="mx-4 mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
                    <span className="inline-flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      {crisisAlert}
                    </span>
                  </div>
                )}
                <MessagePane messages={messages} loading={loading} />
              </div>

              <aside className="hidden lg:block">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Session Summary</h3>
                  </div>
                  <SummaryPanel summaryLoading={summaryLoading} summary={summary} />
                </div>
              </aside>
            </div>
          </section>

          <footer className="border-t border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6">
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div>
              {error && (
                <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-end gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && canSend) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  placeholder="Write your message..."
                  disabled={!sessionId || loading}
                  className="h-11 border-border/70 bg-card"
                />
                <Button onClick={onSend} disabled={!canSend} size="icon" className="h-11 w-11 shrink-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                Press Enter to send. Your chats are saved automatically.
              </p>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <Dialog open={mobileSummaryOpen} onOpenChange={setMobileSummaryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Session Summary
            </DialogTitle>
            <DialogDescription>
              AI recap of your current conversation.
            </DialogDescription>
          </DialogHeader>
          <SummaryPanel summaryLoading={summaryLoading} summary={summary} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
