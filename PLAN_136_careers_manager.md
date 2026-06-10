# Puzzle #136 — Careers & Applicant Manager: Implementation Plan

## Overview

Build a mini hiring pipeline laid on top of the existing architecture:
- Two new Supabase tables (`job_listings`, `job_applications`) + one storage bucket (`applicant-cvs`)
- One new types file, one new hooks file
- Three new components (JobForm, JobCard, ApplicationForm)
- One dashboard page (no auth) with two tabs: **Job Listings** (CRUD + publish/close) and **Applications** (view + status triage)
- One public careers page showing only **open** jobs, with an apply modal (form + CV upload)
- Two new routes in App.tsx

No existing pages are reused; only architecture patterns are reused. Only `App.tsx` is modified (imports, routes, nav links, footer exclusion).

---

## 1. Supabase Table: `job_listings`

| Column          | Type        | Constraints                                            |
|-----------------|-------------|--------------------------------------------------------|
| id              | uuid        | PRIMARY KEY, default gen_random_uuid()                 |
| title           | text        | NOT NULL                                               |
| department      | text        | NOT NULL                                               |
| location        | text        | NOT NULL (e.g. "Remote", "Austin, TX")                 |
| employment_type | text        | NOT NULL, CHECK in ('full-time','part-time','contract')|
| salary_range    | text        | NULLABLE (free text, e.g. "$90k–$120k")                |
| description     | text        | NOT NULL                                               |
| requirements    | text        | NOT NULL (newline-separated list, rendered as bullets) |
| status          | text        | NOT NULL DEFAULT 'draft', CHECK in ('draft','open','closed') |
| created_at      | timestamptz | NOT NULL DEFAULT now()                                 |
| updated_at      | timestamptz | NOT NULL DEFAULT now()                                 |

**Status lifecycle:** `draft` (not public) → `open` (published, visible + accepting applications) → `closed` (hidden from public). Dashboard actions: Publish (draft→open), Close (open→closed), Reopen (closed→open).

## 2. Supabase Table: `job_applications`

| Column       | Type        | Constraints                                                        |
|--------------|-------------|--------------------------------------------------------------------|
| id           | uuid        | PRIMARY KEY, default gen_random_uuid()                             |
| job_id       | uuid        | NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE             |
| full_name    | text        | NOT NULL                                                           |
| email        | text        | NOT NULL                                                           |
| phone        | text        | NULLABLE                                                           |
| cover_note   | text        | NULLABLE                                                           |
| cv_url       | text        | NOT NULL (public URL into `applicant-cvs` bucket)                  |
| status       | text        | NOT NULL DEFAULT 'new', CHECK in ('new','reviewed','shortlisted','rejected') |
| created_at   | timestamptz | NOT NULL DEFAULT now()                                             |

Index on `job_id` (FK index best practice).

## 3. Storage Bucket: `applicant-cvs`

Public bucket (so the dashboard can open CV links directly). Policies: anon SELECT, anon INSERT — matches the existing `case-study-images` / `product-images` bucket pattern. File naming: `${Date.now()}-${file.name}`. Accepted types client-side: `.pdf,.doc,.docx`.

## 4. SQL Migration (applied via Supabase MCP `apply_migration`)

```sql
CREATE TABLE job_listings (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  department      text        NOT NULL,
  location        text        NOT NULL,
  employment_type text        NOT NULL DEFAULT 'full-time'
                              CHECK (employment_type IN ('full-time', 'part-time', 'contract')),
  salary_range    text,
  description     text        NOT NULL,
  requirements    text        NOT NULL,
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'open', 'closed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE job_applications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     uuid        NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  full_name  text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  cover_note text,
  cv_url     text        NOT NULL,
  status     text        NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_applications_job_id ON job_applications (job_id);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all anon access" ON job_listings
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all anon access" ON job_applications
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- updated_at trigger (function update_updated_at_column() already exists from puzzle 135;
-- CREATE OR REPLACE keeps this idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket + policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-cvs', 'applicant-cvs', true);

CREATE POLICY "Public read applicant-cvs"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'applicant-cvs');

CREATE POLICY "Anon upload applicant-cvs"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'applicant-cvs');
```

---

## 5. TypeScript Types — `src/types/career.ts` (CREATE)

