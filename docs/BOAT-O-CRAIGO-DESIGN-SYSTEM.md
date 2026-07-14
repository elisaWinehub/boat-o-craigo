# Boat O'Craigo — Web Brand & Design System

**Purpose:** This document is the single source of truth for all Boat O'Craigo Shopify theme development.  
All AI-assisted development, Cursor tasks, Liquid sections, snippets, templates, app blocks, and frontend changes must follow these rules.

Do not invent new colours, spacing scales, typography, button styles, card styles, or layout patterns unless the design system is deliberately updated first.

---

## 1. Brand Direction

Boat O'Craigo should feel:

- Premium but not formal
- Warm, understated and editorial
- Wine-led, not generic hospitality-led
- Contemporary without feeling trendy
- Spacious, restrained and image-first
- Family-owned, authentic and grounded in place

The visual language should resemble a refined Yarra Valley winery, not an eco brand, rustic farm shop, generic restaurant, or mass-market ecommerce store.

Avoid:

- Sage or pale green backgrounds
- Excessive rounded corners
- Heavy shadows
- Bright gradients
- Decorative icons without purpose
- Overly playful typography
- Dense content blocks
- Multiple competing CTAs
- Animation for animation's sake
- Generic AI-generated layouts

---

## 2. Brand Colour Palette

Use only these core colours unless explicitly approved.

```css
:root {
  --boc-ink: #212121;
  --boc-slate: #575962;
  --boc-sand: #B99E7E;
  --boc-cream: #FAF8F5;
  --boc-white: #FFFFFF;
  --boc-line: #E8E2D9;
  --boc-soft-grey: #F6F6F6;
  --boc-muted: #9A9A9A;
}
```

### Colour usage

| Token | Use |
|---|---|
| `#212121` | Main text, dark buttons, footer, dark feature sections |
| `#575962` | Secondary copy, captions, metadata |
| `#B99E7E` | Accent, highlights, selected states, badges, premium CTA sections |
| `#FAF8F5` | Warm neutral section background |
| `#FFFFFF` | Main page background, cards, product image backgrounds |
| `#E8E2D9` | Borders, dividers, form outlines |
| `#F6F6F6` | Light utility panels and form backgrounds |

### Prohibited colour

Do not use:

```css
#F0F5ED
```

This colour was explicitly rejected and must not appear anywhere in the theme.

---

## 3. Typography

### Font pairing

```css
--boc-serif: 'Libre Caslon Display', Georgia, serif;
--boc-sans: 'DM Sans', Arial, sans-serif;
```

### Usage

**Libre Caslon Display**
- Hero headings
- Section headings
- Product titles
- Card titles
- Modal titles
- Editorial quotes

**DM Sans**
- Body copy
- Navigation
- Buttons
- Product metadata
- Forms
- Labels
- Captions
- Utility text

### Type scale

```css
--boc-display-xl: clamp(4rem, 8vw, 7.7rem);
--boc-display-lg: clamp(3rem, 5vw, 5.4rem);
--boc-display-md: clamp(2.4rem, 4vw, 4rem);
--boc-heading-sm: 1.5rem;
--boc-body-lg: 1.05rem;
--boc-body: 1rem;
--boc-body-sm: 0.86rem;
--boc-label: 0.68rem;
```

### Rules

- Use sentence case, not title case, for headings.
- Headings should feel editorial and calm.
- Do not use more than two font families.
- Do not use bold serif headings.
- Avoid overly small body copy.
- Eyebrows must be uppercase with tracking.

Example:

```css
.boc-eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
```

---

## 4. Spacing System

Use a consistent 8px-based scale.

```css
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;
--space-7: 80px;
--space-8: 96px;
--space-9: 120px;
--space-10: 140px;
```

### Section spacing

Desktop:

```css
padding-block: 120px;
```

Luxury/editorial sections may use:

```css
padding-block: 140px;
```

Tablet:

```css
padding-block: 90px;
```

Mobile:

```css
padding-block: 72px;
```

### Container

```css
.boc-container {
  width: min(calc(100% - 48px), 1420px);
  margin-inline: auto;
}
```

Mobile:

```css
width: min(calc(100% - 32px), 1420px);
```

---

## 5. Global Header

The header must remain consistent across all templates.

### Desktop structure

One horizontal row only:

```text
Logo | Navigation | Book a Visit | Search | Account | Cart
```

Rules:

- Header height: `88px`
- Sticky header
- White background
- Bottom border: `1px solid #E8E2D9`
- Logo aligned to the same row as navigation and icons
- Do not create a second navigation row
- Do not centre the logo separately above the menu
- Do not make the header bulky

