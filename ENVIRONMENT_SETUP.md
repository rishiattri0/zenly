# 🚀 Environment Setup Guide

## Quick Setup for Local Development

### Step 1: Create Environment File
Create a `.env.local` file in the root directory:

```bash
# Create the file
touch .env.local
```

### Step 2: Add Environment Variables
Copy this content to your `.env.local` file:

```env
# Database Connection (Optional for local dev)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
```

### Step 3: Generate Secret Key
Generate a secure secret key:

**Windows (PowerShell):**
```powershell
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
echo $secret
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Replace `your-random-secret-key-here` with the generated secret.

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

### ❌ "NextAuth Error"
This is misleading - the app uses custom auth, not NextAuth.js. The error usually means:

1. **Missing .env.local file** - Create it with the content above
2. **Invalid NEXTAUTH_SECRET** - Generate a new secret key
3. **Wrong NEXTAUTH_URL** - Should be `http://localhost:3000` for local dev

### ❌ "Database Connection Failed"
- For local dev: This is normal - it will use in-memory storage
- For production: Add your Neon DATABASE_URL to .env.local

### ❌ "Session Issues"
- Check that NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your development URL

## Production Deployment

When deploying to Netlify/Vercel:

1. **Add DATABASE_URL** environment variable
2. **Set NEXTAUTH_URL** to your domain
3. **Set NEXTAUTH_SECRET** to a secure random string

### Environment Variables for Production:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key
```

## 🎯 **Ready to Go!**

Your Zenly app should now work perfectly with:
- ✅ Custom authentication system
- ✅ Local development (in-memory)
- ✅ Production deployment (PostgreSQL)
- ✅ Session management
- ✅ All features working

**Run `npm run dev` and enjoy your wellness platform!** 🚀
