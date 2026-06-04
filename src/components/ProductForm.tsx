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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full border border-tan rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="w-full border border-tan rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Price ($)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
            className="w-full border border-tan rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full border border-tan rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value as 'active' | 'draft')}
            className="w-full border border-tan rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-olive bg-white"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="featured"
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="w-4 h-4 accent-olive"
          />
          <label htmlFor="featured" className="text-sm font-medium text-charcoal">Featured</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">Image</label>
        <ImageUpload currentUrl={form.image_url} onUpload={(url) => set('image_url', url)} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-charcoal bg-tan rounded hover:bg-olive/20 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm text-white bg-olive rounded hover:bg-olive/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  )
}
