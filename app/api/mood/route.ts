import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { insertMoodEntry } from "@/lib/db/mood";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const score = Number(body?.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: "Invalid score (0-100)" }, { status: 400 });
    }
    const note = typeof body?.note === "string" ? body.note : undefined;
    const result = await insertMoodEntry(user.id, score, note);
    if (!result) {
      return NextResponse.json({ error: "Failed to save mood" }, { status: 500 });
    }
    return NextResponse.json({ id: result.id });
  } catch (e) {
    console.error("Mood POST error:", e);
    return NextResponse.json({ error: "Failed to save mood" }, { status: 500 });
  }
}
