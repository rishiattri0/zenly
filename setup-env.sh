#!/bin/bash

# Zenly Environment Setup Script
echo "🚀 Setting up Zenly environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database Connection (Optional for local dev)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

# App Configuration
APP_URL=http://localhost:3000
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-key-$(date +%s)")
EOF
    echo "✅ .env.local created successfully!"
else
    echo "⚠️  .env.local already exists. Skipping creation."
fi

echo ""
echo "🎯 Setup complete! Your environment is ready for:"
echo "   • Local development (in-memory storage)"
echo "   • Production (add DATABASE_URL for PostgreSQL)"
echo ""
echo "📝 To add production database:"
echo "   1. Get connection string from https://console.neon.tech"
echo "   2. Add to .env.local: DATABASE_URL=your-connection-string"
echo ""
echo "🚀 Run 'npm run dev' to start development!"
