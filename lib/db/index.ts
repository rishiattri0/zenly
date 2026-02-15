import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
let client: ReturnType<typeof neon> | null = null;

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Database features will be disabled.");
} else {
  try {
    client = neon(connectionString);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `Failed to initialize database client from DATABASE_URL; falling back to in-memory store. Error: ${message}`
    );
    client = null;
  }
}

export const sql = client;

export type Row = Record<string, unknown>;
