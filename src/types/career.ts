export type JobStatus = 'draft' | 'open' | 'closed'
export type EmploymentType = 'full-time' | 'part-time' | 'contract'
export type ApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected'

export interface JobListing {
  id: string
  title: string
  department: string
  location: string
  employment_type: EmploymentType
  salary_range: string | null
  description: string
  requirements: string
  status: JobStatus
  created_at: string
  updated_at: string
}

export interface JobFormData {
  title: string
  department: string
  location: string
  employment_type: EmploymentType
  salary_range: string | null
  description: string
  requirements: string
  status: JobStatus
}

export interface JobApplication {
  id: string
  job_id: string
  full_name: string
  email: string
  phone: string | null
  cover_note: string | null
  cv_url: string
  status: ApplicationStatus
  created_at: string
  job_listings?: { title: string } | null
}

export interface ApplicationFormData {
  full_name: string
  email: string
  phone: string
  cover_note: string
}
