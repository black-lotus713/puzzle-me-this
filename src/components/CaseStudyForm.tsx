import { useRef, useState } from 'react'
import type { CaseStudy, CaseStudyFormData, CaseStudyStatus } from '../types/caseStudy'

interface CaseStudyFormProps {
  initialData?: CaseStudy | null
  onSubmit: (data: CaseStudyFormData, imageFile: File | null) => Promise<void>
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

export default function CaseStudyForm({ initialData, onSubmit, onCancel, submitting }: CaseStudyFormProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState<CaseStudyFormData>({
    title: initialData?.title ?? '',
    client_type: initialData?.client_type ?? '',
    service_used: initialData?.service_used ?? '',
    result: initialData?.result ?? '',
    description: initialData?.description ?? '',
    image_url: initialData?.image_url ?? null,
    status: initialData?.status ?? 'draft',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof CaseStudyFormData>(key: K, value: CaseStudyFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(form, imageFile)
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
              {isEdit ? 'Edit Case Study' : 'New Case Study'}
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
                <label className={labelClass}>Title</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. E-commerce Rebrand"
                  className={inputClass}
                />
              </div>

              {/* Client Type */}
              <div>
                <label className={labelClass}>Client Type</label>
                <input
                  required
                  type="text"
                  value={form.client_type}
                  onChange={(e) => set('client_type', e.target.value)}
                  placeholder="e.g. E-commerce brand"
                  className={inputClass}
                />
              </div>

              {/* Service Used */}
              <div>
                <label className={labelClass}>Service Used</label>
                <input
                  required
                  type="text"
                  value={form.service_used}
                  onChange={(e) => set('service_used', e.target.value)}
                  placeholder="e.g. Brand Identity"
                  className={inputClass}
                />
              </div>

              {/* Result */}
              <div>
                <label className={labelClass}>Result</label>
                <input
                  required
                  type="text"
                  value={form.result}
                  onChange={(e) => set('result', e.target.value)}
                  placeholder="e.g. 3× revenue in 90 days"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Full case study body…"
                  className={`${inputClass} h-auto py-[10px] resize-vertical`}
                />
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value as CaseStudyStatus)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="featured">Featured</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                    <ChevronDown />
                  </span>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className={labelClass}>Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div
                  className={`aspect-[4/3] relative overflow-hidden rounded-md border-2 border-dashed cursor-pointer transition-all duration-[150ms] ${
                    imagePreview ? 'border-border-strong' : 'border-border-strong bg-subtle hover:border-accent hover:bg-accent-light'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/60 opacity-0 hover:opacity-100 transition-opacity duration-[150ms]">
                        <span className="text-sm text-inverse font-medium">Change image</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                        <polyline points="16,16 12,12 8,16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                      </svg>
                      <span className="mt-2 text-sm text-secondary">Click to upload</span>
                      <span className="mt-1 text-xs text-tertiary">PNG, JPG, WEBP — max 10MB</span>
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
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Case Study'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
