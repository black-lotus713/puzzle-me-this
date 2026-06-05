# Puzzle 132: Mini Booking System — Implementation Plan

## Overview

Build a mini booking system for a service business on top of the existing Vite + React + TypeScript + Supabase architecture. Reuse the project's routing, Supabase client, styling tokens, and component patterns. Create all-new pages, tables, types, hooks, and components — nothing from the product manager is reused directly.

---

## 1. Database Schema

### Table: `booking_slots`

Stores available time slots added by the dashboard operator.

```sql
CREATE TABLE booking_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date NOT NULL,
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  label       text NOT NULL,
  status      text NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'booked')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

- `label` — a short human-readable name for the slot (e.g. "Morning Consultation")
- `status` — starts as `'available'`, flips to `'booked'` when a booking is submitted
- No RLS (consistent with existing products table pattern)

### Table: `bookings`

Stores each submitted booking from the public booking page.

```sql
CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         uuid NOT NULL REFERENCES booking_slots(id),
  customer_name   text NOT NULL,
  customer_email  text NOT NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

- `slot_id` — FK ties each booking to one slot
- One booking per slot is enforced at the application layer (slot status check before insert) and optionally at the DB layer via a unique constraint or trigger

### Optional: DB-level double-booking guard

```sql
-- Prevent a slot from being booked twice at the database level
CREATE UNIQUE INDEX bookings_slot_id_unique ON bookings(slot_id);
```

This ensures that even under concurrent requests, only one booking per slot can be stored.

---

## 2. New Files & Directory Structure

```
src/
├── types/
│   └── booking.ts              # BookingSlot, Booking interfaces
│
├── hooks/
│   └── useBooking.ts           # All data functions for slots and bookings
│
├── components/
│   ├── SlotCard.tsx            # Public-facing slot selection card
│   ├── SlotForm.tsx            # Dashboard modal to add a new slot
│   └── BookingConfirmation.tsx # Confirmation panel shown after booking
│
└── pages/
    ├── BookingHome.tsx         # Public landing page for the service
    ├── BookingPage.tsx         # Public slot selection + booking form page
    └── BookingDashboard.tsx    # Dashboard: manage slots, view bookings
```

All new — no files from the product manager are modified except `App.tsx` (to add routes).

---

## 3. TypeScript Types (`src/types/booking.ts`)

```typescript
export interface BookingSlot {
  id: string
  date: string           // ISO date string 'YYYY-MM-DD'
  start_time: string     // 'HH:MM:SS'
  end_time: string       // 'HH:MM:SS'
  label: string
  status: 'available' | 'booked'
  created_at: string
}

export interface Booking {
  id: string
  slot_id: string
  customer_name: string
  customer_email: string
  notes: string | null
  created_at: string
  booking_slots?: BookingSlot   // optional joined shape
}

// Form input types (exclude server-generated fields)
export type NewSlot = Omit<BookingSlot, 'id' | 'status' | 'created_at'>
export type NewBooking = Omit<Booking, 'id' | 'created_at' | 'booking_slots'>
```

---

## 4. Data Layer (`src/hooks/useBooking.ts`)

All functions follow the same pattern as `useProducts.ts`: async, throw on error, return data.

```typescript
// Slot functions
getAvailableSlots(): Promise<BookingSlot[]>
  // SELECT * FROM booking_slots WHERE status = 'available' ORDER BY date, start_time

getAllSlots(): Promise<BookingSlot[]>
  // SELECT * FROM booking_slots ORDER BY date DESC, start_time

createSlot(data: NewSlot): Promise<BookingSlot>
  // INSERT INTO booking_slots (...) VALUES (...) RETURNING *

deleteSlot(id: string): Promise<void>
  // DELETE FROM booking_slots WHERE id = $id

// Booking functions
getAllBookings(): Promise<Booking[]>
  // SELECT bookings.*, booking_slots(*) FROM bookings
  // JOIN booking_slots ON bookings.slot_id = booking_slots.id
  // ORDER BY bookings.created_at DESC

submitBooking(data: NewBooking): Promise<Booking>
  // Step 1: SELECT status FROM booking_slots WHERE id = data.slot_id
  // Step 2: If status !== 'available', throw Error('Slot already booked')
  // Step 3: INSERT INTO bookings (...) VALUES (...) RETURNING *
  // Step 4: UPDATE booking_slots SET status = 'booked' WHERE id = data.slot_id
```

