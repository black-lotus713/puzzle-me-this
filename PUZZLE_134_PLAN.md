# Puzzle 134 — FAQ & Help Centre Manager: Implementation Plan

## Overview

Build a FAQ and help centre manager on top of the existing Vite + React + TypeScript + Supabase + Tailwind stack. Two new pages: a public FAQ/help centre page showing only published items with search and category filtering, and a no-auth dashboard for managing FAQ content (add, edit, delete, publish). All new — no existing pages reused, architecture reused throughout.

---

## 1. Supabase Table

### Table: `faq_items`

```sql
create table faq_items (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  category    text not null
                check (category in ('General', 'Pricing', 'Services', 'Support', 'Delivery')),
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

**No RLS** — consistent with the rest of the project (products, testimonials, booking_slots are all open access).

An `updated_at` column is included because the dashboard supports editing existing items; the public page can sort by this field to surface recently updated content.

---

## 2. TypeScript Types

### File: `src/types/faq.ts`

```typescript
export type FaqCategory = 'General' | 'Pricing' | 'Services' | 'Support' | 'Delivery'

export const FAQ_CATEGORIES: FaqCategory[] = [
  'General', 'Pricing', 'Services', 'Support', 'Delivery'
]

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: FaqCategory
  published: boolean
  created_at: string
  updated_at: string
}

export type NewFaqItem = Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>
export type FaqItemUpdate = Partial<NewFaqItem>
```

`FAQ_CATEGORIES` is an exported constant so both the form `<select>` and the public category filter derive their option lists from a single source rather than duplicating string literals.

---

## 3. Data Hook

### File: `src/hooks/useFaq.ts`

Mirrors the `useTestimonials` / `useProducts` pattern: async functions called in `useEffect`, local state managed manually, explicit refetch after mutations.

**State:**
- `faqs: FaqItem[]`
- `loading: boolean`
- `error: string | null`

**Internal functions:**
- `fetchAll()` — loads all FAQ items ordered by `created_at` descending (used by dashboard)
- `fetchPublished()` — loads only `published = true` ordered by `updated_at` descending (used by public page)

**Functions exposed:**
- `addFaq(data: NewFaqItem): Promise<void>` — inserts with `published: false` default unless explicitly passed as `true`
- `updateFaq(id: string, data: FaqItemUpdate): Promise<void>` — patches any subset of fields; always sets `updated_at = now()` via a Supabase `.update()` call; triggers refetch
- `deleteFaq(id: string): Promise<void>` — hard delete; triggers refetch
- `togglePublished(id: string, current: boolean): Promise<void>` — convenience wrapper around `updateFaq` that flips the `published` boolean

**Exports:**
```typescript
export function useFaq()         // dashboard — calls fetchAll
export function usePublicFaq()   // public page — calls fetchPublished
```

Same two-flavor export pattern as `useTestimonials`. The single `useFaqBase(publishedOnly: boolean)` internal function handles both via a flag.

---

## 4. Components

### 4a. `src/components/FaqForm.tsx`

Used on the **dashboard only** for both adding new items and editing existing ones.

Props:
```typescript
interface Props {
  initialData?: FaqItem          // undefined = add mode, defined = edit mode
  onSave: (data: NewFaqItem) => Promise<void>
  onCancel: () => void
}
```

Fields:
| Field | Input Type | Validation |
|---|---|---|
| Question | `<textarea>` (2 rows) | Required, trimmed |
| Answer | `<textarea>` (5 rows) | Required, trimmed |
| Category | `<select>` with options from `FAQ_CATEGORIES` | Required |
| Published | `<input type="checkbox">` | Defaults to unchecked |

- Follows the same modal overlay pattern as `TestimonialForm.tsx` and `ProductForm.tsx`
- Fixed overlay + centered container with `modal-container` animation class
- Header: title changes based on mode ("Add FAQ Item" vs "Edit FAQ Item") + close button
- Sticky footer with primary save button ("Add FAQ Item" / "Save Changes") + ghost cancel
- Submit button shows a `spinner` class element while saving (`isSubmitting` state)
- `inputClass` and `labelClass` constants copied from existing form conventions
- Form state managed as a single object with a typed `set<K>(key, value)` helper
- `initialData` pre-populates form state on mount; ignored after first render (controlled form)

### 4b. `src/components/FaqAccordionItem.tsx`

Used on the **public page only**. Renders a single FAQ entry as an expandable accordion row.

Props:
```typescript
interface Props {
  faq: FaqItem
  isOpen: boolean
  onToggle: () => void
}
```

Layout (collapsed state):
```
┌─────────────────────────────────────────────────────┐
│  [General]  How do I track my order?          ▼    │
└─────────────────────────────────────────────────────┘
```

Layout (expanded state):
```
┌─────────────────────────────────────────────────────┐
│  [General]  How do I track my order?          ▲    │
├─────────────────────────────────────────────────────┤
│  You can track your order by logging in to your     │
│  account and visiting the Orders section...         │
└─────────────────────────────────────────────────────┘
```

- Category shown as a pill/badge using accent color variants (consistent with existing badge pattern)
- The chevron icon rotates 180° when open (`transition-transform`)
- Answer text area has gentle slide/fade reveal (`transition-all` on max-height or conditional render)
- Uses `bg-surface border border-border rounded-xl` card styling

### 4c. `src/components/FaqSkeletonItem.tsx`

Loading placeholder for the public page, matching `FaqAccordionItem` dimensions. Uses the `.skeleton` class from `index.css` for pulse animation. Used in a loop of 5 while `loading` is true on the public page.

---

## 5. Dashboard Page

### File: `src/pages/FaqDashboard.tsx`

Route: `/faq/dashboard`

**Page structure:**

```
Page Header
  Title: "FAQ & Help Centre"
  Subtitle: "Manage help articles and control what visitors can see"
  [+ Add FAQ Item] button (top-right, accent filled, rounded-full)

