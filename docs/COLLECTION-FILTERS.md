# Collection Filters — Boat O'Craigo

Store: `boat-o-craigo.myshopify.com`  
Last updated: 2026-07-14

## Default collection template

- **Template:** `templates/collection.json`
- **Main section:** `sections/boc-main-collection.liquid`
- **Products per page:** 9 (server-side `{% paginate collection.products by 9 %}`)

All collections use this default unless another template suffix is explicitly assigned.

## Filtering architecture

Filtering, sorting, and AJAX section updates reuse Horizon's native implementation:

- `blocks/filters.liquid`
- `assets/facets.js`
- `collection.filters` and `collection.sort_options` from Shopify Search & Discovery

BOC styling is applied via `assets/boc-collection.css`. Do not implement client-side product filtering.

## Search & Discovery filters (configured)

Theme rendering is ready. Filter **sources** are prepared via Admin API; filter **registration** is done in Search & Discovery (no public Admin API).

### Automated setup (2026-07-14)

| Step | Status | Script / command |
|------|--------|------------------|
| Enable `adminFilterable` on `wine.vintage`, `wine.variety_blend`, `wine.label_range` | Done | `scripts/shopify-enable-wine-filter-metafields.graphql` |
| Wines collection membership (29 wines) | Done | Collection `wines` (`gid://shopify/Collection/301712080980`) |
| Gift Packs collection (10 products) | Done | Collection `gift-packs` (`gid://shopify/Collection/301712113748`) |

Verify metafield capabilities:

```powershell
shopify store execute --store boat-o-craigo.myshopify.com --query-file scripts/shopify-query-wine-metafield-capabilities.graphql --json
```

### Filters to add in Search & Discovery

Open: [Search & Discovery → Filters](https://admin.shopify.com/store/boat-o-craigo/apps/search-and-discovery/filters)

Or run: `.\scripts\open-search-discovery-filters.ps1`

| Filter label | Source in app | Notes |
|--------------|---------------|-------|
| Availability | **Availability** (standard) | Enabled by default on app install |
| Price | **Price** (standard) | Enabled by default on app install |
| Wine type | **Product type** (standard) | Values: White, Red, Sparkling, Rosé, Gift Packs |
| Vintage | **Product metafield** → `wine.vintage` | Integer metafield |
| Variety | **Product metafield** → `wine.variety_blend` | Single line text |
| Range | **Product metafield** → `wine.label_range` | Single line text (e.g. Black Spur, Braveheart) |

After adding filters, preview on staging:

`/collections/wines?preview_theme_id=144118677588`

Or live (password-protected): `/collections/wines`

### Verify filter registration

```powershell
node scripts/configure-search-discovery-filters.mjs
```

This confirms metafield capabilities. Search & Discovery filter list itself has no public Admin API.

## Product metafields (`wine` namespace)

Used by collection cards and product detail:

- `wine.vintage` — filterable
- `wine.variety_blend` — filterable
- `wine.label_range` — filterable

Wine type on cards uses `product.type` (fallback if `wine.wine_type` is blank).

Optional (not created):

- `wine.wine_type`
- `wine.badge_label`
- `wine.badge_style`

## Collection hero metafields (optional)

Under `wine` namespace — not created by default:

- `wine.hero_eyebrow`
- `wine.hero_heading`
- `wine.hero_description`
- `wine.hero_image`
- `wine.hero_mobile_image`
- `wine.hero_overlay_opacity`

Priority chain:

1. Metafield override (when enabled in Theme Editor)
2. `collection.image` / `collection.title` / `collection.description`
3. Section fallback image and copy
4. Theme asset fallback (`boc-estate-vineyard.jpg`)

## Scripts reference

| Script | Purpose |
|--------|---------|
| `scripts/shopify-enable-wine-filter-metafields.graphql` | Enable filterable wine metafields |
| `scripts/shopify-query-wine-metafield-capabilities.graphql` | Audit metafield filter capabilities |
| `scripts/shopify-query-collections.graphql` | Collection IDs and product counts |
| `scripts/configure-search-discovery-filters.mjs` | Verify prerequisites + print admin checklist |
| `scripts/open-search-discovery-filters.ps1` | Open filter config in Admin |
