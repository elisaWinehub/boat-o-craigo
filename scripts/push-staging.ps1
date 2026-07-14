$ErrorActionPreference = "Stop"

$Store = "boat-o-craigo.myshopify.com"
$StagingThemeId = "144118677588"

$themeRoot = Split-Path -Parent $PSScriptRoot
Set-Location $themeRoot

$currentBranch = git branch --show-current
if ($currentBranch -ne "staging") {
    Write-Error "Must be on the staging branch. Current branch: $currentBranch"
    exit 1
}

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Error "Working tree has uncommitted changes. Commit or stash before deploying."
    exit 1
}

if ($StagingThemeId -eq "REPLACE_WITH_CONFIRMED_STAGING_THEME_ID") {
    Write-Error "Staging theme ID is still a placeholder. Update scripts/push-staging.ps1 with the confirmed ID from docs/THEME-MAPPING.md."
    exit 1
}

Write-Host "Running Theme Check..."
& "$PSScriptRoot\shopify-theme-check.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing to origin/staging..."
git push origin staging
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploying to Shopify staging theme $StagingThemeId..."
shopify theme push `
    --store $Store `
    --theme $StagingThemeId `
    --nodelete

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Opening staging theme preview..."
shopify theme open `
    --store $Store `
    --theme $StagingThemeId

Write-Host "Staging deployment complete."
