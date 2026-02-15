import { sql } from "./index";

export async function insertMoodEntry(
  userId: string,
  score: number,
  note?: string
): Promise<{ id: string } | null> {
  if (!sql) return null;
  const rows = (await sql`
    INSERT INTO public.zenly_mood_entries (user_id, score, note)
    VALUES (${userId}, ${score}, ${note ?? null})
    RETURNING id
  `) as unknown as Array<{ id: string }>;
  const row = rows[0];
  return row ? { id: row.id } : null;
}

export async function getMoodEntriesByUser(
  userId: string,
  limit = 50
): Promise<{ id: string; score: number; note: string | null; created_at: Date }[]> {
  if (!sql) return [];
  const rows = await sql`
    SELECT id, score, note, created_at
    FROM public.zenly_mood_entries
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as { id: string; score: number; note: string | null; created_at: Date }[];
}
