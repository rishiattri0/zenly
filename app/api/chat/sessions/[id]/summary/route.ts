import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getChatMessages } from "@/lib/db/chat";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type SessionSummary = {
  summary: string;
  keyThemes: string[];
  moodTrend: "improving" | "stable" | "declining" | "mixed";
  suggestedNextStep: string;
  updatedAt: string;
};

async function ensureSessionBelongsToUser(sessionId: string, userId: string): Promise<boolean> {
  if (!sql) return false;
  const rows = (await sql`
    SELECT id FROM public.zenly_chat_sessions
    WHERE id = ${sessionId} AND user_id = ${userId}
    LIMIT 1
  `) as unknown as Array<{ id: string }>;
  return rows.length > 0;
}

function inferMoodTrend(text: string): SessionSummary["moodTrend"] {
  const value = text.toLowerCase();
  const neg = ["anxious", "depressed", "sad", "hopeless", "stressed", "panic", "overwhelmed"];
  const pos = ["better", "calm", "hopeful", "grateful", "improving", "relaxed", "confident"];
  const negCount = neg.reduce((n, k) => n + (value.includes(k) ? 1 : 0), 0);
  const posCount = pos.reduce((n, k) => n + (value.includes(k) ? 1 : 0), 0);
  if (posCount >= negCount + 2) return "improving";
  if (negCount >= posCount + 2) return "declining";
  if (posCount === 0 && negCount === 0) return "stable";
  return "mixed";
}

function heuristicSummary(messages: Array<{ role: "user" | "assistant"; content: string }>): SessionSummary {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");
  const moodTrend = inferMoodTrend(userText);
  const keyThemes = [
    ["sleep", "rest", "insomnia"],
    ["stress", "pressure", "overwhelmed"],
    ["anxiety", "panic", "worry"],
    ["work", "job", "career"],
    ["relationship", "family", "friend"],
    ["motivation", "focus", "energy"],
  ]
    .filter((group) => group.some((word) => userText.toLowerCase().includes(word)))
    .slice(0, 3)
    .map((group) => group[0]);

  const lastUser = messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
  const summary = lastUser
    ? `You shared ${lastUser.slice(0, 180)}${lastUser.length > 180 ? "..." : ""}`
    : "This session focused on your emotional wellbeing and coping strategies.";

  return {
    summary,
    keyThemes: keyThemes.length > 0 ? keyThemes : ["general wellbeing"],
    moodTrend,
    suggestedNextStep: "Choose one small grounding action for today and check in again after completing it.",
    updatedAt: new Date().toISOString(),
  };
}

async function aiSummary(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<SessionSummary | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const context = messages.slice(-16).map((m) => `${m.role}: ${m.content}`).join("\n");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Generate concise therapy session summaries. Return strict JSON with keys: summary, keyThemes (array of max 4), moodTrend (improving|stable|declining|mixed), suggestedNextStep.",
        },
        {
          role: "user",
          content: `Conversation:\n${context}`,
        },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) return null;

  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Omit<SessionSummary, "updatedAt">;
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "Session summary unavailable.",
      keyThemes: Array.isArray(parsed.keyThemes)
        ? parsed.keyThemes.filter((item) => typeof item === "string").slice(0, 4)
        : [],
      moodTrend:
        parsed.moodTrend === "improving" ||
        parsed.moodTrend === "stable" ||
        parsed.moodTrend === "declining" ||
        parsed.moodTrend === "mixed"
          ? parsed.moodTrend
          : "mixed",
      suggestedNextStep:
        typeof parsed.suggestedNextStep === "string"
          ? parsed.suggestedNextStep
          : "Take one practical self-care step before your next check-in.",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
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
  const owned = await ensureSessionBelongsToUser(sessionId, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const messages = await getChatMessages(sessionId);
    if (messages.length === 0) {
      return NextResponse.json({
        summary: "No conversation yet.",
        keyThemes: [],
        moodTrend: "stable",
        suggestedNextStep: "Start by sharing what is on your mind right now.",
        updatedAt: new Date().toISOString(),
      } satisfies SessionSummary);
    }

    const reduced = messages.map((m) => ({ role: m.role, content: m.content }));
    const withAi = await aiSummary(reduced);
    const summary = withAi || heuristicSummary(reduced);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Session summary error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
