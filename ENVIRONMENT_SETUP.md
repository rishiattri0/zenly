# 🚀 Environment Setup Guide

## 📁 **Understanding Environment Files**

### **`.env`** (Safe to commit)
- **Default configurations**
- **Non-sensitive values**
- **Shared settings**

### **`.env.local`** (NEVER commit)
- **Personal API keys**
- **Database URLs**
- **Secret keys**

## Quick Setup for Local Development

### Step 1: Run Setup Script
```bash
# Windows PowerShell
.\setup-env.ps1

# Mac/Linux
./setup-env.sh
```

### Step 2: Add Your API Key
Edit `.env.local` and add your Groq API key:

```env
# Personal Environment Variables (NEVER commit to git)

# Session Security (Required - replace with your own secret)
SESSION_SECRET=your-generated-secret-key

# AI Configuration (Required - get from https://console.groq.com/keys)
GROQ_API_KEY=your-actual-groq-api-key-here

# Database Connection (Required for production)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

### Step 3: Get Groq API Key
1. Visit [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up for free account
3. Create a new API key
4. Copy it to your `.env.local` file

### Step 4: Start Development
```bash
npm run dev
```

## Manual Setup (Alternative)

### Create `.env` with defaults:
```env
# Default Environment Variables (safe to commit)

# Session Security (Development default - change in production)
SESSION_SECRET=dev-secret-key-change-in-production

# AI Configuration
GROQ_MODEL=llama-3.1-8b-instant
```

### Create `.env.local` with your secrets:
```env
# Personal Environment Variables (NEVER commit to git)

# Session Security (Required - replace with your own secret)
SESSION_SECRET=your-random-secret-key-here

# AI Configuration (Required - get from https://console.groq.com/keys)
GROQ_API_KEY=your-actual-groq-api-key-here

# Database Connection (Required for production)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

## Important Notes

### 🔧 **Custom Authentication System**
This app uses a **custom authentication system** (NOT NextAuth.js):

- ✅ **Local Development:** Works without DATABASE_URL (uses in-memory storage)
- ✅ **Production:** Requires DATABASE_URL for PostgreSQL
- ✅ **Sessions:** Uses custom session management with cookies

### 🗄️ **Database Options**

#### Option 1: Local Development (In-Memory)
- No DATABASE_URL needed
- Data resets when server restarts
- Perfect for testing and development

#### Option 2: Production (PostgreSQL)
- Get connection string from [Neon Console](https://console.neon.tech)
- Add to .env.local: `DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`
- Data persists across restarts

### 🚀 **Start Development**

```bash
npm run dev
```

Visit: http://localhost:3000

## Troubleshooting

### ❌ "GROQ_API_KEY not configured"
**Error:** AI chat functionality not working

**Solution:**
1. Get API key from [https://console.groq.com/keys](https://console.groq.com/keys)
2. Add to `.env.local`: `GROQ_API_KEY=your-actual-api-key`
3. Restart development server

### ❌ "DATABASE_URL missing" (Production only)
**Error:** Database connection failed

**Solution:**
- For local dev: This is normal - uses in-memory storage
- For production: Add to `.env.local`: `DATABASE_URL=your-neon-connection-string`

### ❌ "SESSION_SECRET issues"
**Error:** Session authentication not working

**Solution:**
1. Check that SESSION_SECRET is set in `.env.local`
2. Generate new secret if needed
3. Restart development server

### ❌ "Environment variable not found"
**Error:** Missing environment variables

**Solution:**
1. Run setup script: `.\setup-env.ps1` (Windows) or `./setup-env.sh` (Mac/Linux)
2. Check both `.env` and `.env.local` files exist
3. Ensure `.env.local` has your actual API keys

## Production Deployment

When deploying to Netlify/Vercel:

1. **Add DATABASE_URL** environment variable (Neon PostgreSQL)
2. **Set SESSION_SECRET** to a secure random string
3. **Set GROQ_API_KEY** for AI chat functionality

### Environment Variables for Production:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
SESSION_SECRET=your-production-secret-key
GROQ_API_KEY=your-production-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

### 🎯 **Ready to Go!**

Your Zenly app should now work perfectly with:
- ✅ Custom authentication system
- ✅ Local development (in-memory)
- ✅ Production deployment (PostgreSQL)
- ✅ AI chat functionality (Groq)
- ✅ Session management
- ✅ All features working

**Run `npm run dev` and enjoy your wellness platform!** 🚀
