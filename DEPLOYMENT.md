# Zenly Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Neon database account

### Environment Variables
Set these in your Vercel dashboard under Project Settings > Environment Variables:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add the three variables listed above
   - Make sure to include them in Production, Preview, and Development environments

4. **Deploy**
   - Vercel will automatically deploy on push
   - Monitor the build logs for any issues

### Build Configuration
The project includes:
- `vercel.json` for deployment configuration
- `next.config.ts` optimized for Vercel
- Proper environment variable handling

### Troubleshooting

**Build Fails:**
- Check environment variables are correctly set
- Ensure DATABASE_URL is valid and accessible
- Verify NEXTAUTH_URL matches your deployment domain

**Database Connection Issues:**
- Test your DATABASE_URL locally first
- Ensure Neon database is active
- Check IP whitelist settings in Neon

**Authentication Issues:**
- Verify NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches exactly (no trailing slash)

### Post-Deployment
1. Test all functionality:
   - User registration/login
   - Chat functionality
   - Dashboard features

2. Monitor Vercel logs for any runtime errors

3. Set up custom domain if needed in Vercel dashboard

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`
