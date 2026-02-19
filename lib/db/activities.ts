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

declare global {
  var __ZENLY_ACTIVITIES_MEM__: ActivityRow[] | undefined;
}

const activitiesMemory: ActivityRow[] = globalThis.__ZENLY_ACTIVITIES_MEM__ || [];
globalThis.__ZENLY_ACTIVITIES_MEM__ = activitiesMemory;

export async function insertActivity(params: {
  userId: string;
  type: string;
  name: string;
  description?: string | null;
  duration?: number | null;
  completed?: boolean;
  moodScore?: number | null;
  moodNote?: string | null;
}): Promise<ActivityRow | null> {
  if (!sql) {
    const now = new Date();
    const row: ActivityRow = {
      id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      user_id: params.userId,
      type: params.type,
      name: params.name,
      description: params.description ?? null,
      duration: params.duration ?? null,
      completed: params.completed ?? true,
      mood_score: params.moodScore ?? null,
      mood_note: params.moodNote ?? null,
      created_at: now,
      updated_at: now,
    };
    activitiesMemory.unshift(row);
    return row;
  }
  const rows = (await sql`
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
    RETURNING id, user_id, type, name, description, duration, completed, mood_score, mood_note, created_at, updated_at
  `) as unknown as ActivityRow[];
  const row = rows[0];
  return row ?? null;
}

export async function getActivitiesByUser(
  userId: string,
  limit = 100
): Promise<ActivityRow[]> {
  if (!sql) {
    return activitiesMemory.filter((row) => row.user_id === userId).slice(0, limit);
  }
  const rows = await sql`
    SELECT id, user_id, type, name, description, duration, completed, mood_score, mood_note, created_at, updated_at
    FROM public.zenly_activities
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as ActivityRow[];
}
