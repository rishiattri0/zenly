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

    const moods = await sql`
      SELECT 
        id,
        score,
        note,
        created_at as timestamp
      FROM zenly_mood_entries 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json(moods);
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

    const result = await sql`
      INSERT INTO zenly_mood_entries (user_id, score, note)
      VALUES (${user.id}, ${score}, ${note || null})
      RETURNING 
        id,
        score,
        note,
        created_at as timestamp
    `;

    const mood = result[0];
    
    return NextResponse.json({
      ...mood,
      timestamp: mood.timestamp.toISOString()
    });
  } catch (error) {
    console.error("Error creating mood:", error);
    return NextResponse.json({ error: "Failed to save mood" }, { status: 500 });
  }
}
