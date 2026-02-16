# Database Setup Guide

## 🚨 Important: Mood & Activity Saving Issues

If mood and activities are not saving, the issue is likely that your database tables don't exist yet.

## Quick Fix

### 1. Set Up Environment Variables
Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

Add your Neon database URL:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 2. Run Database Schema
Execute the schema against your Neon database:

**Option A: Using psql**
```bash
psql $DATABASE_URL -f lib/db/schema.sql
```

**Option B: Using Neon Dashboard**
1. Go to [Neon Console](https://console.neon.tech)
2. Select your database
3. Go to the "SQL Editor" tab
4. Copy and paste the contents of `lib/db/schema.sql`
5. Click "Run"

**Option C: Using Node.js**
```bash
# Install dependencies if needed
npm install @neondatabase/serverless

# Run the setup script
node -e "
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const sql = neon(process.env.DATABASE_URL);
const schema = fs.readFileSync('lib/db/schema.sql', 'utf8');
await sql\`\${schema}\`;
console.log('✅ Database schema created successfully!');
"
```

### 3. Verify Tables Exist
Run the test script:
```bash
DATABASE_URL=your_database_url_here node test-db-connection.js
```

## Expected Tables
After setup, you should have these tables:
- ✅ `zenly_users` - User accounts
- ✅ `zenly_sessions` - Login sessions  
- ✅ `zenly_mood_entries` - Mood tracking
- ✅ `zenly_activities` - Activity logging
- ✅ `zenly_chat_sessions` - Chat sessions
- ✅ `zenly_chat_messages` - Chat messages

## Troubleshooting

### Still Not Working?
1. **Check environment variables:**
   ```bash
   echo $DATABASE_URL
   ```

2. **Verify table names:** The API expects `zenly_mood_entries` and `zenly_activities`

3. **Check browser console:** Look for network errors when saving

4. **Test API directly:**
   ```bash
   # Test mood endpoint
   curl -X POST http://localhost:3000/api/mood \
     -H "Content-Type: application/json" \
     -d '{"score": 75, "note": "test"}' \
     -b "session_token=your_session_token"
   ```

## Common Issues

- **"Unauthorized" error** → Not logged in or session expired
- **"Invalid mood score"** → Score must be 0-100
- **"Failed to save mood"** → Database tables don't exist
- **Connection refused** → DATABASE_URL is incorrect

## Need Help?
1. Check your Neon dashboard for the correct connection string
2. Ensure your database is active (not paused)
3. Verify the schema was applied successfully