### Announcement bar

- Height: `34px`
- Background: `#212121`
- Text: white
- Small uppercase utility typography

### Navigation

Primary menu:

```text
Shop
Wine Club
Visit
What's On
About
Contact
Book a Visit
```

The `Book a Visit` item should appear as a dark CTA.

### Logo

Use:

```html
<img
  src="https://www.boatocraigo.com.au/dist/logos/website/logo.svg"
  alt="Boat O'Craigo"
  class="logo"
>
```

Preferred width:

```css
170px
```

---

## 6. Global Footer

The footer must also remain consistent across all templates.

### Footer styling

```css
background: #171717;
color: #FFFFFF;
```

### Footer content groups

```text
Brand / address / contact
Shop
Visit
Discover
Legal
```

Rules:

- Use white logo
- Keep links understated
- Avoid oversized newsletter blocks in the footer
- Use subtle dividers
- Footer spacing should feel generous
- Do not use bright or decorative backgrounds

---

## 7. Button System

All buttons must use one of these styles.

### Primary dark button

```css
.boc-btn-primary {
  background: #212121;
  border: 1px solid #212121;
  color: #FFFFFF;
}
```

### Accent button

```css
.boc-btn-accent {
  background: #B99E7E;
  border: 1px solid #B99E7E;
  color: #FFFFFF;
}
```

### Light outline button

```css
.boc-btn-light {
  background: transparent;
  border: 1px solid #FFFFFF;
  color: #FFFFFF;
}
```

### Dark outline button

```css
.boc-btn-outline {
  background: transparent;
  border: 1px solid #212121;
  color: #212121;
}
```

### Button rules

```css
min-height: 48px;
padding-inline: 24px;
font-size: 0.72rem;
font-weight: 600;
letter-spacing: 0.14em;
text-transform: uppercase;
border-radius: 0;
```

Do not:

- Use pill buttons
- Add large border radius
- Add box shadows
- Use gradient buttons
- Use more than two primary CTAs in one section

---

## 8. Hero Sections

### Homepage hero

- Full-width slider
- 3–5 slides
- Height: `min(92vh, 940px)`
- Minimum height: `700px`
- Dark overlay for readable white text
- Content aligned left
- One primary and one secondary CTA maximum

### Internal-page hero

Use:

```css
min-height: 400px to 720px;
```

Choose height based on content, not randomly.

Examples:

- Collection hero: approximately `400px`
- Product page: no large hero; use product layout directly
- About, Visit, Wine Club, Contact: image-led editorial hero
- Booking page: image hero plus direct anchor CTA

### Hero rules

- No text over bright images without overlay
- No decorative blobs
- No animated background zoom
- No parallax unless specifically approved
- Use strong winery photography
- Avoid generic stock imagery

---

## 9. Section Patterns

AI and Cursor should reuse these section patterns.

### A. Editorial split section

```text
Image | Copy
```

or

```text
Copy | Image
```

Use for:

- Story
- Vineyard
- Wine Club
- Restaurant
- Winemaking
- Getting Here

Rules:

- Equal or near-equal columns
- Minimum height: `620px`
- Image fills its column
- Copy uses generous internal padding
- Background may be white, cream, sand, or ink

### B. Card grid

Use for:

- Products
- Events
- Articles
- Venues
- Contact pathways
- Team members
- Membership tiers

Rules:

- Equal card heights
- Consistent image ratios
- No mismatched card widths
- No horizontal overflow
- No random per-card spacing
- Keep cards aligned to the same baseline

### C. Full-width feature banner

Use for:

- Wine Club CTA
- Weddings
- Booking CTA
- Final page CTA

Rules:

- Strong image
- Dark overlay
- One clear message
- One or two CTAs
- Large whitespace

### D. Sticky internal navigation

Use for long consolidated pages:

- Visit
- About
- Contact
- What's On
- Booking

Rules:

- White background
- Thin bottom border
- Small uppercase labels
- Horizontal scroll on mobile
- Must not obscure content

---

## 10. Product Card System

Product cards must remain visually consistent across homepage, collections, recommendations, and featured product sections.

### Product card anatomy

```text
Badge
Product image
Product title
Type / vintage
Price
Quantity selector
Add to cart
```

### Product image

```css
background: #FFFFFF;
padding: 0;
box-shadow: none;
```

Rules:

- No hover movement
- No bottle drop shadow
- No zoom animation
- Bottle centred and contained
- Equal image area height

