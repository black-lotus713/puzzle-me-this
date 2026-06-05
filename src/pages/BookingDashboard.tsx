import { useEffect, useState } from 'react'
import type { BookingSlot, Booking } from '../types/booking'
import { getAllSlots, getAllBookings, deleteSlot, formatDate, formatTime } from '../hooks/useBooking'
import SlotForm from '../components/SlotForm'

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-t border-border">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="skeleton h-3 rounded w-24" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function BookingDashboard() {
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function loadSlots() {
    setLoadingSlots(true)
    getAllSlots()
      .then(setSlots)
      .finally(() => setLoadingSlots(false))
  }

  function loadBookings() {
    setLoadingBookings(true)
    getAllBookings()
      .then(setBookings)
      .finally(() => setLoadingBookings(false))
  }

  useEffect(() => {
    loadSlots()
    loadBookings()
  }, [])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteSlot(id)
      setSlots((prev) => prev.filter((s) => s.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
      <h1 className="font-display text-4xl font-bold text-primary mb-12">Booking Dashboard</h1>

      {/* ── Slot Management ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-primary">Available Slots</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-inverse bg-accent rounded-full hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Slot
          </button>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-subtle">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingSlots ? (
                  <TableSkeleton cols={5} />
                ) : slots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-secondary">
                      No slots yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="border-t border-border hover:bg-subtle/50 transition-colors duration-[100ms]">
                      <td className="px-4 py-3 text-primary">{formatDate(slot.date)}</td>
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      </td>
                      <td className="px-4 py-3 text-primary">{slot.label}</td>
                      <td className="px-4 py-3">
                        {slot.status === 'available' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-subtle text-tertiary">
                            Booked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          disabled={slot.status === 'booked' || deletingId === slot.id}
                          onClick={() => handleDelete(slot.id)}
                          className="text-xs font-semibold text-error hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline focus-visible:outline-none"
                        >
                          {deletingId === slot.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Submitted Bookings ── */}
      <section>
        <h2 className="font-display text-2xl text-primary mb-4">Bookings</h2>

        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-subtle">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Slot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-tertiary">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {loadingBookings ? (
                  <TableSkeleton cols={6} />
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-secondary">
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-border hover:bg-subtle/50 transition-colors duration-[100ms]">
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {booking.booking_slots ? formatDate(booking.booking_slots.date) : '—'}
                      </td>
                      <td className="px-4 py-3 text-primary whitespace-nowrap">
                        {booking.booking_slots
                          ? `${formatTime(booking.booking_slots.start_time)} – ${formatTime(booking.booking_slots.end_time)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-primary">{booking.customer_name}</td>
                      <td className="px-4 py-3 text-secondary">{booking.customer_email}</td>
                      <td className="px-4 py-3 text-secondary max-w-[200px] truncate">{booking.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {new Date(booking.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showForm && (
        <SlotForm
          onSaved={() => { setShowForm(false); loadSlots() }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
