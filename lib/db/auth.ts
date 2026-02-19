import { sql } from "./index";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SESSION_EXPIRY_DAYS = 7;
const BCRYPT_ROUNDS = 10;

export interface ZenlyUser {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<ZenlyUser | null> {
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  // In-memory fallback for local/dev when DATABASE_URL is missing
  if (!sql) {
    const existing = memory.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return null;
    const now = new Date();
    const user = {
      id: randomBytes(16).toString("hex"),
      email,
      name,
      password_hash,
      created_at: now,
      updated_at: now,
    };
    memory.users.push(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
  const rows = (await sql`
    INSERT INTO public.zenly_users (email, name, password_hash)
    VALUES (${email}, ${name}, ${password_hash})
    RETURNING id, email, name, created_at, updated_at
  `) as unknown as Array<{ id: string; email: string; name: string; created_at: Date; updated_at: Date }>;
  const row = rows[0];
  return row ? { id: row.id, email: row.email, name: row.name, created_at: row.created_at, updated_at: row.updated_at } : null;
}

export async function findUserByEmail(email: string): Promise<(ZenlyUser & { password_hash: string }) | null> {
  if (!sql) {
    const u = memory.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return u ? { id: u.id, email: u.email, name: u.name, password_hash: u.password_hash, created_at: u.created_at, updated_at: u.updated_at } : null;
  }
  const rows = (await sql`
    SELECT id, email, name, password_hash, created_at, updated_at
    FROM public.zenly_users WHERE email = ${email} LIMIT 1
  `) as unknown as Array<{ id: string; email: string; name: string; password_hash: string; created_at: Date; updated_at: Date }>;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, password_hash: row.password_hash, created_at: row.created_at, updated_at: row.updated_at };
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<{ session_token: string; expires_at: Date } | null> {
  if (!sql) {
    const session_token = randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    memory.sessions.push({ user_id: userId, session_token, expires_at });
    return { session_token, expires_at };
  }
  const session_token = randomBytes(32).toString("hex");
  const expires_at = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO public.zenly_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${session_token}, ${expires_at})
  `;
  return { session_token, expires_at };
}

export async function getSessionUser(sessionToken: string): Promise<ZenlyUser | null> {
  if (!sql) {
    const s = memory.sessions.find((s) => s.session_token === sessionToken && s.expires_at > new Date());
    if (!s) return null;
    const u = memory.users.find((u) => u.id === s.user_id);
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      created_at: u.created_at,
      updated_at: u.updated_at,
    };
  }
  const rows = (await sql`
    SELECT u.id, u.email, u.name, u.created_at, u.updated_at
    FROM public.zenly_users u
    JOIN public.zenly_sessions s ON s.user_id = u.id
    WHERE s.session_token = ${sessionToken} AND s.expires_at > now()
    LIMIT 1
  `) as unknown as Array<{ id: string; email: string; name: string; created_at: Date; updated_at: Date }>;
  const row = rows[0];
  return row ? { id: row.id, email: row.email, name: row.name, created_at: row.created_at, updated_at: row.updated_at } : null;
}

export async function deleteSession(sessionToken: string): Promise<void> {
  if (!sql) {
    const idx = memory.sessions.findIndex((s) => s.session_token === sessionToken);
    if (idx >= 0) memory.sessions.splice(idx, 1);
    return;
  }
  await sql`DELETE FROM public.zenly_sessions WHERE session_token = ${sessionToken}`;
}

// Simple in-memory fallback store for local development
declare global {
  var __ZENLY_MEM__:
    | {
        users: Array<{ id: string; email: string; name: string; password_hash: string; created_at: Date; updated_at: Date }>;
        sessions: Array<{ user_id: string; session_token: string; expires_at: Date }>;
      }
    | undefined;
}

const memory: {
  users: Array<{ id: string; email: string; name: string; password_hash: string; created_at: Date; updated_at: Date }>;
  sessions: Array<{ user_id: string; session_token: string; expires_at: Date }>;
} = globalThis.__ZENLY_MEM__ || { users: [], sessions: [] };

// Persist memory across hot reloads in dev
globalThis.__ZENLY_MEM__ = memory;