### Product badge

```css
position: absolute;
top: 18px;
left: 18px;
z-index: 5;
```

Allowed examples:

```text
New release
Reserve
Museum wine
Limited
```

### Add to Cart button

For product cards only:

```css
.product-actions .btn.sand {
  background: #212121;
  border-color: #212121;
  color: #FFFFFF;
}
```

### Quantity selector

Use:

```text
−  1  +
```

beside Add to Cart.

Do not use a View Product button in the main collection card action row.

The product title or image may link to the product page.

---

## 11. Collection Page Components

Required components:

- Collection hero
- Result count
- Filter control
- Sort control
- Grid/list toggle
- Active filter chips
- Product grid
- Empty state
- Pagination

### Product count

Display `9 products per page`.

### Filters

Recommended filters:

```text
Wine type
Vintage
Price
Collection
Availability
```

### Pagination

- Numbered pagination
- Previous / next controls
- Do not use infinite scroll unless approved
- Keep pagination centred

---

## 12. Product Detail Page Components

The product page must be built as modular Shopify blocks.

### Required structure

```text
Product gallery
Vendor / brand
Title
Vintage / subtitle
Rating placeholder
Price
Compare-at price
Discount / savings
Short description
Product metadata
One-time purchase
Subscription placeholder
Quantity selector
Add to cart
Wine Club CTA
Stock status
Benefits
Accordion information
Product story
Related products
```

### Required accordion blocks

```text
Tasting notes
Wine details
Food pairing
Shipping & delivery
Download wine information
```

### PDF support

Use a product metafield for downloadable PDFs.

Recommended metafield:

```text
custom.pdf
```

### Subscription placeholder

Must support future app block replacement.

Do not hard-code app-specific markup into the theme section.

---

## 13. Forms

Form styling must remain consistent.

```css
background: #FFFFFF;
border: 1px solid #E8E2D9;
padding: 14px 15px;
border-radius: 0;
```

Rules:

- Labels above inputs
- Uppercase tracked labels
- Clear focus state using `#B99E7E`
- Avoid floating labels
- Avoid rounded input fields
- Forms should be modular and Shopify Forms compatible

---

## 14. Accordions

Accordions are used across:

- Product details
- FAQs
- Careers
- Wine Club
- Booking information

Rules:

- Thin divider lines
- Serif question/title
- Plus/minus indicator
- Only one item open at a time unless otherwise specified
- No heavy box styling
- No card shadow

---

## 15. Team Cards and Modal

### Main team profiles

Rob Hall and Ben Craig are the primary featured profiles.

Display:

```text
Rob Hall — Winemaker
Ben Craig — Vineyard Manager
```

### Wider team

Use a carousel:

- Desktop: show 4
- Tablet: show 2
- Mobile: show 1
- Scroll by 1 card per click

### Modal

Clicking any team member opens a reusable modal containing:

```text
Image
Name
Role
Biography
Close control
```

Must support:

- Backdrop close
- Escape key
- Keyboard activation
- Focus restoration

---

## 16. Carousel Rules

Carousels may be used only for:

- Homepage hero
- Team carousel
- Optional testimonials

Rules:

- No autoplay for content carousels except hero
- Hero autoplay: approximately 6 seconds
- Show visible previous/next controls
- Use dots only for hero
- Scroll one card at a time
- Avoid looping unless specifically desired
- No excessive motion

---

## 17. Imagery

Use real Boat O'Craigo imagery where possible.

Approved placeholder images currently used:

```text
https://fusws.api.aspedia.io/boatocraigo-website/banners/home-page/Banner%20-%20Wine.png?preset=carousel-image&t=1779852084540

https://fusws.api.aspedia.io/boatocraigo-website/banners/Banner%20-%20Join%20our%20Wine%20Club.png?preset=carousel-image&t=1779852284584

https://fusws.api.aspedia.io/boatocraigo-website/pages/Homepage/N_Breen_2025-20.jpg?preset=carousel-image&t=1766008402350

https://fusws.api.aspedia.io/boatocraigo-website/pages/Homepage/BoatO_April_2026-36.jpg?preset=grid-image-two-third&t=1779852577988
```

Product placeholder:

```text
https://fusws.api.aspedia.io/boatocraigo-website/products/bottles/GrunerVelt_NV.jpg?preset=wineproductteaser&t=1659678953242
```

### Image treatment

- `object-fit: cover` for editorial imagery
- `object-fit: contain` for bottle imagery
- No heavy filters
- No sepia effects
- No drop shadows on product bottles
- Avoid image hover zoom on collection product cards

