import { useState } from 'react'
import type { NewTestimonial } from '../types/testimonial'

interface Props {
  onSave: (data: NewTestimonial) => Promise<void>
  onCancel: () => void
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

export default function TestimonialForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<NewTestimonial>({
    customer_name: '',
    review_text: '',
    rating: 5,
    service_used: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof NewTestimonial>(key: K, value: NewTestimonial[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await onSave({
        ...form,
        customer_name: form.customer_name.trim(),
        review_text: form.review_text.trim(),
        service_used: form.service_used.trim(),
      })
    } catch (err) {
      setError('Save failed. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-lg">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <h2 className="font-display text-xl text-primary">Add Testimonial</h2>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <IconX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-5">
              {/* Customer Name */}
              <div>
                <label className={labelClass}>Customer Name</label>
                <input
                  required
                  value={form.customer_name}
                  onChange={(e) => set('customer_name', e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className={inputClass}
                />
              </div>

              {/* Review Text */}
              <div>
                <label className={labelClass}>Review</label>
                <textarea
                  required
                  rows={3}
                  value={form.review_text}
                  onChange={(e) => set('review_text', e.target.value)}
                  placeholder="What did the customer say?"
                  className={`${inputClass} h-auto min-h-[80px] py-[10px] resize-vertical`}
                />
              </div>

              {/* Rating + Service Used row */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>Rating</label>
                  <div className="relative">
                    <select
                      value={form.rating}
                      onChange={(e) => set('rating', parseInt(e.target.value, 10))}
                      className={`${inputClass} appearance-none pr-9`}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                      <ChevronDown />
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Service Used</label>
                  <input
                    required
                    value={form.service_used}
                    onChange={(e) => set('service_used', e.target.value)}
                    placeholder="e.g. Custom Puzzle"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-subtle pt-6 mt-6">
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                >
                  {isSubmitting && <span className="spinner" />}
                  {isSubmitting ? 'Saving…' : 'Add Testimonial'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