The `submitBooking` function performs the status check + insert + update as sequential operations. The unique index on `bookings.slot_id` acts as a final safety net against race conditions.

---

## 5. New Routes in `App.tsx`

Add three new routes alongside the existing ones. No existing routes are modified.

```
/booking          → <BookingHome />       Public landing page
/booking/book     → <BookingPage />       Public slot selection + form
/booking/dashboard → <BookingDashboard /> Operator dashboard (no auth)
```

The `Footer` visibility logic already keys off non-admin routes — the two public booking routes (`/booking`, `/booking/book`) should show the footer; the dashboard should not. Update the footer condition to exclude `/booking/dashboard` as well.

The existing nav header remains unchanged. No booking links are added to the main nav since these are separate concerns.

---

## 6. Page Designs

### 6a. `BookingHome.tsx` — Public Landing Page (`/booking`)

**Purpose:** Introduce the service and prompt visitors to book.

**Sections:**
1. **Hero** — Service name, tagline, a short description, and a prominent "Book a Session" CTA button linking to `/booking/book`
2. **How It Works** — Three-step explainer (1. Browse slots, 2. Fill in details, 3. Confirmed)
3. **About the Service** — Short paragraph describing the fictional service

**Styling:** Reuse the existing cream/olive color palette and Playfair Display font for headings. Match the visual weight of the existing `Home.tsx` hero section.

---

### 6b. `BookingPage.tsx` — Public Booking Page (`/booking/book`)

**Purpose:** Let a visitor pick an available slot and submit their booking.

**State:**
- `slots: BookingSlot[]` — loaded on mount, filtered to `status === 'available'`
- `selectedSlot: BookingSlot | null` — tracks which slot the visitor picked
- `form: { customer_name, customer_email, notes }` — booking form fields
- `loading: boolean`, `submitting: boolean`, `error: string | null`
- `confirmed: boolean` — toggles to show confirmation panel after success

**Layout (three phases, same page):**

**Phase 1 — Slot selection (no slot chosen yet):**
- Heading: "Choose a Time"
- Grid of `<SlotCard />` components, one per available slot
- Empty state if no slots are available: "No availability right now — check back soon."
- Skeleton loaders while fetching

**Phase 2 — Booking form (slot chosen):**
- Selected slot displayed at the top (date, time, label) with a "Change" link to deselect
- Form fields: Full Name (required), Email (required, type=email), Notes (optional textarea)
- "Confirm Booking" submit button with loading state
- Error message displayed inline if slot was already taken (race condition feedback)

**Phase 3 — Confirmation (`confirmed === true`):**
- Replaces the form with `<BookingConfirmation />` component
- Shows: booked slot date/time/label, customer name, confirmation message
- CTA: "Back to Home" link to `/booking`

---

### 6c. `BookingDashboard.tsx` — Operator Dashboard (`/booking/dashboard`)

**Purpose:** Let the operator add time slots and view submitted bookings. No authentication.

**Layout:** Two-section page (stacked vertically, or side-by-side on wide screens)

**Section 1 — Slot Management:**
- Header: "Available Slots" + "Add Slot" button (opens `<SlotForm />` modal)
- Table columns: Date | Time | Label | Status | Actions (Delete button)
- Status badge: green "Available" / gray "Booked"
- Booked slots cannot be deleted (button disabled)
- Empty state: "No slots yet. Add one to get started."
- Skeleton rows while loading