---

## 18. Motion

Motion should be subtle and purposeful.

Allowed:

```text
Fade between hero slides
Small card translate on editorial cards
Accordion expand/collapse
Modal open/close
Carousel slide
```

Avoid:

```text
Product bottle movement
Large zoom effects
Parallax
Floating decorations
Continuous animation
Scroll-jacking
```

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

## 19. Responsive Behaviour

### Desktop

- Maximum content width: `1420px`
- Wide editorial layouts
- 4 product cards where appropriate
- 3 products per row on main collection
- 4 visible team carousel cards

### Tablet

- Two-column card layouts
- Stack split sections where needed
- Two visible team carousel cards

### Mobile

- 16px page gutters
- Single-column editorial sections
- Two product cards per row where legible
- One visible team carousel card
- Horizontal sticky sub-navigation
- Mobile filter drawer
- No horizontal page overflow

---

## 20. Accessibility

All components must include:

- Semantic headings
- Alt text
- Button labels
- Keyboard support
- Visible focus states
- Correct form labels
- Accessible modals
- Accordion state management
- Sufficient colour contrast
- Reduced-motion support

Do not use clickable `div` elements when a `button` or `a` element is appropriate.

---

## 21. Shopify Architecture Rules

Every major page area must be a reusable Shopify section.

### Naming convention

```text
boc-header
boc-footer
boc-hero-slider
boc-image-with-text
boc-feature-cards
boc-product-grid
boc-wine-club-plans
boc-team-carousel
boc-faq-accordion
boc-contact-form
boc-related-products
```

### Section requirements

Each section should support relevant settings for:

```text
Heading
Eyebrow
Body copy
Image
Image position
Background colour
Text colour
Section spacing
Button label
Button URL
Container width
Mobile alignment
Visibility
```

### Blocks

Use blocks for repeatable content:

```text
Slides
Cards
Products
Benefits
FAQ items
Team members
Venues
Membership tiers
Contact pathways
```

### Avoid

- Hard-coded page copy inside Liquid
- Repeating the same CSS in multiple sections
- Creating duplicate sections with tiny visual differences
- Inline styles generated from arbitrary settings
- Too many one-off custom sections

---

## 22. AI / Cursor Implementation Rules

Cursor and any AI coding assistant must:

1. Read this document before implementing any template or section.
2. Reuse existing Boat O'Craigo components before creating new ones.
3. Use the existing global header and footer unchanged unless explicitly instructed.
4. Use the approved colour tokens only.
5. Use the approved typography only.
6. Follow the spacing scale.
7. Avoid arbitrary border radius and shadows.
8. Avoid adding new animations without approval.
9. Use semantic Shopify section and block names.
10. Keep all sections merchant-editable.
11. Preserve responsive behaviour.
12. Run `shopify theme check` before completion.
13. Report any deviation from this guide before implementing it.

Cursor must not “improve” the design by introducing its own:

```text
Colours
Fonts
Gradients
Rounded card styles
Shadows
Animations
Layout systems
Button shapes
Icon styles
Spacing scales
```

---

## 23. Page Template Map

Use these templates as the approved information architecture:

```text
Homepage
Collection
Product
Wine Club
Visit
What's On
About
Book Now
Contact
Customer Account
```

### Consolidated content

**Visit**
- Tastings
- Restaurant
- Menu
- Getting here

**What's On**
- Events
- Weddings
- Private events
- Yarra Valley content

**About**
- Family
- Vineyards
- Winemakers
- Team
- Careers

**Contact**
- Contact details
- Enquiry form
- FAQs
- Getting here

---

## 24. Component Checklist

Before approving any new section, confirm:

- [ ] Uses approved colours
- [ ] Uses approved fonts
- [ ] Uses the spacing scale
- [ ] Uses standard button styles
- [ ] Has no unapproved radius
- [ ] Has no unapproved shadow
- [ ] Works on mobile
- [ ] Has no horizontal overflow
- [ ] Uses semantic HTML
- [ ] Is editable in Shopify
- [ ] Reuses existing components where possible
- [ ] Passes Theme Check
- [ ] Does not modify the global header/footer unexpectedly

---

## 25. Final Rule

When there is uncertainty, preserve the existing design language.

Do not invent a new visual solution.

The approved Boat O'Craigo system is:

```text
Warm neutrals
Dark typography
Sand accents
Editorial serif headings
Clean sans-serif UI
Square edges
Generous spacing
Strong photography
Minimal motion
Reusable Shopify sections
```
