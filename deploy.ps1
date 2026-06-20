$SERVER = "root@137.184.102.82"
$REMOTE = "/root/chain-frontend"


Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chain & Straps - Clean Deploy Script  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------
# STEP 1: Frontend folders (one by one - NO node_modules)
# -----------------------------------------------
Write-Host "[1/3] Uploading Frontend..." -ForegroundColor Yellow

# Upload individual frontend folders (safe - none have node_modules)
scp -r app "${SERVER}:${REMOTE}/"
scp -r components "${SERVER}:${REMOTE}/"
scp -r context "${SERVER}:${REMOTE}/"
scp -r lib "${SERVER}:${REMOTE}/"

# Upload frontend config files
scp package.json "${SERVER}:${REMOTE}/"
scp package-lock.json "${SERVER}:${REMOTE}/"
scp next.config.mjs "${SERVER}:${REMOTE}/"
scp tailwind.config.js "${SERVER}:${REMOTE}/"
scp postcss.config.mjs "${SERVER}:${REMOTE}/"
scp jsconfig.json "${SERVER}:${REMOTE}/"
scp .eslintrc.json "${SERVER}:${REMOTE}/"

Write-Host "[1/3] Frontend Done!" -ForegroundColor Green
Write-Host ""

# -----------------------------------------------
# STEP 2: Backend (only source files, NO node_modules)
# -----------------------------------------------
Write-Host "[2/3] Uploading Backend source files..." -ForegroundColor Yellow

# Create backend dir on server first
ssh "${SERVER}" "mkdir -p ${REMOTE}/backend"

# Upload backend source folders
scp -r backend/controllers "${SERVER}:${REMOTE}/backend/"
scp -r backend/models "${SERVER}:${REMOTE}/backend/"
scp -r backend/routes "${SERVER}:${REMOTE}/backend/"
scp -r backend/services "${SERVER}:${REMOTE}/backend/"
scp -r backend/middleware "${SERVER}:${REMOTE}/backend/"
scp -r backend/config "${SERVER}:${REMOTE}/backend/"

# Upload backend essential files
scp backend/server.js "${SERVER}:${REMOTE}/backend/"
scp backend/package.json "${SERVER}:${REMOTE}/backend/"
scp backend/package-lock.json "${SERVER}:${REMOTE}/backend/"
scp backend/setupIndexes.js "${SERVER}:${REMOTE}/backend/"
scp backend/importData.js "${SERVER}:${REMOTE}/backend/"
scp backend/automation.js "${SERVER}:${REMOTE}/backend/"
scp backend/createAdmin.js "${SERVER}:${REMOTE}/backend/"
scp backend/.env "${SERVER}:${REMOTE}/backend/"

Write-Host "[2/3] Backend Done!" -ForegroundColor Green
Write-Host ""

# -----------------------------------------------
# STEP 3: Admin Panel source only (NO node_modules, NO dist)
# -----------------------------------------------
Write-Host "[3/3] Uploading Admin Panel source..." -ForegroundColor Yellow

ssh "${SERVER}" "mkdir -p ${REMOTE}/admin-panel"

scp -r admin-panel/src "${SERVER}:${REMOTE}/admin-panel/"
scp -r admin-panel/public "${SERVER}:${REMOTE}/admin-panel/"
scp admin-panel/package.json "${SERVER}:${REMOTE}/admin-panel/"
scp admin-panel/package-lock.json "${SERVER}:${REMOTE}/admin-panel/"
scp admin-panel/index.html "${SERVER}:${REMOTE}/admin-panel/"
scp admin-panel/vite.config.js "${SERVER}:${REMOTE}/admin-panel/"
scp admin-panel/eslint.config.js "${SERVER}:${REMOTE}/admin-panel/"

Write-Host "[3/3] Admin Panel Done!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALL FILES UPLOADED! NOW RUN ON SERVER:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  cd /var/www/html && npm install && npm run build" -ForegroundColor White
Write-Host "  cd /var/www/html/backend && npm install" -ForegroundColor White
Write-Host "  cd /var/www/html/admin-panel && npm install && npm run build" -ForegroundColor White
Write-Host "  pm2 restart all" -ForegroundColor White
