$SERVER = "root@137.184.102.82"
$REMOTE = "/root/chain-frontend"


Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chain & Straps - Tar Deploy Script    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Create a tar archive of all frontend files
Write-Host "[1/4] Bundling local frontend files..." -ForegroundColor Yellow
if (Test-Path deploy.tar.gz) { Remove-Item deploy.tar.gz }
tar -czf deploy.tar.gz app components context lib package.json package-lock.json next.config.mjs tailwind.config.js postcss.config.mjs jsconfig.json .eslintrc.json

if (-not (Test-Path deploy.tar.gz)) {
    Write-Host "ERROR: Failed to create deploy.tar.gz" -ForegroundColor Red
    exit 1
}
Write-Host "Bundle created successfully." -ForegroundColor Green
Write-Host ""

# 2. Upload the tarball to the server
Write-Host "[2/4] Uploading bundle to server..." -ForegroundColor Yellow
scp deploy.tar.gz "${SERVER}:${REMOTE}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SCP upload failed." -ForegroundColor Red
    Remove-Item deploy.tar.gz
    exit 1
}
Write-Host "Upload complete." -ForegroundColor Green
Write-Host ""

# 3. Extract and rebuild on the server
Write-Host "[3/4] Extracting, cleaning cache, and building on server..." -ForegroundColor Yellow
ssh "${SERVER}" "cd ${REMOTE} && tar -xzf deploy.tar.gz && rm deploy.tar.gz && rm -rf .next && npm run build && pm2 restart all"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Remote commands failed." -ForegroundColor Red
    Remove-Item deploy.tar.gz
    exit 1
}
Write-Host "Server build and restart complete." -ForegroundColor Green
Write-Host ""

# 4. Clean up local tarball
Write-Host "[4/4] Cleaning up local temporary files..." -ForegroundColor Yellow
Remove-Item deploy.tar.gz
Write-Host "Cleaned up!" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT SUCCESSFUL! Refresh your site! " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
