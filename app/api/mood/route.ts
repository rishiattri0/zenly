import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getMoodEntriesByUser, insertMoodEntry } from "@/lib/db/mood";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawDays = Number(request.nextUrl.searchParams.get("days") || "1");
    const days = Number.isFinite(rawDays) ? Math.min(Math.max(Math.trunc(rawDays), 1), 365) : 1;
    const limit = Math.max(50, days * 4);
    const moods = await getMoodEntriesByUser(user.id, limit);

    // Default stays "today only"; pass `?days=N` for historical ranges.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    const selectedMoods = moods
      .filter((row) => new Date(row.created_at) >= start)
      .map((row) => ({
        id: row.id,
        score: row.score,
        note: row.note,
        timestamp: new Date(row.created_at).toISOString(),
      }));

    return NextResponse.json(selectedMoods);
  } catch (error) {
    console.error("Error fetching moods:", error);
    return NextResponse.json({ error: "Failed to fetch moods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { score, note } = body;

    if (!score || typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json({ error: "Invalid mood score" }, { status: 400 });
    }

    const mood = await insertMoodEntry(user.id, score, note);
    if (!mood) {
      return NextResponse.json({ error: "Failed to save mood" }, { status: 500 });
    }
    
    return NextResponse.json({
      id: mood.id,
      score: mood.score,
      note: mood.note,
      timestamp: new Date(mood.created_at).toISOString(),
    });
  } catch (error) {
    console.error("Error creating mood:", error);
    return NextResponse.json({ error: "Failed to save mood" }, { status: 500 });
  }
}
