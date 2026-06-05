export interface BookingSlot {
  id: string
  date: string
  start_time: string
  end_time: string
  label: string
  status: 'available' | 'booked'
  created_at: string
}

export interface Booking {
  id: string
  slot_id: string
  customer_name: string
  customer_email: string
  notes: string | null
  created_at: string
  booking_slots?: BookingSlot
}

export type NewSlot = Omit<BookingSlot, 'id' | 'status' | 'created_at'>
export type NewBooking = Omit<Booking, 'id' | 'created_at' | 'booking_slots'>
