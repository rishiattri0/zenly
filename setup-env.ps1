# Zenly Environment Setup Script (PowerShell)
Write-Host "🚀 Setting up Zenly environment..." -ForegroundColor Green

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    
    # Generate a random secret key
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $envContent = @"
# Database Connection (Optional for local dev)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

# App Configuration
APP_URL=http://localhost:3000
SESSION_SECRET=$secret
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created successfully!" -ForegroundColor Green
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
