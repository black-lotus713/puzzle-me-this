import { useState } from 'react'
import type { FaqItem, NewFaqItem, FaqCategory } from '../types/faq'
import { FAQ_CATEGORIES } from '../types/faq'

interface Props {
  initialData?: FaqItem
  onSave: (data: NewFaqItem) => Promise<void>
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

export default function FaqForm({ initialData, onSave, onCancel }: Props) {
  const [form, setForm] = useState<NewFaqItem>({
    question: initialData?.question ?? '',
    answer: initialData?.answer ?? '',
    category: initialData?.category ?? 'General',
    published: initialData?.published ?? false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof NewFaqItem>(key: K, value: NewFaqItem[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await onSave({
        ...form,
        question: form.question.trim(),
        answer: form.answer.trim(),
      })
    } catch (err) {
      setError('Save failed. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEdit = !!initialData

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-lg">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <h2 className="font-display text-xl text-primary">{isEdit ? 'Edit FAQ Item' : 'Add FAQ Item'}</h2>
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
              {/* Question */}
              <div>
                <label className={labelClass}>Question</label>
                <textarea
                  required
                  rows={2}
                  value={form.question}
                  onChange={(e) => set('question', e.target.value)}
                  placeholder="e.g. How do I track my order?"
                  className={`${inputClass} h-auto min-h-[60px] py-[10px] resize-vertical`}
                />
              </div>

              {/* Answer */}
              <div>
                <label className={labelClass}>Answer</label>
                <textarea
                  required
                  rows={5}
                  value={form.answer}
                  onChange={(e) => set('answer', e.target.value)}
                  placeholder="Provide a clear answer…"
                  className={`${inputClass} h-auto min-h-[120px] py-[10px] resize-vertical`}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value as FaqCategory)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    {FAQ_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                    <ChevronDown />
                  </span>
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="faq-published"
                  checked={form.published}
                  onChange={(e) => set('published', e.target.checked)}
                  className="w-4 h-4 accent-accent rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <label htmlFor="faq-published" className="text-sm font-semibold text-secondary cursor-pointer">
                  Published (visible on public page)
                </label>
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
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add FAQ Item'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
