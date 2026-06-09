# Puzzle #135 — Case Study Manager: Implementation Plan

## Overview

Build a case study manager that follows the existing architecture exactly:
- Custom hook for all Supabase operations
- TypeScript types file
- Two new components (card + form)
- One dashboard page (no auth, full CRUD)
- One public page (read-only, published/featured only)
- Two new routes added to App.tsx

No existing files are modified beyond App.tsx (routes + nav + footer exclusion list).

---

## 1. Supabase Table: `case_studies`

Run via Supabase MCP `apply_migration`.

### Schema

| Column       | Type        | Constraints                              |
|--------------|-------------|------------------------------------------|
| id           | uuid        | PRIMARY KEY, default gen_random_uuid()   |
| title        | text        | NOT NULL                                 |
| client_type  | text        | NOT NULL                                 |
| service_used | text        | NOT NULL                                 |
| result       | text        | NOT NULL                                 |
| description  | text        | NOT NULL                                 |
| image_url    | text        | NULLABLE                                 |
| status       | text        | NOT NULL, default 'draft'                |
| created_at   | timestamptz | NOT NULL, default now()                  |
| updated_at   | timestamptz | NOT NULL, default now()                  |

### Status values (enforced via CHECK constraint)
`'draft' | 'published' | 'featured'`

### SQL Migration

```sql
CREATE TABLE case_studies (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  client_type  text        NOT NULL,
  service_used text        NOT NULL,
  result       text        NOT NULL,
  description  text        NOT NULL,
  image_url    text,
  status       text        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'published', 'featured')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS (match project pattern — all tables use anon access)
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all anon access" ON case_studies
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. Supabase Storage Bucket: `case-study-images`

Create via Supabase MCP `apply_migration` or dashboard.

### SQL

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-study-images', 'case-study-images', true);

CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'case-study-images');

CREATE POLICY "Allow anon uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'case-study-images');

CREATE POLICY "Allow anon deletes"
  ON storage.objects FOR DELETE TO anon
  USING (bucket_id = 'case-study-images');
```

File naming convention: `{Date.now()}-{original-filename}` (matches `product-images` bucket pattern).

---

## 3. TypeScript Types

**File:** `src/types/caseStudy.ts`

```typescript
export type CaseStudyStatus = 'draft' | 'published' | 'featured';

export interface CaseStudy {
  id: string;
  title: string;
  client_type: string;
  service_used: string;
  result: string;
  description: string;
  image_url: string | null;
  status: CaseStudyStatus;
  created_at: string;
  updated_at: string;
}

export interface CaseStudyFormData {
  title: string;
  client_type: string;
  service_used: string;
  result: string;
  description: string;
  image_url: string | null;
  status: CaseStudyStatus;
}
```

No changes to `src/types/index.ts` — this is a standalone file.

---

## 4. Custom Hook: `useCaseStudies`

**File:** `src/hooks/useCaseStudies.ts`

### State shape

```typescript
{
  caseStudies: CaseStudy[];
  loading: boolean;
  error: string | null;
}
```

### Exported functions

| Function | Purpose |
|---|---|
| `getCaseStudies()` | Fetch all records, ordered by `created_at DESC` — used by dashboard |
| `getPublishedCaseStudies()` | Fetch only `status IN ('published', 'featured')`, ordered by status DESC then created_at DESC — used by public page |
| `createCaseStudy(data: CaseStudyFormData)` | Insert new row, then call `getCaseStudies()` to refresh state |
| `updateCaseStudy(id: string, data: CaseStudyFormData)` | Update row by id, then refresh |
| `deleteCaseStudy(id: string, imageUrl: string \| null)` | Delete image from storage if `imageUrl` exists, then delete row, then refresh |
| `updateStatus(id: string, status: CaseStudyStatus)` | Patch only the `status` column, then refresh |
| `uploadImage(file: File)` | Upload to `case-study-images` bucket, return public URL string |

### Implementation notes

- `uploadImage` uses `supabase.storage.from('case-study-images').upload(filename, file)` then `getPublicUrl(filename)` — identical to the `useProducts.ts` pattern
- `deleteCaseStudy` extracts the filename from the URL path before storage deletion — match `useProducts.ts` pattern
- `getPublishedCaseStudies` uses `.in('status', ['published', 'featured'])` — featured rows come first naturally when ordered by status desc (f > p alphabetically), or explicitly order with a CASE expression if ordering matters
- All async operations use try/catch and set `error` state on failure

---

## 5. Components

### 5a. `CaseStudyCard.tsx`

**File:** `src/components/CaseStudyCard.tsx`

Used on the **public page only**. Two visual variants controlled by a `featured` boolean prop:

**Standard variant** (published):
- White card, `shadow-sm`, rounded-xl
- Image at top (full width, aspect-video, object-cover) with broken image fallback
- Body: client_type pill (muted), title (font-display), service_used (small label), result (accent color, semibold — the "proof" metric), description (2-line clamp, text-secondary)

