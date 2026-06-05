import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BookingSlot } from '../types/booking'
import { getAvailableSlots, submitBooking, formatDate, formatTime } from '../hooks/useBooking'
import SlotCard from '../components/SlotCard'
import BookingConfirmation from '../components/BookingConfirmation'

function SlotCardSkeleton() {
  return (
    <div className="w-full p-5 rounded-xl border-[1.5px] border-border bg-surface">
      <div className="skeleton h-3 w-32 mb-2 rounded" />
      <div className="skeleton h-4 w-40 mb-2 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  )
}

const inputClass =
  'w-full h-10 px-[14px] bg-surface border-[1.5px] border-border rounded-md text-sm text-primary ' +
  'placeholder:text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/15 ' +
  'transition-[border-color,box-shadow] duration-[150ms] disabled:bg-subtle disabled:opacity-70'

const labelClass = 'block text-sm font-semibold text-secondary mb-[6px]'

export default function BookingPage() {
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)
  const [form, setForm] = useState({ customer_name: '', customer_email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedSlot, setConfirmedSlot] = useState<BookingSlot | null>(null)

  useEffect(() => {
    getAvailableSlots()
      .then(setSlots)
      .finally(() => setLoading(false))
  }, [])

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      await submitBooking({
        slot_id: selectedSlot.id,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        notes: form.notes || null,
      })
      setConfirmedSlot(selectedSlot)
      setConfirmed(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(
        msg === 'Slot already booked'
          ? 'This slot was just taken — please choose another.'
          : 'Booking failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed && confirmedSlot) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
        <BookingConfirmation slot={confirmedSlot} customerName={form.customer_name} />
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
      <div className="mb-2">
        <Link to="/booking" className="text-xs text-accent hover:underline">← Back to Home</Link>
      </div>

      {!selectedSlot ? (
        /* Phase 1: slot selection */
        <div>
          <h1 className="font-display text-4xl font-bold text-primary mb-2">Choose a Time</h1>
          <p className="text-secondary mb-8">Select an available slot to continue.</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SlotCardSkeleton key={i} />)}
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary mb-4">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-lg text-secondary">No availability right now — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  selected={false}
                  onClick={() => setSelectedSlot(slot)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Phase 2: booking form */
        <div className="max-w-lg">
          <h1 className="font-display text-4xl font-bold text-primary mb-6">Your Details</h1>

          {/* Selected slot summary */}
          <div className="bg-accent-light border border-accent-subtle rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent mb-1">Selected Slot</p>
              <p className="text-sm font-semibold text-primary">{selectedSlot.label}</p>
              <p className="text-sm text-secondary">{formatDate(selectedSlot.date)}</p>
              <p className="text-sm text-secondary">{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedSlot(null); setError(null) }}
              className="text-xs font-semibold text-accent hover:underline shrink-0 mt-1 focus-visible:outline-none"
            >
              Change
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                required
                type="text"
                value={form.customer_name}
                onChange={(e) => setField('customer_name', e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                required
                type="email"
                value={form.customer_email}
                onChange={(e) => setField('customer_email', e.target.value)}
                placeholder="jane@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Notes <span className="text-tertiary font-normal">(optional)</span></label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Anything you'd like us to know…"
                className={`${inputClass} h-auto min-h-[80px] py-[10px] resize-vertical`}
              />
            </div>

            {error && (
              <p className="text-sm text-error bg-error-bg rounded-md px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              {submitting && <span className="spinner" />}
              {submitting ? 'Confirming…' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
