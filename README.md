# Boat O'Craigo — Horizon Theme

Shopify Horizon theme for [Boat O'Craigo](https://boat-o-craigo.myshopify.com).

**Store domain:** `boat-o-craigo.myshopify.com`

## Local Setup

1. Clone the repository:

   ```powershell
   git clone https://github.com/elisaWinehub/boat-o-craigo.git
   cd boat-o-craigo
   ```

2. Install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) and authenticate:

   ```powershell
   shopify theme list --store boat-o-craigo.myshopify.com
   ```

3. Switch to the development branch:

   ```powershell
   git switch staging
   ```

4. Start local preview:

   ```powershell
   shopify theme dev --store boat-o-craigo.myshopify.com
   ```

## Branch Workflow

| Branch    | Purpose                                   |
|-----------|-------------------------------------------|
| `staging` | Active development — start all work here  |
| `main`    | Approved production code only             |

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

## Shopify Theme Workflow

- **Staging theme:** `Boat O'Craigo — Staging` (unpublished) — stable QA environment
- **Production theme:** Active live theme — see [docs/THEME-MAPPING.md](docs/THEME-MAPPING.md)

Local files are the source of truth. Do not use the Shopify Theme Editor as the primary development environment.

## Commands

```powershell
# Start work
git switch staging
git pull --ff-only origin staging
shopify theme dev --store boat-o-craigo.myshopify.com

# Validate
shopify theme check

# Deploy staging
.\scripts\push-staging.ps1

# Deploy production after approval
git switch main
git merge --no-ff staging
git push origin main
.\scripts\push-production.ps1
```

## Deployment Rules

- **Never** deploy directly to the live theme from `staging`.
- **Never** develop directly on `main`.
- Always run Theme Check before deploying.
- Always commit changes before running deployment scripts.
- Production deployment requires typing `DEPLOY LIVE` in the production script.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the complete workflow.

## Documentation

- [Deployment guide](docs/DEPLOYMENT.md)
- [Theme ID mapping](docs/THEME-MAPPING.md)
