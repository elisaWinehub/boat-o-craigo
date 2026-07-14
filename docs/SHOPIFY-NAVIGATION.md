# Shopify Navigation — Boat O'Craigo

Store: `boat-o-craigo.myshopify.com`  
Last updated: 2026-07-14

## Main menu (`main-menu`)

Assigned in: **Theme Editor → Header → BOC — Header → Menu**

| Link | URL | Type |
|------|-----|------|
| Shop | `/collections/wines` | Parent with dropdown |
| → Wines | `/collections/wines` | Collection |
| → Experiences | `/pages/visit` | Page |
| → Gift Packs | `/collections/gift-packs` | Collection |
| → Gift Cards | `/products/gift-card` | Product (placeholder URL) |
| Wine Club | `/pages/wine-club` | Page |
| Visit | `/pages/visit` | Page |
| What's On | `/pages/whats-on` | Page |
| About | `/pages/about` | Page |
| Contact | `/pages/contact` | Page |

**Book a Visit** is a separate header CTA button → `/pages/book-now` (not in main menu).

## Footer menus

Assigned in: **Theme Editor → Footer → BOC — Footer**

| Menu handle | Links |
|-------------|-------|
| `footer-shop` | Wines, Gift Packs, Gift Cards, Wine Club |
| `footer-visit` | Cellar Door, Restaurant, Weddings & Events, Book a Visit |
| `footer-discover` | Our Story, What's On, Contact, FAQs |
| `footer-legal` | Terms, Privacy, Shipping |

## Pages created

| Handle | Title | Template |
|--------|-------|----------|
| `contact` | Contact | Default page |
| `wine-club` | Wine Club | `page.wine-club` |
| `visit` | Visit | `page.visit` |
| `whats-on` | What's On | `page.whats-on` |
| `about` | About | Default page |
| `book-now` | Book Now | Default page |
| `faqs` | FAQs | Default page |

## Collections created

| Handle | Title |
|--------|-------|
| `wines` | Wines |
| `gift-packs` | Gift Packs |

## Manual follow-up

- Create a **Gift Card** product with handle `gift-card` if the Gift Cards link should resolve (currently points to `/products/gift-card`).
- Add shop policies in **Settings → Policies** if Terms / Privacy / Shipping policy pages are empty.

## Setup scripts

Reusable Admin API scripts are in `scripts/`:

- `shopify-create-pages.graphql` / `.json`
- `shopify-create-collections.graphql` / `.json`
- `shopify-update-main-menu.graphql` / `.json`
- `shopify-create-footer-menus.graphql`

Run with:

```powershell
shopify store auth --store boat-o-craigo.myshopify.com --scopes read_content,write_content,write_online_store_pages,read_online_store_navigation,write_online_store_navigation,write_products

shopify store execute --store boat-o-craigo.myshopify.com --query-file scripts/shopify-update-main-menu.graphql --variable-file scripts/shopify-update-main-menu.json --allow-mutations
```
