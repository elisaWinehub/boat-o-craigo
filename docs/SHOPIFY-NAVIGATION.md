# Shopify Navigation — Boat O'Craigo

Store: `boat-o-craigo.myshopify.com`

Navigation menus must be created and assigned in **Shopify Admin → Content → Menus**. The theme uses menu pickers in the header and footer sections; links are not hard-coded.

## Main menu (`main-menu`)

Assigned in: **Theme Editor → Header → BOC — Header → Menu**

Recommended structure:

| Top level | Child links | Recommended URL |
|-----------|-------------|-----------------|
| Shop | Wines | `/collections/wines` |
| | Experiences | `/pages/visit` |
| | Gift Packs | `/collections/gift-packs` |
| | Gift Cards | `/products/gift-card` |
| Wine Club | — | `/pages/wine-club` |
| Visit | — | `/pages/visit` |
| What's On | — | `/pages/whats-on` |
| About | — | `/pages/about` |
| Contact | — | `/pages/contact` |
| Book a Visit | — | `/pages/book-now` |

Some pages and collections may not exist yet. Create placeholder pages in Admin or use relative URLs until content is ready.

## Footer menus

Assigned in: **Theme Editor → Footer → BOC — Footer**

| Setting | Recommended handle | Example links |
|---------|-------------------|---------------|
| Shop menu | `footer-shop` | Wines, Gift Packs, Gift Cards, Wine Club |
| Visit menu | `footer-visit` | Cellar Door, Restaurant, Weddings & Events, Book a Visit |
| Discover menu | `footer-discover` | Our Story, What's On, Contact, FAQs |
| Legal menu | `footer-legal` | Terms, Privacy, Shipping |

## Book a Visit CTA

The header **Book a visit** button uses a separate URL setting (default: `/pages/book-now`), not the main menu.

## Status

- **Theme configuration:** Header and footer menu pickers are configured in `sections/header-group.json` and `sections/footer-group.json`.
- **Admin API menu creation:** Not available via Shopify CLI theme auth alone. Menus must be created or updated manually in Shopify Admin unless Admin API access is added separately.

After creating menus, assign the handles above in Theme Editor and verify links on the staging theme preview.