**Featured variant** (`featured === true`):
- Slightly larger card, accent-tinted left border (4px solid accent), light accent background tint
- Same fields but result metric is visually emphasized (larger, bolder)
- Optional "Featured" ribbon/badge in top-right corner of image

**Props:**
```typescript
interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  featured?: boolean;
}
```

No actions — read-only display component.

---

### 5b. `CaseStudyForm.tsx`

**File:** `src/components/CaseStudyForm.tsx`

Used inside the dashboard modal for both create and edit. Mirrors `ProductForm.tsx` structure.

**Props:**
```typescript
interface CaseStudyFormProps {
  initialData?: CaseStudy | null;  // null = create mode
  onSubmit: (data: CaseStudyFormData, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}
```

**Fields in order:**
1. Title (text input, required)
2. Client Type (text input, required) — free text, e.g. "E-commerce brand", "SaaS startup"
3. Service Used (text input, required) — e.g. "Brand Identity", "SEO + Content"
4. Result (text input, required) — e.g. "3× revenue in 90 days"
5. Description (textarea, 4 rows, required) — full case study body
6. Status (select dropdown): Draft / Published / Featured
7. Image (reuse existing `ImageUpload` component — identical props pattern as ProductForm)

**Styling:** Match existing form styling exactly (same input class, same label class, same button styles for Submit/Cancel).

**Behavior:**
- In edit mode, `initialData` pre-fills all fields including `image_url` (passed to `ImageUpload` as `currentImageUrl`)
- `onSubmit` receives the form data object + the new File (or null if no new image selected)
- Parent handles the actual upload + save logic

---

## 6. Dashboard Page: `CaseStudiesDashboard`

**File:** `src/pages/CaseStudiesDashboard.tsx`

**Route:** `/case-studies/dashboard`

Follows `FaqDashboard.tsx` and `TestimonialsDashboard.tsx` structure exactly.

### Layout (top to bottom)

```
┌─────────────────────────────────────────────────────┐
│  [Title: Case Studies]         [+ New Case Study]   │
├─────────────────────────────────────────────────────┤
│  [Total: N]  [Published: N]  [Featured: N]  [Draft: N] │  ← stat cards
├─────────────────────────────────────────────────────┤
│  [All] [Published] [Featured] [Draft]   🔍 [search] │  ← filter tabs + search
├─────────────────────────────────────────────────────┤
│  TABLE                                              │
│  Thumb | Title | Client Type | Service | Status | Date | Actions │
│  ...rows...                                         │
└─────────────────────────────────────────────────────┘
```

### Stat cards
Counts computed from local `caseStudies` state (no extra queries):
- Total, Published, Featured, Draft

### Filter tabs
`All | Published | Featured | Draft` — filters the displayed table rows client-side.

### Search bar
Filter by `title` (case-insensitive `includes` on client-side state). Single input, no form submission.

### Table columns
| Column | Notes |
|---|---|
| Image | 48×48px thumbnail, object-cover, rounded, broken image fallback |
| Title | Primary text, truncated if long |
| Client Type | Secondary text |
| Service Used | Secondary text |
| Status | StatusBadge: Draft=gray, Published=green, Featured=amber |
| Created | Formatted date string |
| Actions | Edit icon button, Delete icon button, Status cycle button |

### Status cycle button
Clicking cycles through states in order: Draft → Published → Featured → Draft.
Uses a small icon (e.g., refresh/cycle icon) with tooltip text showing next status.

### Modals

**Add/Edit Modal:**
- Full-screen overlay, centered card (matches project modal pattern)
- Title: "New Case Study" or "Edit Case Study"
- Contains `CaseStudyForm` component
- On submit: call `uploadImage` if new file selected → set `image_url` → call `createCaseStudy` or `updateCaseStudy`
- On success: close modal, state auto-refreshes via hook

**Delete Confirmation Modal:**
- Matches existing delete modal pattern (simple confirm dialog)
- Shows case study title in the message
- On confirm: call `deleteCaseStudy(id, image_url)`

### Loading state
Table rows replaced with `TableSkeleton` component (define inline, 5 rows × columns, matches existing pattern in Admin/FaqDashboard).

### Empty state
Centered message with icon when no results match current filter/search.

---

## 7. Public Page: `CaseStudiesPage`

**File:** `src/pages/CaseStudiesPage.tsx`

**Route:** `/case-studies`

Follows `TestimonialsPage.tsx` and `FaqPage.tsx` structure.

### Data
Uses `getPublishedCaseStudies()` from `useCaseStudies` — returns only `status IN ('published', 'featured')`.

Split client-side into two arrays:
```typescript
const featured = caseStudies.filter(c => c.status === 'featured');
const published = caseStudies.filter(c => c.status === 'published');
```

### Layout (top to bottom)

