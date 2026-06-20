@echo off
echo ========================================
echo   Deploying Updates to DigitalOcean...
echo ========================================
echo.

echo [1/4] Bundling local frontend files...
if exist deploy.tar.gz del deploy.tar.gz
tar -czf deploy.tar.gz app components context lib package.json package-lock.json next.config.mjs tailwind.config.js postcss.config.mjs jsconfig.json .eslintrc.json
if not exist deploy.tar.gz (
    echo ERROR: Failed to create deploy.tar.gz
    pause
    exit /b 1
)

echo [2/4] Uploading bundle to server...
scp deploy.tar.gz root@137.184.102.82:/root/chain-frontend/
if %ERRORLEVEL% neq 0 (
    echo ERROR: Upload failed.
    del deploy.tar.gz
    pause
    exit /b 1
)

echo [3/4] Extracting, cleaning cache, and building on server...
ssh root@137.184.102.82 "cd /root/chain-frontend && tar -xzf deploy.tar.gz && rm deploy.tar.gz && rm -rf .next && npm run build && pm2 restart chain-frontend"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Server build failed.
    del deploy.tar.gz
    pause
    exit /b 1
)

echo [4/4] Cleaning up local temporary files...
del deploy.tar.gz

echo.
echo ========================================
echo   DEPLOYMENT SUCCESSFUL!
echo   Please refresh your website.
echo ========================================
rem pause

