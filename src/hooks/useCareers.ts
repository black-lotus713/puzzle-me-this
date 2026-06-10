import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  JobListing,
  JobFormData,
  JobStatus,
  JobApplication,
  ApplicationFormData,
  ApplicationStatus,
} from '../types/career'

// ── Job listings ───────────────────────────────────────────

function useJobsBase(openOnly: boolean) {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false })
      if (openOnly) {
        query = query.eq('status', 'open')
      }
      const { data, error: err } = await query
      if (err) throw err
      setJobs(data)
    } catch (e) {
      setError('Failed to load job listings.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createJob(data: JobFormData): Promise<void> {
    const { error: err } = await supabase.from('job_listings').insert(data)
    if (err) throw err
    await refresh()
  }

  async function updateJob(id: string, data: JobFormData): Promise<void> {
    const { error: err } = await supabase
      .from('job_listings')
      .update(data)
      .eq('id', id)
    if (err) throw err
    await refresh()
  }

  async function deleteJob(id: string): Promise<void> {
    const { error: err } = await supabase.from('job_listings').delete().eq('id', id)
    if (err) throw err
    await refresh()
  }

  async function updateJobStatus(id: string, status: JobStatus): Promise<void> {
    const { error: err } = await supabase
      .from('job_listings')
      .update({ status })
      .eq('id', id)
    if (err) throw err
    await refresh()
  }

  return { jobs, loading, error, createJob, updateJob, deleteJob, updateJobStatus }
}

export function useJobListings() {
  return useJobsBase(false)
}

export function usePublicJobs() {
  return useJobsBase(true)
}

// ── Applications (dashboard) ───────────────────────────────

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('job_applications')
        .select('*, job_listings(title)')
        .order('created_at', { ascending: false })
      if (err) throw err
      setApplications(data)
    } catch (e) {
      setError('Failed to load applications.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
    const { error: err } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', id)
    if (err) throw err
    await refresh()
  }

  return { applications, loading, error, updateApplicationStatus }
}

// ── Public apply flow ──────────────────────────────────────

export async function uploadCv(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`
  const { error: err } = await supabase.storage
    .from('applicant-cvs')
    .upload(filename, file)
  if (err) throw err
  const { data } = supabase.storage.from('applicant-cvs').getPublicUrl(filename)
  return data.publicUrl
}

export async function submitApplication(
  jobId: string,
  form: ApplicationFormData,
  cvUrl: string
): Promise<void> {
  const { error: err } = await supabase.from('job_applications').insert({
    job_id: jobId,
    full_name: form.full_name,
    email: form.email,
    phone: form.phone || null,
    cover_note: form.cover_note || null,
    cv_url: cvUrl,
  })
  if (err) throw err
}
