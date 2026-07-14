# Boat O'Craigo Wine Metafields

Store: `boat-o-craigo.myshopify.com`  
Date confirmed: 2026-07-14  
Namespace: `wine`  
Owner type: `PRODUCT`

These product metafield definitions mirror the WineHub product import spreadsheet schema so future CSV/API imports map cleanly to structured fields instead of burying data in the product description.

Liquid access pattern: `product.metafields.wine.<key>`

---

## Tier 1 — create and populate now

Data for these fields already exists in the WineHub spreadsheet for all 27 current wine products.

| Key | Name | Type | Notes | Status |
|---|---|---|---|---|
| `vintage` | Vintage | `number_integer` | e.g. 2023 | Created |
| `region` | Region | `single_line_text_field` | e.g. Victoria | Created |
| `subregion` | Subregion | `single_line_text_field` | e.g. Yarra Valley | Created |
| `country` | Country | `single_line_text_field` | e.g. Australia | Created |
| `variety_blend` | Variety / Blend | `single_line_text_field` | Composed summary, e.g. "80% Chardonnay, 20% Pinot Noir" | Created |
| `abv` | Alcohol by Volume (%) | `number_decimal` | Stored as a percentage, e.g. 12.0, not a fraction | Created |
| `bottle_size_ml` | Bottle Size (mL) | `number_integer` | e.g. 750 | Created |
| `closure` | Closure Type | `single_line_text_field` | e.g. Cork | Created |
| `standard_drinks` | Standard Drinks | `number_decimal` | e.g. 7.1 | Created |
| `winemaker` | Winemaker | `single_line_text_field` | e.g. Rob Hall | Created |
| `label_range` | Label / Range | `single_line_text_field` | Sub-brand extracted from product title, e.g. Black Spur, Kincardine, Rob Roy, Braveheart, First Duke Reserve, Black Cameron, N'oubliez, or Boat O'Craigo for estate-label wines | Created |

## Tier 2 — create now, populate later

Definitions exist; values remain empty until future product drops.

| Key | Name | Type | Notes | Status |
|---|---|---|---|---|
| `serving_temp_c` | Serving Temperature (°C) | `number_integer` | | Created |
| `ph` | pH | `number_decimal` | | Created |
| `acidity` | Acidity (g/L) | `number_decimal` | | Created |
| `tasting_eyes` | Tasting Note — Appearance | `multi_line_text_field` | | Created |
| `tasting_nose` | Tasting Note — Aroma | `multi_line_text_field` | | Created |
| `tasting_mouth` | Tasting Note — Palate | `multi_line_text_field` | | Created |
| `winemaking_notes` | Winemaking Notes | `rich_text` | Shopify API type: `rich_text_field` | Created |
| `ageing_process` | Ageing Process | `rich_text` | Shopify API type: `rich_text_field` | Created |
| `harvest_date` | Harvest Date | `date` | | Created |
| `release_date` | Release Date | `date` | | Created |

**Total:** 21 of 21 definitions created in Shopify Admin (verified via Admin GraphQL API, 2026-07-14).

---

## Category metafields already available

**Product category (planned):** `Food, Beverages & Tobacco > Beverages > Alcoholic Beverages > Wine`

**API checks performed (2026-07-14):**

1. **`standardMetafieldDefinitionTemplates`** — Queried up to 250 Shopify standard metafield templates. No templates matched wine, alcohol, ABV, beverage, or grape-related names/keys in the result set.
2. **Existing products** — Only `Gift Card` exists in the store today; its `category` is `null`, so no category attribute panel is available to inspect via API yet.
3. **Existing `wine.*` definitions before this task** — None (empty namespace prior to creation).

**Admin UI verification:** Not performed in this environment. After wine products are imported with the Wine category assigned, confirm in **Settings → Custom data → Products** and on a product's category panel whether Shopify suggests built-in category metafields (e.g. alcohol content).

**Overlap decision:** No Shopify standard category metafield was confirmed to duplicate `wine.abv` or any other custom key. All 21 custom `wine.*` definitions were created, including `wine.abv`.

---

## Creation methods

| Method | Status |
|---|---|
| `scripts/create-metafields.mjs` (requires `SHOPIFY_ADMIN_API_TOKEN` in local `.env`) | Ready — not run (no `.env` token) |
| `shopify store execute --allow-mutations` with stored `shopify store auth` | Used to create and verify all 21 definitions |

To re-run idempotently with a custom app token:

```powershell
# .env (local only, gitignored)
SHOPIFY_ADMIN_API_TOKEN=shpat_...
SHOPIFY_STORE=boat-o-craigo.myshopify.com

node scripts/create-metafields.mjs
```

Required scope: `write_products` (for `metafieldDefinitionCreate`).

---

## Product import CSV columns (when importing)

When `boc-shopify-products-import.csv` is prepared, add columns in this format:

```text
Metafield: wine.vintage [number_integer]
Metafield: wine.region [single_line_text_field]
...
Metafield: wine.winemaking_notes [rich_text_field]
Metafield: wine.ageing_process [rich_text_field]
```

Reference in theme Liquid: `{{ product.metafields.wine.vintage }}`, etc.
