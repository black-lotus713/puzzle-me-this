# Puzzle Me This — UI Redesign Spec

---

## 1. Design System Foundation

### Typography

**Font families:**
- Display (headings): `Playfair Display`, serif — loaded via Google Fonts
- UI (everything else): `Inter`, sans-serif — loaded via Google Fonts
- Price figures: Inter with `font-variant-numeric: tabular-nums`

**Type scale — name → size / line-height / weight:**

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-xs` | 0.75rem | 1.125rem | 400 | Captions, badges, meta labels |
| `text-sm` | 0.875rem | 1.375rem | 400 | Body secondary, table cells, form help |
| `text-base` | 1rem | 1.625rem | 400 | Primary body copy |
| `text-lg` | 1.125rem | 1.75rem | 500 | Card titles, form labels |
| `text-xl` | 1.25rem | 1.75rem | 600 | Modal headings, sub-section titles |
| `text-2xl` | 1.5rem | 2rem | 600 | Section headings (admin) |
| `text-3xl` | 1.875rem | 2.375rem | 700 | Page headings |
| `text-4xl` | 2.25rem | 2.75rem | 700 | Products page title |
| `text-5xl` | 3rem | 3.5rem | 700 | Hero sub-headline |
| `text-6xl` | 3.75rem | 4.25rem | 700 | Hero display headline |

All `text-2xl` and above use Playfair Display. Everything below uses Inter.

---

### Color Palette

**Backgrounds:**
- `bg-base`: `#FAF8F5` — page background
- `bg-surface`: `#FFFFFF` — cards, modals, form fields
- `bg-subtle`: `#F4F0EA` — table row hover, section alternates, disabled fields
- `bg-overlay`: `rgba(26, 26, 24, 0.6)` — modal backdrop

**Text:**
- `text-primary`: `#1A1A18` — main body and headings (not pure black, warmer)
- `text-secondary`: `#4A4A42` — sub-labels, metadata, supporting copy
- `text-tertiary`: `#8A8A7A` — placeholders, disabled, fine print
- `text-inverse`: `#FAF8F5` — on dark backgrounds

**Accent (replaces current olive — darkened for contrast):**
- `accent`: `#5C6E4A`
- `accent-hover`: `#4A5A3A`
- `accent-light`: `#EEF1E9` — chip active backgrounds
- `accent-subtle`: `#D4DCCC` — accent-toned borders

**Semantic:**
- `success`: `#2E7D52` / `success-bg`: `#EDFAF4`
- `warning`: `#92681A` / `warning-bg`: `#FEF6E4`
- `error`: `#C0392B` / `error-bg`: `#FDECEA`

**Borders:**
- `border`: `#E2DBD0` — standard
- `border-strong`: `#C8BBAC` — table headers, image containers
- `border-focus`: `#5C6E4A` — focus rings

---

### Spacing Scale

Base unit: 4px. All spacing derives from this grid. Tailwind's default scale already maps to this — the following are the ones actively used throughout this spec:

`space-1` (4px) · `space-2` (8px) · `space-3` (12px) · `space-4` (16px) · `space-5` (20px) · `space-6` (24px) · `space-8` (32px) · `space-10` (40px) · `space-12` (48px) · `space-16` (64px) · `space-20` (80px) · `space-24` (96px)

---

### Border Radii

- `radius-sm`: 4px — badges, chips
- `radius-md`: 8px — inputs, dropdowns, small surfaces
- `radius-lg`: 12px — product cards, table containers
- `radius-xl`: 16px — modals, stat cards
- `radius-2xl`: 24px — hero image, large feature containers
- `radius-full`: 9999px — pill buttons, category filters

---

### Shadow Levels

- `shadow-xs`: `0 1px 2px rgba(26, 26, 24, 0.06)`
- `shadow-sm`: `0 1px 3px rgba(26, 26, 24, 0.10), 0 1px 2px rgba(26, 26, 24, 0.06)`
- `shadow-md`: `0 4px 6px rgba(26, 26, 24, 0.07), 0 2px 4px rgba(26, 26, 24, 0.06)`
- `shadow-lg`: `0 10px 15px rgba(26, 26, 24, 0.10), 0 4px 6px rgba(26, 26, 24, 0.05)`
- `shadow-xl`: `0 20px 25px rgba(26, 26, 24, 0.10), 0 8px 10px rgba(26, 26, 24, 0.04)`
- `shadow-modal`: `0 25px 50px rgba(26, 26, 24, 0.25)`

