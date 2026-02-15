-- Zenly app schema for Neon PostgreSQL
-- Run this against your Neon database if starting fresh (e.g. psql $DATABASE_URL -f lib/db/schema.sql)

CREATE TABLE IF NOT EXISTS public.zenly_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.zenly_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.zenly_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zenly_sessions_token ON public.zenly_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_zenly_sessions_user_id ON public.zenly_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.zenly_mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.zenly_users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zenly_mood_user_created ON public.zenly_mood_entries(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.zenly_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.zenly_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  completed BOOLEAN NOT NULL DEFAULT true,
  mood_score INTEGER,
  mood_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zenly_activities_user_created ON public.zenly_activities(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.zenly_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.zenly_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zenly_chat_sessions_user ON public.zenly_chat_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.zenly_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID NOT NULL REFERENCES public.zenly_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zenly_chat_messages_session ON public.zenly_chat_messages(chat_session_id, created_at);
