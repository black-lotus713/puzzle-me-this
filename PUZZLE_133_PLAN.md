# Puzzle 133 — Testimonial Approval System: Implementation Plan

## Overview

Build a testimonial moderation system on top of the existing Vite + React + TypeScript + Supabase + Tailwind stack. Two new pages: a public testimonials page showing only approved reviews, and a no-auth dashboard for adding and moderating testimonials. All new — no existing pages reused.

---

## 1. Supabase Table

### Table: `testimonials`

```sql
create table testimonials (
  id          uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  review_text    text not null,
  rating         integer not null check (rating >= 1 and rating <= 5),
  service_used   text not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  created_at     timestamptz not null default now()
);
```

**No RLS** — consistent with the rest of the project (products, booking_slots, bookings are all open access).

---

## 2. TypeScript Types

### File: `src/types/testimonial.ts`

```typescript
export interface Testimonial {
  id: string
  customer_name: string
  review_text: string
  rating: number          // 1–5
  service_used: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type NewTestimonial = Omit<Testimonial, 'id' | 'status' | 'created_at'>
export type TestimonialStatus = Testimonial['status']
```

The `NewTestimonial` type mirrors the `NewSlot` / `NewBooking` pattern: omit server-generated fields for insert payloads.

---

## 3. Data Hook

### File: `src/hooks/useTestimonials.ts`

Mirrors the `useProducts` / `useBooking` pattern: async functions called in `useEffect`, local state, manual refetch.

**State:**
- `testimonials: Testimonial[]`
- `loading: boolean`
- `error: string | null`

**Functions exposed:**
- `fetchAll()` — loads all testimonials ordered by `created_at` descending (used by dashboard)
- `fetchApproved()` — loads only `status = 'approved'` ordered by `created_at` descending (used by public page)
- `addTestimonial(data: NewTestimonial): Promise<void>` — inserts with default `status = 'pending'`
- `updateStatus(id: string, status: TestimonialStatus): Promise<void>` — patches the status field only; triggers refetch
- `deleteTestimonial(id: string): Promise<void>` — hard delete; triggers refetch

The hook exports two flavors via the same file: `useTestimonials()` for the dashboard (calls `fetchAll`), and `usePublicTestimonials()` for the public page (calls `fetchApproved`). The second is a thin wrapper that calls the hook with a flag or simply calls `fetchApproved` directly in its own `useEffect`.

---

## 4. Components

### 4a. `src/components/StarRating.tsx`

Props: `rating: number` (1–5), `size?: 'sm' | 'md'`

Renders 5 star icons. Filled stars use the accent color (`text-[--color-accent]`), empty stars use the muted border color. Read-only display only — no interactive rating input; the form uses a numeric `<select>` or radio buttons instead.

### 4b. `src/components/TestimonialCard.tsx`

Used on the **public page only**.

Props: `testimonial: Testimonial`

Layout:
```
┌──────────────────────────────────────────┐
│  ★★★★☆  (StarRating component)           │
│  "Review text here as a blockquote..."   │
│                                          │
│  Customer Name          Service Used     │
│  (bold, primary)        (muted badge)    │
└──────────────────────────────────────────┘
```

Uses the same card styling as `ProductCard.tsx`: `bg-surface rounded-[--radius-lg] shadow-sm` with `p-6`. No status badge shown — public page only shows approved, so status is implicit.

### 4c. `src/components/TestimonialForm.tsx`

Used on the **dashboard only** to add new testimonials.

Props: `onSave: (data: NewTestimonial) => Promise<void>`, `onCancel: () => void`

Fields:
| Field | Input Type | Validation |
|---|---|---|
| Customer Name | `<input type="text">` | Required, trimmed |
| Review Text | `<textarea>` (3 rows) | Required, trimmed |
| Rating | `<select>` with options 1–5 | Required |
| Service Used | `<input type="text">` | Required, trimmed |

- Follows the same modal pattern as `ProductForm.tsx` and `SlotForm.tsx`
- Fixed overlay + centered container
- Header with title + close button (`×`)
- Sticky footer with "Add Testimonial" (primary) + "Cancel" (ghost) buttons
- Submit button shows a spinner while saving (same `isSubmitting` state pattern)
- `inputClass` and `labelClass` constants reused from existing form conventions
- Form state managed as a single object with a `set` helper

---

## 5. Dashboard Page

### File: `src/pages/TestimonialsDashboard.tsx`

Route: `/testimonials/dashboard`

**Page structure:**

```
Page Header
  Title: "Testimonials"
  Subtitle: "Manage customer reviews and control what appears publicly"
  [+ Add Testimonial] button (top-right, accent style)

Stats Row (3 cards — same pattern as Admin.tsx)
  Total | Approved | Pending | Rejected

Filter Bar
  Pill buttons: All | Pending | Approved | Rejected
  (same pill style as CategoryFilter.tsx)

Testimonials Table
  Columns: Customer | Rating | Service | Review (truncated) | Submitted | Status | Actions

Action Column (per row)
  - [Approve] button  →  calls updateStatus(id, 'approved')
  - [Reject] button   →  calls updateStatus(id, 'rejected')
  - [Pending] button  →  calls updateStatus(id, 'pending')   ← resets to pending
  - [Delete] icon     →  opens delete confirm dialog

Status Badges (inline in table)
  pending  → warning color  (amber bg/text, matching --color-warning-*)
  approved → success color  (green bg/text, matching --color-success-*)
  rejected → error color    (red bg/text, matching --color-error-*)

Delete Confirmation Dialog
  Same pattern as Admin.tsx: centered modal, "Are you sure?" message, Confirm + Cancel buttons
```

