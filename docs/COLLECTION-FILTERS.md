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

## Recommended Search & Discovery filters

Configure in **Shopify Admin → Search & Discovery → Filters**:

| Filter | Suggested source |
|--------|------------------|
| Availability | Shopify default |
| Price | Shopify default |
| Wine type | Product type or `wine.wine_type` metafield (create if needed) |
| Vintage | `wine.vintage` (defined) |
| Variety | `wine.variety_blend` (defined) |
| Range | `wine.label_range` (defined) |

Mockup reference values (for merchant setup only — not hard-coded in Liquid):

- Wine type: Sparkling, White, Rosé, Red, Reserve, Museum
- Vintage: product vintages in catalogue
- Price: Under $40, $40–$59, $60+

## Product metafields (`wine` namespace)

Already defined and populated on imported products:

- `wine.vintage`
- `wine.variety_blend`
- `wine.label_range`

Optional (create before use in Liquid):

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

## Manual setup steps

1. Open **Search & Discovery** and add filters for the Wines collection.
2. Upload a **collection image** for each collection (Products → Collections → [Collection] → Image).
3. Optionally create collection/product metafield definitions under namespace `wine`.
4. Preview on staging: `/collections/wines?preview_theme_id=144118677588`

Filters are **documented only** until configured in Search & Discovery Admin.