---

### Transition Timing

- `duration-fast`: 100ms — hover color swaps
- `duration-base`: 200ms — most interactive transitions
- `duration-slow`: 300ms — modal open/close, page-level transitions
- `ease-default`: `cubic-bezier(0.4, 0, 0.2, 1)` — standard
- `ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — buttons and interactive elements with slight overshoot

---

## 2. Layout & Structure

### Global

**Content max-width:** 1280px, centered with `auto` horizontal margins.

**Horizontal page padding:**
- Mobile (< 640px): 16px
- Tablet (640–1024px): 32px
- Desktop (> 1024px): 64px

**Body background:** `bg-base` (#FAF8F5).

---

### Navigation (both storefront and admin)

**Height:** 64px desktop, 56px mobile.

**Position:** Fixed to top. Main content area gets `padding-top: 64px` applied to the root layout wrapper.

**Background:** `bg-base` (#FAF8F5) with a 1px bottom border in `border` (#E2DBD0). The border is invisible until the user has scrolled more than 0px — on scroll it appears via a class toggle (adds `border-b border-border`).

**Left side:** "Puzzle Me This" in Playfair Display, 1.125rem (text-lg), weight 600, `text-primary`. No logo image unless one is added later.

**Right side:** Nav links — text-sm, weight 500, `text-secondary`. On hover: `text-primary` with a 1px underline in `accent` color that slides in from left to right (200ms ease). Active link: `text-primary` with persistent underline.

**Current problem:** No scroll-aware border, no active link state, typography not differentiated from body. The brand name has no distinct rendering.

---

### Storefront Layout (Home, Products)

All pages: 64px top padding from fixed nav, then page-specific content, then footer.

**Sections are separated by a minimum of 96px vertical space.** No section runs directly into another without breathing room.

---

### Admin Layout

Admin keeps the shared header nav. No sidebar.

**Max-width:** 1280px (same as storefront).

**Page interior padding:** 40px top (after nav), 32px bottom.

**Current problem:** Admin page has no clear page identity, no visual container for the table, no header row with a title and action button aligned together.

---

### Footer (storefront only — not shown on admin)

Three-column layout inside the 1280px max-width container:

- **Left:** "Puzzle Me This" brand name in Playfair Display, text-sm tagline below in `text-tertiary`
- **Center:** Navigation links — Home, Products (text-sm, `text-inverse` at 80% opacity, hover full opacity)
- **Right:** Contact / social placeholder (text-sm)

**Background:** `#1A1A18` (charcoal). Text: `text-inverse`.

**Padding:** 64px vertical, same horizontal padding as main content.

**Bottom bar:** 1px border-top in `#2C2C2C`, copyright line in text-xs `text-tertiary`, 24px vertical padding.

Footer is absent entirely in the current implementation. It must be added.

---

## 3. Component Redesign

### ProductCard

**Current state:** Tan (`bg-tan`) background, no border, weak hover effect, category not visually differentiated, image has no aspect ratio lock.

**Target state:**

