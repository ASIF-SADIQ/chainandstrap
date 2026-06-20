$SERVER = "root@137.184.102.82"
$REMOTE = "/root/chain-frontend"


Write-Host "Uploading components..." -ForegroundColor Yellow
scp components/* "${SERVER}:${REMOTE}/components/"

Write-Host "Building website on server..." -ForegroundColor Yellow
ssh "${SERVER}" "cd ${REMOTE} && npm run build && pm2 restart all"

Write-Host "Done! Refresh website!" -ForegroundColor Green
