import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getActivitiesByUser } from "@/lib/db/activities";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const activities = await getActivitiesByUser(user.id, 200);
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const today = activities.filter((a) => {
    const t = new Date(a.created_at).getTime();
    return t >= todayStart.getTime() && t <= todayEnd.getTime();
  });
  const camel = today.map((a) => ({
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
  return NextResponse.json(camel);
}
