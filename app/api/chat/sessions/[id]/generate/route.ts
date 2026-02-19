import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getChatMessages, addChatMessage, updateChatSessionUpdatedAt, updateChatSessionTitleIfDefault } from "@/lib/db/chat";
import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";

async function ensureSessionBelongsToUser(sessionId: string, userId: string): Promise<boolean> {
  if (!sql) return false;
  const result = (await sql`
    SELECT id FROM public.zenly_chat_sessions WHERE id = ${sessionId} AND user_id = ${userId} LIMIT 1
  `) as unknown as Array<Record<string, unknown>>;
  return Array.isArray(result) && result.length > 0;
}

function isHighRiskMessage(content: string): boolean {
  const normalized = content.toLowerCase();
  const highRiskPatterns = [
    "want to die",
    "kill myself",
    "end my life",
    "suicide",
    "hurt myself",
    "self harm",
    "overdose",
    "no reason to live",
    "can't go on",
  ];
  return highRiskPatterns.some((p) => normalized.includes(p));
}

function buildCrisisResponse(): string {
  return [
    "I am really glad you shared this with me. You matter, and you deserve immediate support from a real person right now.",
    "If you are in immediate danger, call 911 now. In the U.S., you can call or text 988 to reach the Suicide & Crisis Lifeline 24/7.",
    "If you want, we can stay focused on one next safe step together while you reach out.",
  ].join(" ");
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
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    // Save the user's message first
    const userMsg = await addChatMessage(sessionId, "user", content);
    if (!userMsg) {
      return NextResponse.json({ error: "Failed to add user message" }, { status: 500 });
    }

    const titleCandidate = content
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 6)
      .join(" ")
      .slice(0, 48);
    if (titleCandidate) {
      await updateChatSessionTitleIfDefault(sessionId, titleCandidate, "Chat");
    }

    // Crisis safety mode: prioritize immediate real-world support.
    if (isHighRiskMessage(content)) {
      const crisisText = buildCrisisResponse();
      const asstMsg = await addChatMessage(sessionId, "assistant", crisisText);
      if (!asstMsg) {
        return NextResponse.json({ error: "Failed to add assistant message" }, { status: 500 });
      }
      await updateChatSessionUpdatedAt(sessionId);
      return NextResponse.json({
        message: crisisText,
        id: asstMsg.id,
        crisisMode: true,
        crisisResources: [
          { name: "Emergency Services", contact: "911" },
          { name: "Suicide & Crisis Lifeline", contact: "Call or text 988" },
        ],
      });
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    // Build chat history
    const history = await getChatMessages(sessionId);
    const messages = history.map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        stream: false,
        messages: [
          {
            role: "system",
            content: "You are Zenly, a friendly and supportive mental wellness companion. Be warm, caring, and conversational. Keep responses relatively short (2-3 sentences max) and casual. Use natural language like a caring friend would. Be encouraging but not overly formal. Focus on being supportive and understanding."
          },
          ...messages
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Groq API error:", res.status, text);
      return NextResponse.json({ error: "AI provider error" }, { status: 502 });
    }

    const data = await res.json();
    const assistantText: string = data?.choices?.[0]?.message?.content ?? "";
    if (!assistantText) {
      return NextResponse.json({ error: "Empty model response" }, { status: 500 });
    }

    const asstMsg = await addChatMessage(sessionId, "assistant", assistantText);
    if (!asstMsg) {
      return NextResponse.json({ error: "Failed to add assistant message" }, { status: 500 });
    }
    await updateChatSessionUpdatedAt(sessionId);

    return NextResponse.json({ message: assistantText, id: asstMsg.id });
  } catch (e) {
    console.error("Generate message error:", e);
    return NextResponse.json({ error: "Failed to generate message" }, { status: 500 });
  }
}