- Background: `bg-surface` (white)
- Border: 1px solid `border` (#E2DBD0)
- Border-radius: `radius-lg` (12px)
- Shadow: `shadow-sm` at rest
- On hover: `shadow-lg`, `translateY(-2px)`, transition 200ms `ease-default`
- Cursor: pointer

**Image container:**
- Aspect ratio: 4/3, locked
- `overflow: hidden`
- Top-left + top-right radii: 12px. Bottom radii: 0.
- Background: `bg-subtle` (#F4F0EA) for the broken/loading state
- Broken image fallback: centered camera-off SVG icon in `text-tertiary`, "No image" label below in text-xs `text-tertiary`

**Card body padding:** 16px all sides.

**Category label:**
- Rendered above the product name
- text-xs, uppercase, `letter-spacing: 0.08em`, weight 600, color `accent` (#5C6E4A)
- No background — just text

**Product name:**
- Playfair Display, text-lg, `text-primary`, `line-clamp-2`
- Margin-top: 4px from category label

**Description:**
- text-sm, `text-secondary`, `line-clamp-2`, margin-top 4px

**Price:**
- text-xl, weight 600, `text-primary`, tabular-nums
- Pushed to the bottom of the card body using flex column layout with `margin-top: auto`
- Format: `$XX.XX`

---

### Buttons

**Primary:**
- Background: `accent` (#5C6E4A), text: `text-inverse` (#FAF8F5)
- Padding: 10px 20px, border-radius: `radius-full`
- Font: text-sm, weight 600
- Border: 1.5px solid transparent (so size doesn't shift on hover)
- Hover: background `accent-hover` (#4A5A3A), `scale(1.01)`, 150ms `ease-spring`
- Active: `scale(0.99)`
- Disabled: `opacity-50`, `cursor-not-allowed`, no transform
- Focus-visible: 2px offset ring using `accent` color

**Secondary:**
- Background: transparent, border: 1.5px solid `accent`
- Text: `accent`
- Hover: background `accent-light` (#EEF1E9), 150ms ease
- Same padding, radius, font as primary

**Danger:**
- Background: `error` (#C0392B), text: white
- Hover: `#A93226`
- Same shape as primary

**Ghost:**
- No border, no background, text: `text-secondary`
- Padding: 8px 12px, border-radius: `radius-md`
- Hover: text `text-primary`, background `bg-subtle`, 100ms ease

**Icon button (admin table actions — replaces current emoji):**
- Size: 32px × 32px, border-radius: `radius-full`
- Background: transparent, border: 1px solid transparent
- Hover: background `bg-subtle`, border `border`
- Icon: 16px SVG from Lucide or Heroicons (pencil for edit, trash-2 for delete)
- Tooltip on hover: text label in a small pill (`text-xs`, black bg, white text, 200ms delay)
- Transition: background/border 100ms `ease-default`

---

### Form Inputs

**Input (text, number):**
- Height: 40px
- Padding: 10px 14px
- Background: `bg-surface` (white)
- Border: 1.5px solid `border` (#E2DBD0)
- Border-radius: `radius-md` (8px)
- Font: text-sm, `text-primary`
- Placeholder: `text-tertiary`
- Focus: border-color `border-focus` (#5C6E4A), `box-shadow: 0 0 0 3px rgba(92, 110, 74, 0.15)`
- Error state: border-color `error` (#C0392B), `box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.15)`
- Disabled: background `bg-subtle`, opacity 0.7
- Transition: border-color 150ms ease, box-shadow 150ms ease

**Input label:**
- text-sm, weight 600, `text-secondary`, display block, margin-bottom 6px

**Help / error text:**
- text-xs, margin-top 4px
- Error text: color `error` (#C0392B)

**Textarea:**
- Same as input, min-height: 80px, `resize: vertical`

**Select (custom):**
- Same dimensions and border treatment as input
- Browser default arrow removed: `-webkit-appearance: none`
- Custom chevron SVG (down arrow) positioned right, 14px from right edge, pointer-events none
- Right padding: 36px to prevent text overlap with chevron

**Checkbox (custom):**
- Container: 16px × 16px, border-radius: `radius-sm` (4px)
- Unchecked: border 1.5px solid `border-strong`, background white
- Checked: background `accent`, border `accent`, white SVG checkmark inset
- Focus: same ring as input focus
- Label: text-sm, weight 500, `text-primary`, inline, margin-left 8px

**Input group (price field with currency prefix):**
- Prefix container: left-attached to input, background `bg-subtle`, border 1.5px solid `border`, border-right: none, border-radius `radius-md` on left side only, padding 10px 12px, text-sm, `text-secondary`, non-selectable
- Input: border-radius `radius-md` on right side only, flex-grow

---

### Admin Table

**Table container:**
- Background: `bg-surface` (white)
- Border: 1px solid `border`
- Border-radius: `radius-lg` (12px)
- `overflow: hidden` (so radius clips the table edges)
- Shadow: `shadow-sm`

**Table toolbar (above column headers, inside container):**
- Padding: 16px
- Border-bottom: 1px solid `border`
- Flex row, align-center
- Left: search input, width 280px, height 36px, placeholder "Search products…"
- Right: status filter — a custom select or segmented control (All / Active / Draft)

**Column headers:**
- Background: `bg-subtle` (#F4F0EA)
- Border-bottom: 1px solid `border`
- Padding: 12px 16px
- Font: text-xs, uppercase, letter-spacing 0.06em, weight 600, `text-secondary`

**Body rows:**
- Background: `bg-surface` (white). No zebra striping.
- Border-bottom: 1px solid `bg-subtle` (#F4F0EA) — barely visible row separator
- Hover: background `bg-base` (#FAF8F5), 100ms ease
- Last row: no border-bottom
- Padding: 14px 16px

**Name cell:** text-sm, weight 500, `text-primary`

**Price cell:** text-sm, tabular-nums, text-right aligned

**Featured cell:** center-aligned. Filled star SVG (16px, `accent` color) for featured, empty star SVG (16px, `text-tertiary`) for not featured. No emoji.

**Actions cell:** right-aligned, flex row with 4px gap, icon buttons as specified above

---

### Status Badges

**Active:**
- Background: `success-bg` (#EDFAF4)
- Text: `success` (#2E7D52)
- Border: 1px solid `rgba(46, 125, 82, 0.2)`
- Padding: 3px 8px
- Border-radius: `radius-full`
- Font: text-xs, weight 600, uppercase, letter-spacing 0.05em

**Draft:**
- Background: `warning-bg` (#FEF6E4)
- Text: `warning` (#92681A)
- Border: 1px solid `rgba(146, 104, 26, 0.2)`
- Same padding, radius, font

---

### Modals

**Backdrop:** `bg-overlay` (`rgba(26, 26, 24, 0.6)`). Backdrop-filter `blur(4px)`.

**Container:**
- Background: `bg-surface` (white)
- Border-radius: `radius-xl` (16px)
- Shadow: `shadow-modal`
- Max-width: 520px (form modal), 400px (delete confirmation)
- Width: `calc(100vw - 32px)` on mobile
- Padding: 32px
- Entrance animation: scale 0.95→1.0 + fade 0→1, 200ms `ease-spring`
- Exit: reverse, 150ms `ease-default`

**Modal header:**
- Flex row, align-center, justify-between
- Title: text-xl, Playfair Display, `text-primary`
- Close button: icon button (X SVG), top-right
- Border-bottom: 1px solid `border`, padding-bottom 20px, margin-bottom 24px

**Modal body:**
- Max-height: `calc(80vh - 200px)`, overflow-y auto when content overflows
- Custom scrollbar: 4px width, `accent-subtle` thumb, transparent track

**Modal footer:**
- Border-top: 1px solid `bg-subtle`, padding-top 24px, margin-top 24px
- Flex row, justify-end, gap 8px

---

### Category Filter

**Container:** Flex row, flex-wrap, gap 8px, padding 4px 0.

**Each filter button:**
- Padding: 8px 16px
- Border-radius: `radius-full`
- Border: 1.5px solid `border`
- Background: transparent
- Font: text-sm, weight 500, `text-secondary`
- Hover: background `bg-subtle`, border `border-strong`, 150ms ease
- Active (selected): background `accent-light` (#EEF1E9), border `accent`, color `accent`, weight 600
- Transition: all 150ms `ease-default`

---

### Image Upload

**Container:**
- Aspect ratio: 4/3
- Border: 2px dashed `border-strong` (#C8BBAC)
- Border-radius: `radius-md`
- Background: `bg-subtle`
- `overflow: hidden`
- Hover (empty state): border-color `accent`, background `accent-light`, 150ms ease

**Empty state (no image):**
- Centered column flex
- Upload cloud SVG icon, 32px, `text-tertiary`
- "Click to upload or drag and drop" in text-sm `text-secondary`, margin-top 8px
- "PNG, JPG, WEBP — max 10MB" in text-xs `text-tertiary`, margin-top 4px

**Preview state (image selected):**
- `object-fit: cover`, fills full container
- On hover: semi-transparent dark overlay with "Change image" centered in white text

**Loading state:**
- Center-aligned spinner (CSS border-based, 24px, `accent` color)
- "Uploading…" in text-sm `text-secondary` below

---

### Loading / Skeleton States

Replace all text-based loading indicators ("Loading...") with skeleton screens.

**Product card skeleton:**
- Same card dimensions as ProductCard
- Image area: solid `bg-subtle` rectangle
- Category strip: 60px × 12px rounded block
- Title: two lines, 100% and 70% width, 16px height, `bg-subtle`
- Description: two lines, same pattern, 12px height
- Price: 50px × 20px block
- All blocks: CSS keyframe animation — opacity oscillates 0.4→0.8, 1.2s ease-in-out infinite alternate

**Table row skeleton:**
- 6 cells, each a `bg-subtle` block with the same pulse animation
- 4 rows rendered during loading

---

## 4. Page-by-Page Walkthrough

### Home Page (`src/pages/Home.tsx`)

**Current problems:**
- Hero is a tan-background div with centered text — flat, no depth, no image, no visual interest
- No eyebrow label or brand context
- CTA button is basic
- Featured products section runs too close to hero with no section break
- No section heading treatment for "Featured Products"
- No footer

**Required changes:**

**Hero section:**
- Min-height: `calc(100vh - 64px)` on desktop, auto with 80px vertical padding on mobile
- Two-column layout (desktop): 55% left / 45% right, vertically centered, 64px gap between columns
- Left column (text):
  - Eyebrow: "Handcrafted Home Goods" — text-xs, uppercase, letter-spacing 0.1em, weight 600, `accent` color, margin-bottom 16px
  - H1: "Thoughtfully Made,\nBeautifully Designed" — Playfair Display, text-6xl (3.75rem), weight 700, `text-primary`, line-height 1.15
  - Sub-copy: one sentence tagline — text-base, `text-secondary`, max-width 420px, margin-top 16px
  - CTAs: flex row, gap 12px, margin-top 32px — primary "Shop All Products" button + ghost "Our Story" button
- Right column (image):
  - Aspect ratio: 4/3
  - Border-radius: `radius-2xl` (24px)
  - Background: `bg-subtle` with a warm tan gradient fallback
  - Filled with `object-fit: cover` when a real brand image is supplied
  - Subtle `shadow-xl` on the image container
- Mobile (< 768px): single column, text above, image below (16:9 aspect ratio on mobile), no min-height constraint

**Hero-to-products transition:** 96px vertical gap.

**Featured Products section:**
- Section heading: "Featured Picks" — Playfair Display, text-3xl, `text-primary`, text-center
- Decorative rule: 40px wide, 2px height, `accent` color, centered, margin-top 12px, margin-bottom 32px
- Grid: 4 columns desktop, 2 tablet, 1 mobile, 24px gap
- Empty state: centered column, bag SVG icon (48px, `text-tertiary`), "No featured products yet" in text-lg `text-secondary`, margin-top 16px

**Section-to-footer gap:** 96px.

---

### Products Page (`src/pages/Products.tsx`)

**Current problems:**
- Page heading "All Products" has no hierarchy — it reads like a default H1 with no styling
- Category filter bar has no breathing room and is not sticky
- Loading state is text-only
- No empty state when a category has no products
- No product count or context label ("Showing 12 products")

**Required changes:**

**Page header block:**
- Top padding from nav: 80px
- "Our Collection" — Playfair Display, text-4xl, `text-primary`
- Sub-line: "Browse our full catalog of handcrafted goods" — text-base, `text-secondary`, margin-top 8px
- Margin-bottom: 40px

**Category filter bar:**
- Sticky below nav: `position: sticky`, `top: 64px`
- Background: `bg-base` with `backdrop-filter: blur(8px)` — subtle blur when page content scrolls behind it
- Border-bottom: 1px solid `border`
- Padding: 16px 0 (uses page horizontal padding from container)
- z-index: 10

**Products grid:**
- 4 columns desktop / 3 tablet / 2 mobile / 1 small mobile
- Gap: 24px
- Margin-top: 32px from filter bar

**Product count label:**
- Immediately above grid, right-aligned
- "Showing 12 products" in text-sm `text-secondary`

**Loading state:**
- 8 skeleton ProductCard items in the same grid layout

**Empty state (category has no results):**
- Centered, min-height 320px to fill the space
- Inbox SVG icon, 48px, `text-tertiary`
- "No products in this category" — text-xl, Playfair Display, `text-primary`, margin-top 16px
- "Check back soon or browse another category." — text-sm, `text-secondary`, margin-top 8px
- "View All Products" — secondary pill button, margin-top 24px, resets filter to "All"

---

### Admin Dashboard (`src/pages/Admin.tsx`)

**Current problems:**
- No visual page identity — table appears on blank white space
- "Add Product" button placement is unclear (likely above table without flex alignment to page title)
- Emoji icons (✏️ 🗑️) for edit/delete — unacceptable for a production UI
- Table has no container card — floats raw on the page background
- Zebra striping looks dated
- Status badges are unstyled inline spans
- No empty state for zero products
- No search or filter capability
- Delete confirmation modal has no visual weight
- No summary statistics anywhere

**Required changes:**

**Page header bar:**
- Flex row, align-center, justify-between
- Left: "Product Management" — Playfair Display, text-3xl, `text-primary`
- Right: "Add Product" primary pill button
- Margin-bottom: 32px

**Summary stat cards (row of 3):**
- Flex row, gap 16px, margin-bottom 32px
- Each card: `bg-surface`, 1px `border`, `radius-xl`, `shadow-xs`, padding 20px 24px
- Stat value: text-3xl, weight 700, `text-primary`, tabular-nums
- Stat label: text-sm, `text-secondary`, margin-top 4px
- Three stats: "Total Products", "Active", "Featured"

**Table card:**
- `bg-surface`, 1px `border`, `radius-lg`, `shadow-sm`, `overflow: hidden`

**Table toolbar:**
- Inside card, above header row
- Padding: 16px
- Border-bottom: 1px `border`
- Left: search input (280px wide, 36px tall, standard input styling, magnifying glass icon inside left padding)
- Right: status filter — three pill toggle buttons (All / Active / Draft), same styling as CategoryFilter

**Column definitions:**
- Name (left-aligned, ~30% width), Category (15%), Price (right-aligned, 10%), Status (centered, 10%), Featured (centered, 10%), Actions (right-aligned, 12%)

**Column header:** `bg-subtle`, text-xs uppercase tracking-wide `text-secondary`, 12px 16px padding.

**Body rows:** White bg, hover `bg-base`, 14px 16px cell padding, no zebra.

**Edit/Delete actions:** Icon buttons (pencil SVG + trash-2 SVG), tooltip on hover, as specified above.

**Featured column:** Filled star SVG (accent) / outlined star SVG (tertiary).

**Empty state (no products exist):**
- Full-width centered block replacing the table body rows (still inside the card)
- Min-height: 320px
- Package SVG icon, 48px, `text-tertiary`
- "No products yet" — text-xl Playfair Display, `text-primary`, margin-top 16px
- "Add your first product to get started." — text-sm `text-secondary`
- "Add Product" primary button, margin-top 24px

**Delete confirmation modal (400px wide):**
- Title: "Delete product?" — Playfair Display, text-xl
- Product name displayed in a highlighted block: background `error-bg`, border-left 3px solid `error`, padding 10px 14px, `radius-md`, text-sm weight 500
- Warning text: "This action cannot be undone." — text-sm, `error` color, weight 500, margin-top 12px
- Footer: Cancel (secondary) + Delete (danger) buttons, right-aligned

---

### Add / Edit Product Modal (`src/components/ProductForm.tsx`)

**Current problems:**
- Image preview is 128×96px — too small to review a product image
- All fields stack in a single column with no visual grouping
- Price field has no currency indicator
- Description has no character count
- Status is a bare HTML select with browser default chrome
- Featured is a plain browser checkbox
- No scroll behavior — if form overflows viewport on short screens, content is cut
- Form title doesn't distinguish between Add and Edit contexts

**Required changes:**

**Modal body:**
- Overflow-y: auto, max-height: `calc(80vh - 200px)` (200px accounts for header + footer)

**Image upload:**
- Full width, 4/3 aspect ratio, as specified in Image Upload component section above
- Positioned at top of form body

**Field layout:**
- Row 1: Name (60%) + Price (40%) — flex row, 16px gap
- Row 2: Description (full width textarea, min-height 80px)
- Row 3: Category (50%) + Status (50%) — flex row, 16px gap
- Row 4: Featured checkbox, full width

**Name field:** Standard text input, required, label "Product Name"

**Price field:** Input group with "$" prefix as described in Form Inputs section, type number, step 0.01, min 0, label "Price"

**Description field:** Textarea, max 500 characters, character count displayed right-aligned below field in text-xs `text-tertiary`: "0 / 500"

**Category:** Custom-styled select as described

**Status:** Custom-styled select: options "Active" and "Draft"

**Featured:** Custom checkbox as described, label "Mark as featured on homepage"

**Form title:** "Add Product" when creating, "Edit Product" when editing an existing record

**Modal footer (sticky):**
- Stays at bottom of modal even when body scrolls
- Cancel (ghost) + Save (primary, shows "Saving…" with spinner when submitting)
- Error message above buttons if form submit fails: text-sm `error` color

**All fields on mobile:** Single column (all rows unwrap to full width)

---

## 5. Implementation Order

### Phase 1 — Design Tokens & Global Styles

**Files:** `tailwind.config.js`, `src/index.css`

1. Add Google Fonts import (Playfair Display weights 600/700, Inter weights 400/500/600) in `index.css` via `@import` or `<link>` in `index.html`
2. Rewrite `tailwind.config.js`: replace current 5-color set with the full token palette above, add `fontFamily` extending with `display` (Playfair Display) and `sans` (Inter), add `borderRadius` extensions, add `boxShadow` extensions, add `transitionTimingFunction` extensions
3. In `index.css`: set `html { font-family: 'Inter', sans-serif; background-color: #FAF8F5; -webkit-font-smoothing: antialiased; }`, add base heading tag rules (h1–h4 use Playfair Display), define skeleton pulse `@keyframes` animation
4. Verify Tailwind v4 vite plugin picks up the config changes correctly (v4 config differs from v3 — confirm the plugin syntax used in `vite.config.ts` is correct and tokens are being applied)

---

### Phase 2 — App Shell & Navigation

**Files:** `src/App.tsx`, new `src/components/Footer.tsx`

1. Update nav: fixed position, 64px height, flex layout (brand left, links right), scroll-aware border-bottom via `window.scrollY > 0` listener toggling a class
2. Brand: Playfair Display, text-lg, weight 600
3. Nav links: text-sm weight 500, hover underline animation using `after:` pseudo-element with scale transition
4. Active link detection: compare `useLocation().pathname` to link href, apply active underline
5. Add `pt-16` (64px) to the main wrapper `<div>` that wraps `<Routes>`
6. Create `Footer.tsx`: three-column layout, charcoal background, as specified above
7. Render `<Footer />` after `<Routes>` but only on storefront routes (not on `/admin`): wrap in `{ location.pathname !== '/admin' && <Footer /> }`

---

### Phase 3 — Category Filter

**Files:** `src/components/CategoryFilter.tsx`

1. Rewrite button classes using new token-based Tailwind classes
2. Apply pill shape (`rounded-full`), updated border/background/text tokens for default, hover, and active states
3. Transition: `transition-all duration-150`

---

### Phase 4 — ProductCard

**Files:** `src/components/ProductCard.tsx`

1. Replace `bg-tan` card background with white + border + shadow
2. Add hover transform and shadow transition
3. Wrap image in an aspect-ratio div with `overflow-hidden` and top-only border-radius
4. Add category label above product name using `text-xs uppercase tracking-wider font-semibold text-accent`
5. Switch product name to `font-display` (Playfair Display) class, apply `line-clamp-2`
6. Description: text-sm secondary color, `line-clamp-2`
7. Convert card body to flex column, price uses `mt-auto` to push to bottom
8. Update broken image fallback: styled div with centered icon + text, matching image container dimensions

---

### Phase 5 — Image Upload

**Files:** `src/components/ImageUpload.tsx`

1. Replace the existing small preview with full-width aspect-ratio-4/3 container
2. Empty state: icon + upload instructions text stack, centered
3. Preview state: `object-cover` image filling container, hover overlay with "Change image"
4. Loading state: centered spinner animation
5. Hover state on empty container: `border-accent bg-accent-light` transition

---

### Phase 6 — ProductForm

**Files:** `src/components/ProductForm.tsx`

1. Apply standard input styling to all text/number inputs (border, focus ring, labels, error text)
2. Wrap image upload first in form body
3. Restructure field layout: Name+Price row, Description full-width, Category+Status row, Featured row
4. Implement price input group with "$" prefix
5. Description textarea: add character counter display below field
6. Custom select styling: hide browser appearance, add chevron SVG
7. Custom checkbox for Featured
8. Ensure modal body is scrollable (add max-height + overflow-y)
9. Move Save/Cancel to sticky modal footer
10. Display form-level error message above footer buttons
11. Title switches between "Add Product" / "Edit Product" based on whether an existing product ID is present

---

### Phase 7 — Admin Page

**Files:** `src/pages/Admin.tsx`

1. Page header: flex row with title (Playfair Display text-3xl) left, "Add Product" button right
2. Add stat cards row: compute totals from the loaded products array (total, active count, featured count), render three stat cards
3. Wrap table in card container div (`bg-surface border border-border rounded-xl shadow-sm overflow-hidden`)
4. Add table toolbar inside card: search input, status filter pills
5. Implement client-side search and status filtering against the loaded products array
6. Update table header row: `bg-subtle` background, uppercase text-xs headers
7. Remove zebra striping — uniform white rows with subtle hover
8. Replace emoji action buttons with SVG icon buttons + tooltip implementation
9. Replace inline status badge spans with the new Badge component styling
10. Replace emoji star in Featured column with SVG star icons
11. Redesign delete confirmation modal: product name block-quote, warning line, danger button
12. Add table empty state
13. Add skeleton loading rows

---

### Phase 8 — Products Page

**Files:** `src/pages/Products.tsx`

1. Add page header block: Playfair Display text-4xl "Our Collection", sub-line in secondary color
2. Make category filter bar sticky (`sticky top-16`, `bg-base/90 backdrop-blur-sm border-b`)
3. Add product count label above grid
4. Implement skeleton loading (8 cards) using the skeleton state from Phase 4
5. Add empty state component for zero-product categories

---

### Phase 9 — Home Page

**Files:** `src/pages/Home.tsx`

1. Rebuild hero section: two-column desktop layout, eyebrow label, Playfair Display headline, tagline, dual CTA buttons
2. Hero image column: aspect-ratio container with `radius-2xl`, `shadow-xl`, warm gradient fallback
3. Mobile hero: single column, text over image (stacked), no height constraint
4. Add 96px gap between hero and Featured section
5. Redesign Featured section heading: text-3xl Playfair Display, centered, decorative accent rule below
6. Add skeleton loading for featured product cards
7. Add empty state for when no featured products exist
8. Footer renders automatically (added in Phase 2)

---

### Phase 10 — Polish & Consistency Pass

**Files:** `src/index.css`, all component and page files

1. Audit every interactive element for transition coverage — every button, input, link, and card must have a transition defined
2. Replace all remaining browser-default `outline` focus rings with `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent`
3. Add `scroll-behavior: smooth` to `html`
4. Test all pages at 375px, 768px, 1024px, and 1280px viewport widths — fix any overflow, cramped spacing, or layout collapse
5. Verify all text-on-background color combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text / UI components): the cream+charcoal and white+charcoal combinations pass easily; verify olive text on white and olive text on cream-light
6. Ensure the nav `padding-top` is correctly applied on every page and no hero or page header bleeds under the fixed nav
7. Remove any remaining inline style attributes — all visual state should be driven by Tailwind classes

---

Every token, every component, every page change in this plan is self-contained and references the tokens defined in Phase 1. Execute phases in order and the system is coherent at every intermediate step.