**Behavior notes:**
- The currently selected filter determines which testimonials are displayed (client-side filter on the already-loaded `testimonials` array — no additional DB calls per filter)
- The status action buttons shown per row depend on current status:
  - `pending` row shows: [Approve] [Reject]
  - `approved` row shows: [Mark Pending] [Reject]
  - `rejected` row shows: [Approve] [Mark Pending]
  - This avoids showing the current status as a button target
- Review text is truncated to ~80 chars with `title` tooltip showing full text on hover
- Skeleton loaders during initial data fetch (same `TableSkeleton` pattern used in `Admin.tsx`)
- Empty state with icon when no testimonials match the current filter

---

## 6. Public Page

### File: `src/pages/TestimonialsPage.tsx`

Route: `/testimonials`

**Page structure:**

```
Hero Section
  Headline: "What Our Customers Say"
  Subtitle: "Real reviews from real customers"
  (same hero pattern as Home.tsx — full-width, accent bg, centered text)

Testimonials Grid
  Responsive: 1 col (mobile) → 2 col (md) → 3 col (lg)
  Each cell: TestimonialCard component

Empty State
  Icon + "No testimonials yet. Check back soon!"
  (shown when no approved testimonials exist)

Loading State
  Grid of skeleton cards while fetching
  (3 placeholder cards using pulse animation)
```

**Behavior notes:**
- Fetches only `status = 'approved'` rows via `usePublicTestimonials()` hook
- No status controls, no add button, no admin UI of any kind
- Cards sorted by `created_at` descending (newest approved reviews first)
- Page is fully static in terms of UI — no user input except navigation
- No real-time subscription required; data loads on page mount

---

## 7. Routing Updates

### File: `src/App.tsx`

Add two new imports and two new `<Route>` entries inside the existing router:

```
/testimonials             → TestimonialsPage      (public)
/testimonials/dashboard   → TestimonialsDashboard (admin)
```

The footer should be hidden on `/testimonials/dashboard` — add it to the existing `useLocation()` conditional that already hides the footer on `/admin` and `/booking/dashboard`.

---

## 8. Navigation Updates

### File: `src/App.tsx` (header nav)

Add two nav links to the existing fixed header:

| Label | Route | Nav type |
|---|---|---|
| Testimonials | `/testimonials` | Public nav (alongside Home, Products, Booking) |
| Reviews Dashboard | `/testimonials/dashboard` | Could go in a secondary nav cluster with Admin |

The existing nav uses plain anchor-style `<Link>` elements. Follow the same pattern: no active-state styling beyond what's already used across the app.

---

## 9. File Creation Summary

| File | Purpose | New / Modified |
|---|---|---|
| `src/types/testimonial.ts` | Testimonial + NewTestimonial types | New |
| `src/hooks/useTestimonials.ts` | All Supabase queries + mutations | New |
| `src/components/StarRating.tsx` | Read-only star display | New |
| `src/components/TestimonialCard.tsx` | Public page card layout | New |
| `src/components/TestimonialForm.tsx` | Dashboard add modal | New |
| `src/pages/TestimonialsDashboard.tsx` | Moderation dashboard | New |
| `src/pages/TestimonialsPage.tsx` | Public-facing approved reviews | New |
| `src/App.tsx` | Routes + nav links | Modified |

**Supabase:** 1 new table (`testimonials`) via `apply_migration`.

---

## 10. Implementation Order

1. Apply the Supabase migration to create the `testimonials` table
2. Create `src/types/testimonial.ts`
3. Create `src/hooks/useTestimonials.ts`
4. Create `src/components/StarRating.tsx`
5. Create `src/components/TestimonialCard.tsx`
6. Create `src/components/TestimonialForm.tsx`
7. Create `src/pages/TestimonialsDashboard.tsx`
8. Create `src/pages/TestimonialsPage.tsx`
9. Modify `src/App.tsx` (routes + nav + footer exclusion)
10. Test: add a testimonial via dashboard, approve it, verify it appears on public page, reject it, verify it disappears

---

## Architecture Reuse Summary

| Pattern | Reused From | Applied To |
|---|---|---|
| Supabase client singleton | `src/lib/supabase.ts` | Same import |
| Hook with fetchAll + mutations + loading/error state | `useProducts`, `useBooking` | `useTestimonials` |
| Type interfaces + Omit helper types | `types/index.ts`, `types/booking.ts` | `types/testimonial.ts` |
| Modal form with overlay + header + footer | `ProductForm`, `SlotForm` | `TestimonialForm` |
| Stats cards row | `Admin.tsx` | `TestimonialsDashboard` |
| Filter pills | `CategoryFilter.tsx` | Status filter in dashboard |
| Table with skeleton + empty state | `Admin.tsx`, `BookingDashboard.tsx` | `TestimonialsDashboard` |
| Card grid with skeleton | `Home.tsx`, `Products.tsx` | `TestimonialsPage` |
| Footer exclusion by route | `App.tsx` | Add `/testimonials/dashboard` |
| Tailwind design tokens (CSS vars) | `index.css` | All new components use same vars |
| `inputClass` / `labelClass` constants | Existing forms | `TestimonialForm` |
| Delete confirm dialog | `Admin.tsx` | `TestimonialsDashboard` |
