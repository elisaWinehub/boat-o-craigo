# Deployment Guide — Boat O'Craigo

This document describes the complete development and deployment workflow for the Boat O'Craigo Horizon Shopify theme.

## Overview

Local theme files are the source of truth. Changes flow through Git branches and dedicated Shopify themes before reaching production.

```text
DEVELOPMENT

Local staging branch
        ↓
Commit and push
        ↓
GitHub staging branch
        ↓
Shopify unpublished staging theme
        ↓
QA / client approval

PRODUCTION

Merge staging into main
        ↓
Push GitHub main branch
        ↓
Push main to active Shopify theme
```

## Branches

| Branch    | Purpose                                      |
|-----------|----------------------------------------------|
| `staging` | Day-to-day development and QA deployments    |
| `main`    | Approved production-ready code               |

Optional short-lived feature branches may be created from `staging` and merged back with `--no-ff`.

**Rules:**

- Never develop directly on `main`.
- Never deploy `staging` code directly to the live theme.
- Never force-push branches.

## Shopify Themes

| Environment | Theme name                  | Status       |
|-------------|-----------------------------|--------------|
| Staging     | Boat O'Craigo — Staging     | Unpublished  |
| Production  | _(see THEME-MAPPING.md)_    | Live         |

Theme IDs are recorded in [THEME-MAPPING.md](./THEME-MAPPING.md). Do not guess or hardcode IDs without confirming them via `shopify theme list`.

### Staging vs local development

| Method              | Purpose                                      |
|---------------------|----------------------------------------------|
| `shopify theme dev` | Temporary developer preview while coding     |
| Staging theme push  | Stable QA and client-review environment      |

Development themes created by `theme dev` can be removed after inactivity. The unpublished staging theme is persistent.

## Daily Development Workflow

Always begin from `staging`:

```powershell
cd C:\workspace\dev-store\boat-o-craigo
git switch staging
git pull --ff-only origin staging
```

Develop locally in: `sections/`, `snippets/`, `templates/`, `assets/`, `config/`, `locales/`.

Use Shopify local preview while coding:

```powershell
shopify theme dev --store boat-o-craigo.myshopify.com
```

Before committing:

```powershell
shopify theme check
git status
git diff
```

Commit with a descriptive message:

```powershell
git add .
git commit -m "feat: describe your change"
```

Deploy to staging:

```powershell
.\scripts\push-staging.ps1
```

This pushes to `origin/staging` and deploys to the unpublished Shopify staging theme.

## Production Deployment

After the staging theme is reviewed and approved:

```powershell
git switch main
git pull --ff-only origin main
git merge --no-ff staging
shopify theme check
git push origin main
.\scripts\push-production.ps1
```

The production script requires typing `DEPLOY LIVE` to confirm. It deploys to the active live theme only from `main`.

After production deployment, synchronise `staging` with `main`:

```powershell
git switch staging
git merge main
git push origin staging
```

## Deployment Scripts

| Script                          | Branch    | Target                    |
|---------------------------------|-----------|---------------------------|
| `scripts/shopify-theme-check.ps1` | Any       | Runs Theme Check only     |
| `scripts/push-staging.ps1`        | `staging` | Unpublished staging theme |
| `scripts/push-production.ps1`     | `main`    | Live production theme     |

### Pre-deployment checklist

Before every Shopify push:

```powershell
shopify theme check
git status
git branch --show-current
```

The deployment scripts enforce:

- Correct Git branch
- Clean working tree
- Passing Theme Check
- Confirmed theme IDs (no placeholders)

## Sensitive Configuration Files

Treat these files carefully:

```text
config/settings_data.json
templates/*.json
sections/*.json
```

Theme Editor changes can modify JSON templates and theme settings. Before deploying, review `git diff` for unexpected configuration changes.

Do not pull remote Theme Editor changes over local code without reviewing the diff.

Never blindly run `shopify theme pull` against the live theme inside the working `staging` branch.

## Safety Rules

Do not:

- Deploy with uncommitted changes
- Deploy production from `staging`
- Publish the staging theme
- Overwrite the live theme during routine development
- Store Shopify passwords, tokens, or credentials in Git
- Commit `.env`, `.shopify`, or local CLI session files
- Use interactive theme selection in deployment scripts