```
┌─────────────────────────────────────────────────────┐
│                     HERO SECTION                    │
│  "Our Work"  (font-display, large)                  │
│  subtitle tagline                                   │
├─────────────────────────────────────────────────────┤
│  FEATURED SECTION (only rendered if featured.length > 0) │
│  "Featured Work"  ─────────────────────────────     │
│  Grid: 1 col (mobile) → 2 col (md+)                 │
│  CaseStudyCard featured={true} for each             │
├─────────────────────────────────────────────────────┤
│  ALL CASE STUDIES SECTION (only if published.length > 0) │
│  "All Case Studies"  ───────────────────────────    │
│  Grid: 1 col (mobile) → 2 col (md+) → 3 col (lg+)  │
│  CaseStudyCard featured={false} for each            │
├─────────────────────────────────────────────────────┤
│  EMPTY STATE (if both arrays empty + not loading)   │
│  Icon + "No case studies published yet."            │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘
```

### Loading state
Render 6 skeleton cards (gray placeholder divs with pulse animation, matching existing skeleton pattern).

### Hero section
- Heading: "Our Work" (or "Case Studies") in font-display
- Subheading: tagline about proof of value, e.g. "Real results for real clients."
- Subtle background tint (base color) matching site aesthetic

### Footer
Footer is rendered (this is a public page). App.tsx conditionally hides Footer only for `/dashboard` routes.

---

## 8. App.tsx Changes

**File:** `src/App.tsx`

Three targeted changes only:

### 8a. Import the two new pages
```typescript
import CaseStudiesPage from './pages/CaseStudiesPage'
import CaseStudiesDashboard from './pages/CaseStudiesDashboard'
```

### 8b. Add two new routes inside `<Routes>`
```tsx
<Route path="/case-studies" element={<CaseStudiesPage />} />
<Route path="/case-studies/dashboard" element={<CaseStudiesDashboard />} />
```

### 8c. Add navigation link in the `<nav>` header
Add `<NavLink to="/case-studies">` following the exact same pattern as existing nav links (active class, hover class, font-medium, etc.).

### 8d. Add dashboard route to footer exclusion list
The existing pattern in App.tsx checks the current path to decide whether to render `<Footer>`. Add `'/case-studies/dashboard'` to that list (exact check or `.includes('/dashboard')`).

Note: if the existing check already uses a generic `.includes('/dashboard')` pattern, no change is needed.

---

## 9. File Summary

| File | Action |
|---|---|
| `src/types/caseStudy.ts` | CREATE — TypeScript types |
| `src/hooks/useCaseStudies.ts` | CREATE — all Supabase operations |
| `src/components/CaseStudyCard.tsx` | CREATE — public display card (standard + featured variants) |
| `src/components/CaseStudyForm.tsx` | CREATE — dashboard create/edit form |
| `src/pages/CaseStudiesDashboard.tsx` | CREATE — dashboard page |
| `src/pages/CaseStudiesPage.tsx` | CREATE — public page |
| `src/App.tsx` | MODIFY — add imports, routes, nav link, footer exclusion |
| Supabase `case_studies` table | CREATE — via MCP `apply_migration` |
| Supabase `case-study-images` bucket | CREATE — via MCP `apply_migration` |

---

## 10. Implementation Order

1. Apply Supabase migration (table + storage bucket policies)
2. `src/types/caseStudy.ts`
3. `src/hooks/useCaseStudies.ts`
4. `src/components/CaseStudyCard.tsx`
5. `src/components/CaseStudyForm.tsx`
6. `src/pages/CaseStudiesDashboard.tsx`
7. `src/pages/CaseStudiesPage.tsx`
8. `src/App.tsx` (routes, nav, footer exclusion)

Each step builds on the previous. Steps 4 and 5 can be done in parallel. Steps 6 and 7 can be done in parallel after 4+5.

---

## 11. Design Consistency Notes

- Use existing CSS variable tokens: `text-primary`, `text-secondary`, `bg-surface`, `border-border`, `text-accent`, `bg-accent`, `text-inverse`
- Status badge colors: Draft → `bg-gray-100 text-gray-600`, Published → `bg-success/10 text-success`, Featured → `bg-warning/10 text-warning`
- All inputs use existing class pattern: `w-full h-10 px-[14px] bg-surface border-[1.5px] border-border rounded-md text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-accent`
- Textarea uses same border/background but no fixed height
- Primary button: `px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full hover:opacity-90 transition-opacity`
- Secondary/cancel button: `px-5 py-[10px] text-sm font-semibold text-primary bg-surface border border-border rounded-full hover:bg-base transition-colors`
- Font family for headings: `font-display` (Playfair Display)
- Font family for body: default sans (Inter)
- Container max-width: `max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16`

---

## 12. Key Architectural Decisions

- **No new auth** — dashboard is openly accessible, matching all other dashboards in the project
- **Status as text column** — consistent with `testimonials.status` and `faq_items.published` patterns; CHECK constraint enforces valid values
- **Client-side filtering** — split featured/published on the frontend after a single query; avoids two round-trips and keeps hook simple
- **Reuse `ImageUpload` component** — zero new image upload logic; just point it at the new bucket
- **No pagination** — consistent with existing pages; all items loaded in one query
- **`updated_at` trigger** — mirrors production-quality pattern; keeps audit trail for case study edits