Stats Row (3 cards — same pattern as TestimonialsDashboard.tsx)
  Total | Published | Unpublished

Filter Bar (two rows or inline wrapping)
  Row 1 — Status pills: All | Published | Unpublished
  Row 2 — Category pills: All | General | Pricing | Services | Support | Delivery

FAQ Table
  Columns: Question (truncated) | Category | Status | Last Updated | Actions

Action Column (per row)
  - [Publish] / [Unpublish] toggle button  →  calls togglePublished(id, current)
  - [Edit] icon button                      →  opens FaqForm in edit mode
  - [Delete] icon button                    →  opens delete confirm dialog
```

**Status Badge component (inline in this file):**
- `published = true`  → green badge: "Published" (using `success` color tokens)
- `published = false` → muted badge: "Draft" (using `tertiary`/`border` color tokens — not warning/error since drafts are not problematic)

**Behavior notes:**
- Status filter and category filter are both applied simultaneously (client-side, no extra DB calls)
- The filtered list is computed with `useMemo` combining both filter states
- Question text truncated to ~80 chars in the table with `title` tooltip for full text on hover
- Skeleton loaders during initial fetch (same `TableSkeleton` pattern as `TestimonialsDashboard`)
- Empty state: icon + "No FAQ items" message differentiated between "no items at all" and "no items match this filter"
- Edit button triggers `setEditTarget(faq)` state; `FaqForm` renders when `editTarget !== null`
- Add button triggers `setShowForm(true)` state; `FaqForm` renders without `initialData`
- Both form flows call the same `handleSave` which delegates to `addFaq` or `updateFaq` based on whether `editTarget` is set
- Delete confirmation dialog mirrors `TestimonialsDashboard.tsx`: centered modal overlay, shows the question text, "This action cannot be undone." warning, Confirm + Cancel buttons

**State:**
```typescript
const [showForm, setShowForm] = useState(false)
const [editTarget, setEditTarget] = useState<FaqItem | null>(null)
const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)
const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all')
const [categoryFilter, setCategoryFilter] = useState<FaqCategory | 'all'>('all')
```

---

## 6. Public Page

### File: `src/pages/FaqPage.tsx`

Route: `/faq`

**Page structure:**

```
Hero Section
  Eyebrow: "Help Centre"
  Headline: "How Can We Help You?"
  Subtitle: "Find answers to common questions about our products and services"
  Search Bar (full-width, centered, max-w-xl)
    Placeholder: "Search questions and answers…"

Category Filter Bar
  Pill buttons: All | General | Pricing | Services | Support | Delivery
  (centered below hero — same pill style as dashboard filter)

Results Count
  "Showing X of Y articles"  (small, muted text)
  OR "No results for '[query]'" empty state

FAQ Accordion List
  Each item: FaqAccordionItem component
  Only one item open at a time (controlled: openId state)
