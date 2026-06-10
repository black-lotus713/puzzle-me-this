import { useState } from 'react'
import type { JobListing, JobFormData, JobStatus, EmploymentType } from '../types/career'

interface JobFormProps {
  initialData?: JobListing | null
  onSubmit: (data: JobFormData) => Promise<void>
  onCancel: () => void
  submitting: boolean
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

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  )
}

export default function JobForm({ initialData, onSubmit, onCancel, submitting }: JobFormProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState<JobFormData>({
    title: initialData?.title ?? '',
    department: initialData?.department ?? '',
    location: initialData?.location ?? '',
    employment_type: initialData?.employment_type ?? 'full-time',
    salary_range: initialData?.salary_range ?? null,
    description: initialData?.description ?? '',
    requirements: initialData?.requirements ?? '',
    status: initialData?.status ?? 'draft',
  })
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof JobFormData>(key: K, value: JobFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(form)
    } catch {
      setError('Save failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-8 pb-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <h2 className="font-display text-xl text-primary">
              {isEdit ? 'Edit Job Listing' : 'New Job Listing'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <IconX />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-8 pb-2 flex-1">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className={inputClass}
                />
              </div>

              {/* Department + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    required
                    type="text"
                    value={form.department}
                    onChange={(e) => set('department', e.target.value)}
                    placeholder="e.g. Design"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    required
                    type="text"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. Remote"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Employment Type + Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Employment Type</label>
                  <div className="relative">
                    <select
                      value={form.employment_type}
                      onChange={(e) => set('employment_type', e.target.value as EmploymentType)}
                      className={`${inputClass} appearance-none pr-9`}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                      <ChevronDown />
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Salary Range <span className="font-normal text-tertiary">(optional)</span></label>
                  <input
                    type="text"
                    value={form.salary_range ?? ''}
                    onChange={(e) => set('salary_range', e.target.value || null)}
                    placeholder="e.g. $90k–$120k"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="What the role involves, who you're looking for…"
                  className={`${inputClass} h-auto py-[10px] resize-vertical`}
                />
              </div>

              {/* Requirements */}
              <div>
                <label className={labelClass}>Requirements <span className="font-normal text-tertiary">(one per line)</span></label>
                <textarea
                  required
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => set('requirements', e.target.value)}
                  placeholder={'3+ years of experience\nStrong portfolio\nComfortable with ambiguity'}
                  className={`${inputClass} h-auto py-[10px] resize-vertical`}
                />
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value as JobStatus)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                    <ChevronDown />
                  </span>
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
                onClick={onCancel}
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
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
