$ErrorActionPreference = "Stop"

$Store = "boat-o-craigo.myshopify.com"
$LiveThemeId = "144115499092"

$themeRoot = Split-Path -Parent $PSScriptRoot
Set-Location $themeRoot

$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Error "Must be on the main branch. Current branch: $currentBranch"
    exit 1
}

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Error "Working tree has uncommitted changes. Commit or stash before deploying."
    exit 1
}

git fetch origin main
$localMain = git rev-parse main
$remoteMain = git rev-parse origin/main
if ($localMain -ne $remoteMain) {
    Write-Error "Local main does not match origin/main. Push or pull before deploying."
    exit 1
}

if ($LiveThemeId -eq "REPLACE_WITH_CONFIRMED_LIVE_THEME_ID") {
    Write-Error "Live theme ID is still a placeholder. Update scripts/push-production.ps1 with the confirmed ID from docs/THEME-MAPPING.md."
    exit 1
}

Write-Host "Running Theme Check..."
& "$PSScriptRoot\shopify-theme-check.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "WARNING: This will overwrite the active Boat O'Craigo Shopify theme."
$confirmation = Read-Host "Type DEPLOY LIVE to continue"

if ($confirmation -ne "DEPLOY LIVE") {
    Write-Error "Production deployment cancelled."
    exit 1
}

Write-Host "Deploying to live Shopify theme $LiveThemeId..."
shopify theme push `
    --store $Store `
    --theme $LiveThemeId `
    --allow-live

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Production deployment complete."