```

**Behavior notes:**
- Fetches only `published = true` rows via `usePublicFaq()` hook
- All filtering (search + category) is **client-side** on the already-loaded array — no DB calls on filter change
- Search is case-insensitive, matches against both `question` and `answer` fields
- Category filter and search filter are applied together (`useMemo` computed from both filter states)
- Search input is debounced by ~200ms to avoid excessive re-renders on fast typing; implemented with `useEffect` + `setTimeout` / `clearTimeout`
- `openId: string | null` state tracks which accordion item is expanded; toggling the same item closes it; clicking a different item closes the previous and opens the new one
- Loading state shows 5 `FaqSkeletonItem` components
- Empty state (no published items): icon + "No articles available yet. Check back soon!"
- Empty state (search/filter returns nothing): icon + "No articles match your search. Try different keywords or a different category."
- No auth, no add button, no admin UI of any kind

---

## 7. Routing Updates

### File: `src/App.tsx`

Add two new route entries inside the existing `<Routes>`:

```
/faq             → FaqPage          (public)
/faq/dashboard   → FaqDashboard     (admin)
```

Footer exclusion: add `/faq/dashboard` to the existing `hideFooter` condition in `Layout()`.

---

## 8. Navigation Updates

### File: `src/App.tsx` (header nav)

Add two new `<NavLink>` entries to the existing fixed header nav using the same `linkBase` / `linkActive` class pattern:

| Label | Route |
|---|---|
| FAQ | `/faq` |
| FAQ Dashboard | `/faq/dashboard` |

---

## 9. File Creation Summary

| File | Purpose | New / Modified |
|---|---|---|
| `src/types/faq.ts` | FaqItem, FaqCategory, FAQ_CATEGORIES, NewFaqItem, FaqItemUpdate types | New |
| `src/hooks/useFaq.ts` | All Supabase queries + mutations, two hook exports | New |
| `src/components/FaqForm.tsx` | Add and edit modal form (dual mode) | New |
| `src/components/FaqAccordionItem.tsx` | Single FAQ accordion row for public page | New |
| `src/components/FaqSkeletonItem.tsx` | Loading placeholder for public page | New |
| `src/pages/FaqDashboard.tsx` | CMS dashboard: add, edit, delete, publish toggle | New |
| `src/pages/FaqPage.tsx` | Public help centre: search, category filter, accordion | New |
| `src/App.tsx` | Routes + nav links + footer exclusion | Modified |

**Supabase:** 1 new table (`faq_items`) via `apply_migration`.

---

## 10. Implementation Order

1. Apply the Supabase migration to create the `faq_items` table
2. Create `src/types/faq.ts`
3. Create `src/hooks/useFaq.ts`
4. Create `src/components/FaqAccordionItem.tsx`
5. Create `src/components/FaqSkeletonItem.tsx`
6. Create `src/components/FaqForm.tsx`
7. Create `src/pages/FaqDashboard.tsx`
8. Create `src/pages/FaqPage.tsx`
9. Modify `src/App.tsx` (routes + nav + footer exclusion)
10. Test: add a FAQ item in draft mode → verify it does NOT appear on public page; publish it → verify it DOES appear on public page; edit it → verify changes reflect; use search and category filter on public page; delete via dashboard → verify it disappears publicly

---

## 11. Key Differences from Puzzle 133 (Testimonials)

| Feature | Testimonials (133) | FAQ (134) |
|---|---|---|
| Status model | Enum: `pending / approved / rejected` | Boolean: `published / draft` |
| Edit support | No (add only) | Yes (`FaqForm` dual mode via `initialData` prop) |
| `updated_at` column | No | Yes (shown in dashboard table, used for sorting) |
| Public page layout | Card grid | Accordion list |
| Public page filtering | None | Search (text) + Category (pill filter) |
| Public page search | None | Client-side debounced text search |
| Categories | Service-typed text (free input) | Enum: `General / Pricing / Services / Support / Delivery` |
| Category filter | Dashboard only (pill filter) | Both dashboard and public page |
| Form modes | Add only | Add and Edit (same component, `initialData` prop determines mode) |

---

## 12. Architecture Reuse Summary

| Pattern | Reused From | Applied To |
|---|---|---|
| Supabase client singleton | `src/lib/supabase.ts` | Same import in `useFaq.ts` |
| Two-flavor hook exports (`useX` / `usePublicX`) | `useTestimonials` | `useFaq` / `usePublicFaq` |
| Hook with fetchAll + mutations + loading/error state | `useTestimonials`, `useProducts` | `useFaq` |
| Type interfaces + Omit/Partial helper types | `types/testimonial.ts`, `types/booking.ts` | `types/faq.ts` |
| Modal form with overlay + header + footer + spinner | `TestimonialForm`, `ProductForm` | `FaqForm` |
| `inputClass` / `labelClass` constants | Existing forms | `FaqForm` |
| Stats cards row | `TestimonialsDashboard.tsx` | `FaqDashboard` |
| Filter pills (status + category) | `CategoryFilter.tsx`, `TestimonialsDashboard.tsx` | `FaqDashboard`, `FaqPage` |
| Table with skeleton + empty state + truncated text | `TestimonialsDashboard.tsx` | `FaqDashboard` |
| Delete confirm dialog | `TestimonialsDashboard.tsx` | `FaqDashboard` |
| Status badge pattern | `TestimonialsDashboard.tsx` (StatusBadge) | `FaqDashboard` (Published / Draft badge) |
| Skeleton animation (`.skeleton` class) | `index.css` | `FaqSkeletonItem` |
| `modal-container` animation class | `index.css` | `FaqForm` |
| Hero section pattern | `TestimonialsPage.tsx`, `BookingHome.tsx` | `FaqPage` |
| `useMemo` for client-side filtering | `TestimonialsDashboard.tsx` | `FaqDashboard`, `FaqPage` |
| Footer exclusion by route | `App.tsx` | Add `/faq/dashboard` to exclusion list |
| Tailwind design tokens (CSS vars) | `index.css` | All new components use same vars |
| `NavLink` with `linkBase` / `linkActive` classes | `App.tsx` | Two new nav links |
