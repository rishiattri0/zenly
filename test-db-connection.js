// Simple test to verify database tables exist
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in environment variables");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function testTables() {
  try {
    console.log("Testing database connection...");
    
    // Test mood_entries table
    try {
      const moodResult = await sql`SELECT COUNT(*) as count FROM zenly_mood_entries LIMIT 1`;
      console.log("✅ zenly_mood_entries table exists, count:", moodResult[0]?.count || 0);
    } catch (error) {
      console.error("❌ Error accessing zenly_mood_entries:", error.message);
    }
    
    // Test activities table
    try {
      const activityResult = await sql`SELECT COUNT(*) as count FROM zenly_activities LIMIT 1`;
      console.log("✅ zenly_activities table exists, count:", activityResult[0]?.count || 0);
    } catch (error) {
      console.error("❌ Error accessing zenly_activities:", error.message);
    }
    
    // Test users table
    try {
      const userResult = await sql`SELECT COUNT(*) as count FROM zenly_users LIMIT 1`;
      console.log("✅ zenly_users table exists, count:", userResult[0]?.count || 0);
    } catch (error) {
      console.error("❌ Error accessing zenly_users:", error.message);
    }
    
    console.log("✅ Database connection successful!");
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

testTables().then(() => process.exit(0));
