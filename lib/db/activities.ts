import { sql } from "./index";

export interface ActivityRow {
  id: string;
  user_id: string;
  type: string;
  name: string;
  description: string | null;
  duration: number | null;
  completed: boolean;
  mood_score: number | null;
  mood_note: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function insertActivity(params: {
  userId: string;
  type: string;
  name: string;
  description?: string | null;
  duration?: number | null;
  completed?: boolean;
  moodScore?: number | null;
  moodNote?: string | null;
}): Promise<{ id: string } | null> {
  if (!sql) return null;
  const rows = await sql`
    INSERT INTO public.zenly_activities (user_id, type, name, description, duration, completed, mood_score, mood_note)
    VALUES (
      ${params.userId},
      ${params.type},
      ${params.name},
      ${params.description ?? null},
      ${params.duration ?? null},
      ${params.completed ?? true},
      ${params.moodScore ?? null},
      ${params.moodNote ?? null}
    )
    RETURNING id
  `;
  const row = rows[0] as { id: string } | undefined;
  return row ? { id: row.id } : null;
}

export async function getActivitiesByUser(
  userId: string,
  limit = 100
): Promise<ActivityRow[]> {
  if (!sql) return [];
  const rows = await sql`
    SELECT id, user_id, type, name, description, duration, completed, mood_score, mood_note, created_at, updated_at
    FROM public.zenly_activities
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as ActivityRow[];
}
