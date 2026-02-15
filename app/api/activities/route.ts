import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { insertActivity, getActivitiesByUser } from "@/lib/db/activities";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await getActivitiesByUser(user.id);
  const activities = rows.map((a) => ({
    id: a.id,
    userId: a.user_id,
    type: a.type,
    name: a.name,
    description: a.description,
    timestamp: a.created_at,
    duration: a.duration,
    completed: a.completed,
    moodScore: a.mood_score,
    moodNote: a.mood_note,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }));
  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { type, name, description, duration, completed } = body as {
      type?: string;
      name?: string;
      description?: string;
      duration?: number;
      completed?: boolean;
    };
    if (!type || !name || typeof type !== "string" || typeof name !== "string") {
      return NextResponse.json({ error: "type and name required" }, { status: 400 });
    }
    const result = await insertActivity({
      userId: user.id,
      type,
      name,
      description: description ?? null,
      duration: duration ?? null,
      completed: completed ?? true,
    });
    if (!result) {
      return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
    }
    return NextResponse.json({ id: result.id });
  } catch (e) {
    console.error("Activity POST error:", e);
    return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
  }
}