**Section 2 — Submitted Bookings:**
- Header: "Bookings"
- Table columns: Date | Slot | Customer Name | Email | Notes | Submitted At
- Read-only — no actions
- Empty state: "No bookings yet."
- Most recent first

---

## 7. Components

### `SlotCard.tsx`

A clickable card for the public booking page. Displays:
- Date (formatted: e.g. "Thursday, June 12")
- Time range (e.g. "10:00 AM – 11:00 AM")
- Label (e.g. "Morning Consultation")
- Selected state: olive border + background tint when `selected === true`

Props: `slot: BookingSlot`, `selected: boolean`, `onClick: () => void`

---

### `SlotForm.tsx`

Modal form for the dashboard operator to add a new slot. Fields:
- Date (input type=date, required)
- Start Time (input type=time, required)
- End Time (input type=time, required, must be after start)
- Label (text input, required, e.g. "Morning Consultation")

On submit: calls `createSlot()`, closes modal, triggers list refresh.

Follows the same modal pattern as `ProductForm.tsx`: overlay backdrop, centered card, Save/Cancel buttons.

---

### `BookingConfirmation.tsx`

Simple display component (no interactivity). Props:
- `slot: BookingSlot`
- `customerName: string`

Renders: a success icon, "Booking Confirmed!" heading, slot date/time/label, customer name, a friendly message, and a "Back to Home" link.

---

## 8. Formatting Helpers

Add two small utility functions inline in `useBooking.ts` or as named exports from a `src/lib/format.ts`:

```typescript
formatDate(dateStr: string): string
// '2026-06-12' → 'Thursday, June 12, 2026'

formatTime(timeStr: string): string
// '10:00:00' → '10:00 AM'
```

These are used in `SlotCard`, `BookingPage`, `BookingDashboard`, and `BookingConfirmation`.

---

## 9. Implementation Order

1. **Database** — Apply migrations for `booking_slots` and `bookings` tables (via Supabase MCP or SQL editor)
2. **Types** — Create `src/types/booking.ts`
3. **Data layer** — Create `src/hooks/useBooking.ts` with all six functions
4. **Components** — Build `SlotCard`, `SlotForm`, `BookingConfirmation`
5. **Pages** — Build `BookingHome`, `BookingPage`, `BookingDashboard`
6. **Routing** — Add three new routes in `App.tsx`, update footer condition
7. **Testing** — Manually test the full flow: add slot → book it → verify dashboard shows booking and slot shows as booked → attempt to book the same slot again and verify error

---

## 10. Edge Cases & Constraints

| Scenario | Handling |
|----------|----------|
| Visitor tries to book an already-booked slot (race condition) | `submitBooking` re-checks status before insert; unique index on `bookings.slot_id` is the final guard; user sees inline error "This slot was just taken — please choose another." |
| No available slots on booking page | Empty state message shown instead of grid |
| Dashboard: delete a booked slot | Delete button is disabled for slots with `status = 'booked'` |
| End time before start time in SlotForm | Client-side validation in form before submit |
| Email format on booking form | Uses `type="email"` and browser-native validation |
| Network error during booking | Caught in try/catch, error message shown inline |

---

## 11. What Is Reused from Existing Codebase

| Reused | What |
|--------|------|
| `src/lib/supabase.ts` | Supabase client (unchanged) |
| `App.tsx` | Router — new routes added only |
| `index.css` | All CSS custom properties (colors, fonts, shadows, animations) |
| `tailwind.config.js` | Tailwind theme (no changes) |
| `Footer.tsx` | Shown on public booking routes |
| Modal pattern | `SlotForm` mirrors the overlay + card pattern of `ProductForm` |
| Loading skeletons | Same `animate-pulse` skeleton pattern as `ProductCardSkeleton` |
| Async data function pattern | `useBooking.ts` mirrors `useProducts.ts` structure |

No existing pages (`Home.tsx`, `Products.tsx`, `Admin.tsx`) are modified. No existing DB tables are touched.
