# Private Events Pages — Build Report (29/07/26)

Store: `boat-o-craigo.myshopify.com`  
Branch: `staging` only  
Theme: Boat O'Craigo — Staging (`#144118677588`)

## Deliverables

| File | Purpose |
|------|---------|
| `templates/page.weddings.json` | Weddings page section stack |
| `templates/page.meetings.json` | Corporate meetings page |
| `templates/page.other-celebrations.json` | Birthdays & family celebrations page |
| `snippets/boc-enquiry-form.liquid` | Shared popup enquiry form |
| `sections/boc-private-events-brochures.liquid` | Wedding brochure download buttons |
| `sections/boc-private-events-enquiry-cta.liquid` | CTA + modal enquiry trigger |
| `sections/boc-private-events-contact.liquid` | Email contact block |
| `assets/boc-private-events.css` | Private events section styles |
| `assets/boc-private-events.js` | Enquiry modal behaviour |

## Reused components (not rebuilt)

- `boc-whats-on-hero` — page heroes
- `boc-whats-on-intro` — intro copy blocks
- `boc-whats-on-venues` — photo gallery grid (updated to support link-free gallery tiles)
- `boc-visit-tasting` / `boc-visit-glasshouse` — alternating image + text features (Weddings)
- `boc-whats-on-testimonials` — wedding testimonials
- `boc-contact-final-cta` — phone CTA banner (Weddings)
- Visit page group booking modal now delegates to `boc-enquiry-form`

## Content ported directly

- Weddings hero, intro, pavilion/glasshouse/catering copy, tour CTA quote, testimonials (full text from live site), phone CTA
- Meetings & Other Celebrations intro copy (adapted from old `/private-events` page)
- Bucks-party exclusion note (Other Celebrations only)

## Content rewritten / split

- **Meetings** hero subheading — draft: *"Host corporate functions, offsites and business events overlooking the Yarra Valley."*
- **Other Celebrations** hero subheading — draft: *"Birthdays, milestones and family occasions among the vines."*
- Old combined Private Events gallery split across Meetings (function/table setups) and Other Celebrations (celebration moments) using existing theme photography as placeholders

## Open items — client input required

| Item | Status |
|------|--------|
| Wedding brochure PDF URLs (2026–27 and 2028) | Buttons disabled until URLs added in Theme Editor |
| Weddings phone number `0456216978` | Wired as specified — confirm still current |
| Destination email for enquiry forms | Forms use Shopify contact form → store notification email; tagged `event-enquiry`. Confirm routing to `events@boatocraigo.com.au` (and whether weddings uses a separate inbox) |
| Gallery images (all three pages) | Placeholder estate photos — client to supply occasion-specific sets |
| Meetings / Other Celebrations hero subheadings | Draft copy — needs sign-off |
| Feature block photography (Pavilion, Glasshouse, catering) | Placeholder images — client may want dedicated wedding photography |

## Setup scripts

```powershell
# Create Shopify pages (skip if pages already exist)
shopify store execute --store boat-o-craigo.myshopify.com `
  --query-file scripts/shopify-create-private-events-pages.graphql `
  --variable-file scripts/shopify-create-private-events-pages.json `
  --allow-mutations

# Assign templates (replace IDs from pages query)
shopify store execute --store boat-o-craigo.myshopify.com `
  --query-file scripts/shopify-assign-private-events-templates.graphql `
  --variables '{"weddingsId":"gid://shopify/Page/...","meetingsId":"gid://shopify/Page/...","otherCelebrationsId":"gid://shopify/Page/..."}' `
  --allow-mutations

# Update main menu
shopify store execute --store boat-o-craigo.myshopify.com `
  --query-file scripts/shopify-update-main-menu.graphql `
  --variable-file scripts/shopify-update-main-menu.json `
  --allow-mutations
```

## Preview URLs (after deploy)

- Weddings: `/pages/weddings?preview_theme_id=144118677588`
- Meetings: `/pages/meetings?preview_theme_id=144118677588`
- Other Celebrations: `/pages/other-celebrations?preview_theme_id=144118677588`
