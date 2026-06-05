import { useState } from 'react'
import type { NewSlot } from '../types/booking'
import { createSlot } from '../hooks/useBooking'

interface Props {
  onSaved: () => void
  onCancel: () => void
}

const inputClass =
  'w-full h-10 px-[14px] bg-surface border-[1.5px] border-border rounded-md text-sm text-primary ' +
  'placeholder:text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/15 ' +
  'transition-[border-color,box-shadow] duration-[150ms] disabled:bg-subtle disabled:opacity-70'

const labelClass = 'block text-sm font-semibold text-secondary mb-[6px]'

export default function SlotForm({ onSaved, onCancel }: Props) {
  const [form, setForm] = useState<NewSlot>({
    date: '',
    start_time: '',
    end_time: '',
    label: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof NewSlot>(key: K, value: NewSlot[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.end_time <= form.start_time) {
      setError('End time must be after start time.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createSlot(form)
      onSaved()
    } catch (err) {
      setError('Failed to save slot. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
      <div className="modal-container bg-surface rounded-2xl shadow-modal w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-subtle">
          <h2 className="font-display text-xl font-semibold text-primary">Add Time Slot</h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-subtle text-tertiary hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-5">
            <div>
              <label className={labelClass}>Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelClass}>Start Time</label>
                <input
                  required
                  type="time"
                  value={form.start_time}
                  onChange={(e) => set('start_time', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>End Time</label>
                <input
                  required
                  type="time"
                  value={form.end_time}
                  onChange={(e) => set('end_time', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Label</label>
              <input
                required
                type="text"
                value={form.label}
                onChange={(e) => set('label', e.target.value)}
                placeholder="e.g. Morning Consultation"
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-subtle px-6 py-4">
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
                {saving ? 'Saving…' : 'Add Slot'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
