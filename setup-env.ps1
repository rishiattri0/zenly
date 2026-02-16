# Zenly Environment Setup Script (PowerShell)
Write-Host "🚀 Setting up Zenly environment..." -ForegroundColor Green

# Create .env with safe defaults (can be committed)
Write-Host "📝 Creating .env file with defaults..." -ForegroundColor Yellow
$envDefaults = @"
# Default Environment Variables (safe to commit)

# Session Security (Development default - change in production)
SESSION_SECRET=dev-secret-key-change-in-production

# AI Configuration
GROQ_MODEL=llama-3.1-8b-instant

# Database Connection (Optional for local dev)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
"@

if (-not (Test-Path ".env")) {
    $envDefaults | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env created with safe defaults!" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env already exists. Skipping creation." -ForegroundColor Yellow
}

# Create .env.local for personal secrets (never commit)
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file for your secrets..." -ForegroundColor Yellow
    
    # Generate a random secret key
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $envLocal = @"
# Personal Environment Variables (NEVER commit to git)

# Session Security (Required - replace with your own secret)
SESSION_SECRET=$secret

# AI Configuration (Required - get from https://console.groq.com/keys)
GROQ_API_KEY=your-groq-api-key-here

# Database Connection (Required for production)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
"@
    
    $envLocal | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created for your secrets!" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local already exists. Skipping creation." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Setup complete! Your environment is ready for:" -ForegroundColor Cyan
Write-Host "   • Local development (in-memory storage)" -ForegroundColor White
Write-Host "   • Production (add DATABASE_URL for PostgreSQL)" -ForegroundColor White
Write-Host ""
Write-Host "📝 To add production database:" -ForegroundColor Cyan
Write-Host "   1. Get connection string from https://console.neon.tech" -ForegroundColor White
Write-Host "   2. Add to .env.local: DATABASE_URL=your-connection-string" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Run 'npm run dev' to start development!" -ForegroundColor Green
