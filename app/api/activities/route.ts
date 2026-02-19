import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getActivitiesByUser, insertActivity } from "@/lib/db/activities";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSession();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await getActivitiesByUser(user.id, 100);
    return NextResponse.json(
      activities.map((row) => ({
        id: row.id,
        type: row.type,
        name: row.name,
        description: row.description,
        duration: row.duration,
        completed: row.completed,
        moodScore: row.mood_score,
        moodNote: row.mood_note,
        timestamp: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, name, description, duration } = body;

    if (!type || !name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Activity type and name are required" }, { status: 400 });
    }

    const activity = await insertActivity({
      userId: user.id,
      type,
      name: name.trim(),
      description: description || null,
      duration: duration || null,
      completed: true,
    });

    if (!activity) {
      return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
    }
    
    return NextResponse.json({
      id: activity.id,
      type: activity.type,
      name: activity.name,
      description: activity.description,
      duration: activity.duration,
      completed: activity.completed,
      moodScore: activity.mood_score,
      moodNote: activity.mood_note,
      timestamp: new Date(activity.created_at).toISOString(),
      updated_at: new Date(activity.updated_at).toISOString(),
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
  }
}
