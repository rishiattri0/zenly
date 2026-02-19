import { sql } from "./index";

export interface MoodEntryRow {
  id: string;
  user_id: string;
  score: number;
  note: string | null;
  created_at: Date;
}

declare global {
  var __ZENLY_MOOD_MEM__: MoodEntryRow[] | undefined;
}

const moodMemory: MoodEntryRow[] = globalThis.__ZENLY_MOOD_MEM__ || [];
globalThis.__ZENLY_MOOD_MEM__ = moodMemory;

export async function insertMoodEntry(
  userId: string,
  score: number,
  note?: string
): Promise<MoodEntryRow | null> {
  if (!sql) {
    const row: MoodEntryRow = {
      id: `mood-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      user_id: userId,
      score,
      note: note ?? null,
      created_at: new Date(),
    };
    moodMemory.unshift(row);
    return row;
  }
  const rows = (await sql`
    INSERT INTO public.zenly_mood_entries (user_id, score, note)
    VALUES (${userId}, ${score}, ${note ?? null})
    RETURNING id, user_id, score, note, created_at
  `) as unknown as MoodEntryRow[];
  const row = rows[0];
  return row ?? null;
}

export async function getMoodEntriesByUser(
  userId: string,
  limit = 50
): Promise<MoodEntryRow[]> {
  if (!sql) {
    return moodMemory.filter((row) => row.user_id === userId).slice(0, limit);
  }
  const rows = await sql`
    SELECT id, user_id, score, note, created_at
    FROM public.zenly_mood_entries
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as MoodEntryRow[];
}
