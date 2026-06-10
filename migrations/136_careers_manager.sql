-- Puzzle #136: Careers & Applicant Manager
-- Tables: job_listings, job_applications · Bucket: applicant-cvs

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

-- updated_at trigger (function may already exist from puzzle 135; CREATE OR REPLACE is idempotent)
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

-- Storage bucket for applicant CV uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-cvs', 'applicant-cvs', true);

CREATE POLICY "Public read applicant-cvs"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'applicant-cvs');

CREATE POLICY "Anon upload applicant-cvs"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'applicant-cvs');
