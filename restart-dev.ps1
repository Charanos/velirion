# Restart Development Server Script
# This ensures clean restart after .env.local changes

Write-Host "🔄 Restarting Velirion Development Server..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Write-Host "⏹️  Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Clear Next.js cache
Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Ready to start!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
Write-Host ""
