import { Link } from 'react-router-dom'
import type { BookingSlot } from '../types/booking'
import { formatDate, formatTime } from '../hooks/useBooking'

interface Props {
  slot: BookingSlot
  customerName: string
}

export default function BookingConfirmation({ slot, customerName }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-bg mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </div>

      <h2 className="font-display text-3xl font-bold text-primary mb-2">Booking Confirmed!</h2>
      <p className="text-secondary max-w-sm mb-8">
        Thanks, {customerName}. Your session is all set.
      </p>

      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm text-left mb-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent mb-3">Your Appointment</p>
        <p className="text-sm font-semibold text-primary">{slot.label}</p>
        <p className="text-sm text-secondary mt-1">{formatDate(slot.date)}</p>
        <p className="text-sm text-secondary">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</p>
      </div>

      <Link
        to="/booking"
        className="px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
      >
        Back to Home
      </Link>
    </div>
  )
}
