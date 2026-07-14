$ErrorActionPreference = "Stop"

$themeRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $themeRoot "config\settings_schema.json"))) {
    Write-Error "This script must be run from the theme root (config/settings_schema.json not found)."
    exit 1
}

Set-Location $themeRoot

Write-Host "Running Shopify Theme Check..."

shopify theme check

if ($LASTEXITCODE -ne 0) {
    Write-Error "Theme Check failed. Deployment stopped."
    exit $LASTEXITCODE
}

Write-Host "Theme Check passed."