```typescript
export type JobStatus = 'draft' | 'open' | 'closed';
export type ApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected';

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: 'full-time' | 'part-time' | 'contract';
  salary_range: string | null;
  description: string;
  requirements: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  employment_type: JobListing['employment_type'];
  salary_range: string | null;
  description: string;
  requirements: string;
  status: JobStatus;
}

export interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_note: string | null;
  cv_url: string;
  status: ApplicationStatus;
  created_at: string;
  job_listings?: { title: string } | null;   // joined job title for dashboard
}

export interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  cover_note: string;
}
```

---

## 6. Hooks — `src/hooks/useCareers.ts` (CREATE)

Follows the `useCaseStudies.ts` base-hook pattern.

### `useJobListings()` / `usePublicJobs()`
Shared base `useJobsBase(openOnly: boolean)`:
- State: `jobs: JobListing[]`, `loading`, `error`
- `getJobs()` — all rows, `created_at DESC` (dashboard)
- `getOpenJobs()` — `.eq('status', 'open')`, `created_at DESC` (public)
- `createJob(data: JobFormData)` — insert, refresh
- `updateJob(id, data: JobFormData)` — update, refresh
- `deleteJob(id)` — delete row (applications cascade), refresh
- `updateJobStatus(id, status: JobStatus)` — patch status, refresh

### `useApplications()` (dashboard only)
- State: `applications: JobApplication[]`, `loading`, `error`
- `getApplications()` — `.select('*, job_listings(title)')`, `created_at DESC`
- `updateApplicationStatus(id, status: ApplicationStatus)` — patch, refresh

### Standalone exports (public apply flow, no state needed)
- `uploadCv(file: File): Promise<string>` — upload to `applicant-cvs`, return public URL (mirrors `uploadImage` in useCaseStudies)
- `submitApplication(jobId: string, data: ApplicationFormData, cvUrl: string)` — insert into `job_applications`

---

## 7. Components

### 7a. `src/components/JobForm.tsx` (CREATE)
Dashboard create/edit modal. Mirrors `CaseStudyForm.tsx` exactly (overlay, modal-container, header with X, scrollable body, footer buttons, spinner on submit).

**Props:** `{ initialData?: JobListing | null; onSubmit: (data: JobFormData) => Promise<void>; onCancel: () => void; submitting: boolean }`

**Fields:** Title (text, required) · Department (text, required) · Location (text, required) · Employment Type (select: Full-time/Part-time/Contract) · Salary Range (text, optional) · Description (textarea 4 rows, required) · Requirements (textarea 4 rows, required, "one per line" hint) · Status (select: Draft/Open/Closed). No image/file field — simpler than CaseStudyForm.

### 7b. `src/components/JobCard.tsx` (CREATE)
Public card for an open job. White surface card, rounded-xl, border, shadow-sm:
- Header: title (font-display) + employment-type pill
- Meta row: department · location · salary range (if present), small secondary text with icons
- Description (3-line clamp)
- Requirements rendered as bulleted list (split on newlines, show first 4 with "+N more")
- Footer: "Apply for this role" accent button → opens apply modal (callback prop `onApply(job)`)

Also export `JobCardSkeleton` (pulse placeholder, matches `CaseStudyCardSkeleton` pattern).

### 7c. `src/components/ApplicationForm.tsx` (CREATE)
Public apply modal. Same modal shell as JobForm. Header shows "Apply — {job.title}".

**Props:** `{ job: JobListing; onClose: () => void }`

