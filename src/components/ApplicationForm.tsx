import { useRef, useState } from 'react'
import { uploadCv, submitApplication } from '../hooks/useCareers'
import type { JobListing, ApplicationFormData } from '../types/career'

interface ApplicationFormProps {
  job: JobListing
  onClose: () => void
}

const inputClass =
  'w-full h-10 px-[14px] bg-surface border-[1.5px] border-border rounded-md text-sm text-primary ' +
  'placeholder:text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/15 ' +
  'transition-[border-color,box-shadow] duration-[150ms] disabled:bg-subtle disabled:opacity-70'

const labelClass = 'block text-sm font-semibold text-secondary mb-[6px]'

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ApplicationForm({ job, onClose }: ApplicationFormProps) {
  const [form, setForm] = useState<ApplicationFormData>({
    full_name: '',
    email: '',
    phone: '',
    cover_note: '',
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFile(file)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cvFile) {
      setError('Please attach your CV or resume.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const cvUrl = await uploadCv(cvFile)
      await submitApplication(job.id, form, cvUrl)
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong submitting your application. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-8 pb-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <div>
              <h2 className="font-display text-xl text-primary">Apply</h2>
              <p className="mt-0.5 text-sm text-secondary">{job.title} · {job.location}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <IconX />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="px-8 pb-8 flex flex-col items-center text-center py-10">
            <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center">
              <IconCheck />
            </div>
            <p className="font-display text-xl text-primary mt-5">Application received</p>
            <p className="text-sm text-secondary mt-2 max-w-[340px]">
              Thanks for applying for {job.title}. We'll review your application and be in touch.
            </p>
            <button
              onClick={onClose}
              className="mt-7 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto px-8 pb-2 flex-1">
              <div className="space-y-5">
                {/* Full name */}
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    required
                    type="text"
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone <span className="font-normal text-tertiary">(optional)</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+1 555 000 0000"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Cover note */}
                <div>
                  <label className={labelClass}>Cover Note <span className="font-normal text-tertiary">(optional)</span></label>
                  <textarea
                    rows={4}
                    value={form.cover_note}
                    onChange={(e) => set('cover_note', e.target.value)}
                    placeholder="Tell us why you're a great fit…"
                    className={`${inputClass} h-auto py-[10px] resize-vertical`}
                  />
                </div>

                {/* CV upload */}
                <div>
                  <label className={labelClass}>CV / Resume</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div
                    className={`relative overflow-hidden rounded-md border-2 border-dashed cursor-pointer px-5 py-6 transition-all duration-[150ms] ${
                      cvFile
                        ? 'border-border-strong bg-surface'
                        : 'border-border-strong bg-subtle hover:border-accent hover:bg-accent-light'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {cvFile ? (
                      <div className="flex items-center gap-3">
                        <span className="text-accent shrink-0"><IconFile /></span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{cvFile.name}</p>
                          <p className="text-xs text-tertiary mt-0.5">{formatSize(cvFile.size)} · click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-tertiary"><IconFile /></span>
                        <span className="mt-2 text-sm text-secondary">Click to attach your CV</span>
                        <span className="mt-1 text-xs text-tertiary">PDF, DOC, DOCX</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 pt-6 border-t border-subtle mt-4">
              {error && <p className="mb-3 text-sm text-error">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-secondary rounded-md hover:text-primary hover:bg-subtle transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                >
                  {submitting && <span className="spinner" />}
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
