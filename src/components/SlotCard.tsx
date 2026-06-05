import type { BookingSlot } from '../types/booking'
import { formatDate, formatTime } from '../hooks/useBooking'

interface Props {
  slot: BookingSlot
  selected: boolean
  onClick: () => void
}

export default function SlotCard({ slot, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
        selected
          ? 'border-accent bg-accent-light shadow-md'
          : 'border-border bg-surface hover:border-border-strong hover:shadow-sm'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent mb-1">
        {formatDate(slot.date)}
      </p>
      <p className="text-base font-semibold text-primary">
        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
      </p>
      <p className="text-sm text-secondary mt-1">{slot.label}</p>
      {selected && (
        <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-accent">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1,6 5,10 11,2" />
          </svg>
          Selected
        </span>
      )}
    </button>
  )
}