**Fields:** Full Name (required) · Email (type=email, required) · Phone (optional) · Cover Note (textarea, optional) · CV upload (required; hidden file input `accept=".pdf,.doc,.docx"`, dashed drop-zone style like CaseStudyForm's image zone but document-styled: file icon + chosen filename + size).

**Submit flow (self-contained):** validate CV selected → `uploadCv(file)` → `submitApplication(job.id, form, cvUrl)` → success state inside the modal (checkmark + "Application received — we'll be in touch") with a Close button. Errors shown inline; submit button disabled + spinner while submitting.

---

## 8. Dashboard Page — `src/pages/CareersDashboard.tsx` (CREATE)

**Route:** `/careers/dashboard`. Follows `CaseStudiesDashboard.tsx` structure with an added top-level **tab switcher**: `Job Listings | Applications` (pill buttons; Applications pill shows count badge of `new` applications).

### Tab 1: Job Listings
- Header: "Careers" + "+ New Job" button
- Stat cards: Total · Open · Draft · Closed
- Filter pills: All / Open / Draft / Closed + search by title
- Table: Title | Department | Location | Type | Status badge | Created | Actions
  - Status badge: Open=green (`bg-success-bg text-success`), Draft=gray (`bg-subtle text-secondary`), Closed=red (`bg-error-bg text-error`)
  - Actions: context-aware status button (Draft→"Publish", Open→"Close", Closed→"Reopen") + Edit icon + Delete icon
- Add/Edit modal → `JobForm`; Delete confirm modal (warns applications will be deleted too — cascade)
- Loading: `TableSkeleton` rows; Empty state: icon + message

### Tab 2: Applications
- Stat cards: Total · New · Shortlisted · Rejected
- Filter pills: All / New / Reviewed / Shortlisted / Rejected + search by applicant name
- Table: Applicant (name + email stacked) | Job (joined title) | Phone | CV (download-icon link, `target="_blank"`) | Applied (date) | Status (inline `<select>` styled as badge-colored dropdown — changing it calls `updateApplicationStatus`)
  - Status colors: New=accent/blue tint, Reviewed=gray, Shortlisted=green, Rejected=red
- Row expand (click) showing cover note, if present — simple toggle, optional nicety
- Loading skeleton + empty state

---

## 9. Public Page — `src/pages/CareersPage.tsx` (CREATE)

**Route:** `/careers`. Follows `CaseStudiesPage.tsx` structure.

- **Hero:** eyebrow "Join the Team" · "Careers" (font-display 4xl/5xl) · subtitle "Help us craft goods people love. Browse our open roles." · `bg-accent/5` band
- **Data:** `usePublicJobs()` — open jobs only
- **Body:** single-column list of `JobCard`s (max-w ~768px centered — job posts read better stacked than in a grid), count line "N open positions"
- **Apply modal:** page-level state `applyTarget: JobListing | null`; `<ApplicationForm job={applyTarget} onClose={...} />` when set
- **Loading:** 3× `JobCardSkeleton`; **Empty:** icon + "No open positions right now — check back soon."
- Footer renders automatically (public page).

---

## 10. App.tsx Changes (MODIFY)

1. Import `CareersPage`, `CareersDashboard`
2. Routes: `/careers` → CareersPage, `/careers/dashboard` → CareersDashboard
3. Nav links: "Careers" and "Careers Dashboard" (same NavLink pattern)
4. Footer exclusion: add `location.pathname === '/careers/dashboard'` to `hideFooter`

---

## 11. File Summary

| File | Action |
|---|---|
| `src/types/career.ts` | CREATE |
| `src/hooks/useCareers.ts` | CREATE |
| `src/components/JobForm.tsx` | CREATE |
| `src/components/JobCard.tsx` | CREATE |
| `src/components/ApplicationForm.tsx` | CREATE |
| `src/pages/CareersDashboard.tsx` | CREATE |
| `src/pages/CareersPage.tsx` | CREATE |
| `src/App.tsx` | MODIFY |
| Supabase: `job_listings`, `job_applications`, `applicant-cvs` bucket | CREATE via MCP migration |

## 12. Implementation Order

1. Supabase migration (tables + bucket + policies) — requires MCP auth
2. `src/types/career.ts`
3. `src/hooks/useCareers.ts`
4. Components: `JobForm`, `JobCard`, `ApplicationForm`
5. Pages: `CareersDashboard`, `CareersPage`
6. `App.tsx` routes/nav/footer
7. Verify: `npm run build` (tsc + vite), then dev-server smoke test of both pages

## 13. Key Decisions

- **Three-state job lifecycle** (`draft/open/closed`) directly satisfies "add, edit, publish, and close"; public page filters `status = 'open'`
- **Tabbed single dashboard** keeps jobs + applications in one place (one route), matching the one-dashboard-per-feature convention
- **CV bucket is public** so the dashboard can open CVs with a plain link — consistent with every other bucket in this project; no auth exists anywhere by design
- **`requirements` as newline-separated text** — avoids array columns/JSON, trivial to edit in a textarea, rendered as bullets
- **Inline status `<select>` on applications** instead of a cycle button — four states make cycling tedious; a dropdown is one click to any state
- **`ON DELETE CASCADE`** on applications — deleting a job cleans up its pipeline; delete modal warns about it
- **No edits to existing components** — `ImageUpload.tsx` is image-specific and hardwired to the products bucket, so the CV picker is built into `ApplicationForm` (matching how `CaseStudyForm` inlined its own picker)
