import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const user = await getSession();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await sql`
      SELECT 
        id,
        type,
        name,
        description,
        duration,
        completed,
        created_at as timestamp,
        updated_at
      FROM zenly_activities 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json(activities);
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

    const result = await sql`
      INSERT INTO zenly_activities (user_id, type, name, description, duration, completed)
      VALUES (${user.id}, ${type}, ${name.trim()}, ${description || null}, ${duration || null}, true)
      RETURNING 
        id,
        type,
        name,
        description,
        duration,
        completed,
        created_at as timestamp,
        updated_at
    `;

    const activity = result[0];
    
    return NextResponse.json({
      ...activity,
      timestamp: activity.timestamp.toISOString()
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
  }
}
