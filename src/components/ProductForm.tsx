import { useState } from 'react'
import type { Product } from '../types/index'
import ImageUpload from './ImageUpload'

type FormData = Omit<Product, 'id' | 'created_at'>

interface Props {
  product?: Product
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
}

const CATEGORIES = ['Home Decor', 'Kitchen', 'Textiles', 'Bathroom', 'Storage']

const inputClass =
  'w-full h-10 px-[14px] bg-surface border-[1.5px] border-border rounded-md text-sm text-primary ' +
  'placeholder:text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/15 ' +
  'transition-[border-color,box-shadow] duration-[150ms] disabled:bg-subtle disabled:opacity-70'

const labelClass = 'block text-sm font-semibold text-secondary mb-[6px]'

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  )
}

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    category: product?.category ?? CATEGORIES[0],
    image_url: product?.image_url ?? null,
    featured: product?.featured ?? false,
    status: product?.status ?? 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err) {
      setError('Save failed. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const descLen = form.description?.length ?? 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Scrollable body */}
      <div className="modal-scroll overflow-y-auto max-h-[calc(80vh-200px)]">
        <div className="space-y-5 pb-2">
          {/* Image upload */}
          <div>
            <label className={labelClass}>Product Image</label>
            <ImageUpload currentUrl={form.image_url} onUpload={(url) => set('image_url', url)} />
          </div>

          {/* Name + Price row */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-[3]">
              <label className={labelClass}>Product Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Woven Linen Throw"
                className={inputClass}
              />
            </div>
            <div className="flex-[2]">
              <label className={labelClass}>Price</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-subtle border-[1.5px] border-r-0 border-border rounded-l-md text-sm text-secondary select-none">
                  $
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  className={`${inputClass} rounded-l-none`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of the product…"
              className={`${inputClass} h-auto min-h-[80px] py-[10px] resize-vertical`}
            />
            <p className="mt-1 text-xs text-tertiary text-right">{descLen} / 500</p>
          </div>

          {/* Category + Status row */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                  <ChevronDown />
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as 'active' | 'draft')}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                  <ChevronDown />
                </span>
              </div>
            </div>
          </div>

          {/* Featured checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('featured', !form.featured)}
                className={`w-4 h-4 rounded-sm border-[1.5px] flex items-center justify-center transition-colors duration-[150ms] ${
                  form.featured
                    ? 'bg-accent border-accent'
                    : 'bg-surface border-border-strong'
                }`}
              >
                {form.featured && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="1,6 5,10 11,2" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              <span className="text-sm font-medium text-primary">Mark as featured on homepage</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
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
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          >
            {saving && <span className="spinner" />}
            {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </div>
    </form>
  )
}
