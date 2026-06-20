Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setting up Passwordless SSH Key       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SSH_DIR = "$env:USERPROFILE\.ssh"
$KEY_PATH = "$SSH_DIR\id_rsa"
$PUBKEY_PATH = "$KEY_PATH.pub"

# 1. Generate SSH key if it does not exist
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "Generating a new SSH key locally..." -ForegroundColor Yellow
    # Create SSH directory if it doesn't exist
    if (-not (Test-Path $SSH_DIR)) { New-Item -ItemType Directory -Path $SSH_DIR | Out-Null }
    # Run ssh-keygen non-interactively
    ssh-keygen -t rsa -b 2048 -N '""' -f $KEY_PATH
    Write-Host "SSH Key generated successfully." -ForegroundColor Green
} else {
    Write-Host "Existing SSH key found." -ForegroundColor Green
}

# 2. Get the public key content
$pubKey = Get-Content $PUBKEY_PATH -Raw
$pubKey = $pubKey.Trim()

Write-Host ""
Write-Host "Now, we will add your SSH key to the server authorized list." -ForegroundColor Yellow
Write-Host "Please enter your password (ch@1n@ND$tr@p) ONE LAST TIME below:" -ForegroundColor Cyan

# 3. Add the public key to the remote authorized_keys
ssh root@137.184.102.82 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$pubKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SSH KEY SETUP SUCCESSFUL!             " -ForegroundColor Green
    Write-Host "  You will no longer be asked for a     " -ForegroundColor Green
    Write-Host "  password when deploying!              " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to add SSH key to remote server." -ForegroundColor Red
}
