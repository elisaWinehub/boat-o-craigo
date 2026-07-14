# Implementation State — Boat O'Craigo Horizon Theme

Project: Boat O'Craigo Horizon Shopify theme  
Store: `boat-o-craigo.myshopify.com`  
Theme IDs: see [THEME-MAPPING.md](./THEME-MAPPING.md)

## Completed

- Global design tokens and CSS foundation
- Theme settings group: **Boat O'Craigo — Global Design**
- Announcement bar (`boc-announcement-bar`)
- Header with desktop nav, mobile drawer, Horizon search/cart/account
- Footer with menu pickers and contact defaults
- Header/footer section groups wired globally
- Homepage sections (10 modular sections)
- Homepage template (`templates/index.json`)
- Approved mockup archived at `docs/mockups/boat-ocraigo-homepage-concept.html`
- Wine Club page template
- Wine Club hero
- Membership plans
- Member benefits
- How it works
- Estate experience
- Wine Club FAQ
- Final CTA

## Global component files

| File | Purpose |
|------|---------|
| `assets/boc-design-tokens.css` | CSS variables and shared classes |
| `assets/boc-global.css` | Base typography and utilities |
| `assets/boc-header.css` | Header and mobile drawer |
| `assets/boc-footer.css` | Footer |
| `assets/boc-header.js` | Mobile navigation |
| `assets/boc-logo.svg` | Default logo fallback |
| `snippets/boc-fonts.liquid` | Libre Caslon Display + DM Sans |
| `snippets/boc-button.liquid` | Reusable button |
| `snippets/boc-icon.liquid` | SVG icons |
| `snippets/boc-section-header.liquid` | Section heading pattern |
| `snippets/boc-responsive-image.liquid` | Responsive images |
| `snippets/boc-product-card.liquid` | Product card (design-system compliant) |
| `sections/boc-announcement-bar.liquid` | Global announcement |
| `sections/boc-header.liquid` | Global header |
| `sections/boc-footer.liquid` | Global footer |
| `sections/header-group.json` | Announcement + header |
| `sections/footer-group.json` | Footer |

## Homepage section files

| Section | File |
|---------|------|
| Hero slider | `sections/boc-home-hero-slider.liquid` |
| Quick links | `sections/boc-home-quick-links.liquid` |
| Featured wines | `sections/boc-home-featured-wines.liquid` |
| Story | `sections/boc-home-story.liquid` |
| Experiences | `sections/boc-home-experiences.liquid` |
| Wine Club | `sections/boc-home-wine-club.liquid` |
| Weddings | `sections/boc-home-weddings.liquid` |
| Events | `sections/boc-home-events.liquid` |
| Journal | `sections/boc-home-journal.liquid` |
| Newsletter | `sections/boc-home-newsletter.liquid` |
| Styles / JS | `assets/boc-home.css`, `assets/boc-home.js` |
| Template | `templates/index.json` |

## Wine Club section files

| Section | File |
|---------|------|
| Hero | `sections/boc-wine-club-hero.liquid` |
| Membership plans | `sections/boc-wine-club-plans.liquid` |
| Member benefits | `sections/boc-wine-club-benefits.liquid` |
| How it works | `sections/boc-wine-club-how-it-works.liquid` |
| Estate experience | `sections/boc-wine-club-estate-experience.liquid` |
| FAQ | `sections/boc-wine-club-faq.liquid` |
| Final CTA | `sections/boc-wine-club-final-cta.liquid` |
| Plan card snippet | `snippets/boc-wine-club-plan-card.liquid` |
| FAQ item snippet | `snippets/boc-faq-item.liquid` |
| Styles / JS | `assets/boc-wine-club.css`, `assets/boc-wine-club.js` |
| Template | `templates/page.wine-club.json` |
| Mockup | `docs/mockups/boat-ocraigo-wine-club-concept.html` |

**Global components reused:** announcement bar, header, mobile navigation, footer, design tokens, `boc-button`, `boc-responsive-image`, `boc-eyebrow`, `boc-display` typography classes.

**Pending (Wine Club):**
- Confirm Wine Club app
- Connect membership join actions
- Replace placeholder FAQ copy
- Confirm final membership terms

## Homepage image assets (theme `assets/`)

- `boc-hero-wines.png`
- `boc-hero-wine-club.png`
- `boc-estate-vineyard.jpg`
- `boc-estate-visit.jpg`
- `boc-placeholder-gruner-veltliner.jpg`
- `boc-logo.svg`

## Shopify menus

Configured and created in Shopify Admin (2026-07-14):

| Handle | Purpose |
|--------|---------|
| `main-menu` | Header navigation (Shop dropdown + 5 top-level links) |
| `footer-shop` | Footer Shop column |
| `footer-visit` | Footer Visit column |
| `footer-discover` | Footer Discover column |
| `footer-legal` | Footer legal links |

See [SHOPIFY-NAVIGATION.md](./SHOPIFY-NAVIGATION.md) for full link map and page list.

## Metafield definitions

- Namespace: `wine`
- Owner type: Product
- Definitions created: 21 of 21
- Definitions pending manual Admin API token setup: 0 (created via `shopify store execute` stored auth; `scripts/create-metafields.mjs` ready for `.env` token)
- Reference: [BOAT-O-CRAIGO-METAFIELDS.md](./BOAT-O-CRAIGO-METAFIELDS.md)

## Shopify Files

Images are stored in theme `assets/` and deploy with the theme. Upload to **Shopify Admin → Content → Files** is optional and was not performed via API (theme auth only).

## Next approved templates

- Collection
- Product
- Visit
- What's On
- About
- Book Now
- Contact
- Customer Account

## Rules for future tasks

1. Read this file before starting any new template work.
2. Read `docs/BOAT-O-CRAIGO-DESIGN-SYSTEM.md` and `docs/BOAT-O-CRAIGO-CURSOR-RULES.md`.
3. Reuse global header/footer — do not redesign without explicit request.
4. Reuse `boc-*` components and design tokens.
5. Prefix all custom files with `boc-`.
6. Never use `#F0F5ED`.
7. Product cards: white image background, no bottle shadow, no hover movement, `#212121` Add to Cart.
8. Deploy via `staging` branch and `scripts/push-staging.ps1` only.
