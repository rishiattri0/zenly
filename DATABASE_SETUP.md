# Database Setup Guide

This project uses Neon Postgres via `@neondatabase/serverless`.

## 1) Configure environment
Create `.env.local` from `env.example` and set:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
GROQ_API_KEY=your_groq_api_key
```

## 2) Apply schema
Run one of these options.

Option A (`psql`):
```bash
psql "$DATABASE_URL" -f lib/db/schema.sql
```

Option B (Neon SQL Editor):
1. Open https://console.neon.tech
2. Open your project and branch
3. Open SQL Editor
4. Paste `lib/db/schema.sql`
5. Run the script

## 3) Verify tables
Run this SQL:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'zenly_%'
ORDER BY tablename;
```

Expected tables:
- `zenly_users`
- `zenly_sessions`
- `zenly_mood_entries`
- `zenly_activities`
- `zenly_chat_sessions`
- `zenly_chat_messages`

## Notes
- Without `DATABASE_URL`, auth/mood/activity/chat data uses in-memory fallback (non-persistent).
- In production, set `DATABASE_URL` and `GROQ_API_KEY`.
