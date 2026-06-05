import { supabase } from '../lib/supabase'
import type { BookingSlot, Booking, NewSlot, NewBooking } from '../types/booking'

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = minuteStr
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 || 12
  return `${h}:${minute} ${ampm}`
}

export async function getAvailableSlots(): Promise<BookingSlot[]> {
  const { data, error } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('status', 'available')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function getAllSlots(): Promise<BookingSlot[]> {
  const { data, error } = await supabase
    .from('booking_slots')
    .select('*')
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function createSlot(data: NewSlot): Promise<BookingSlot> {
  const { data: result, error } = await supabase
    .from('booking_slots')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function deleteSlot(id: string): Promise<void> {
  const { error } = await supabase.from('booking_slots').delete().eq('id', id)
  if (error) throw error
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, booking_slots(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function submitBooking(data: NewBooking): Promise<Booking> {
  const { data: slotData, error: slotError } = await supabase
    .from('booking_slots')
    .select('status')
    .eq('id', data.slot_id)
    .single()
  if (slotError) throw slotError
  if (slotData.status !== 'available') throw new Error('Slot already booked')

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert(data)
    .select()
    .single()
  if (bookingError) {
    if (bookingError.code === '23505') throw new Error('Slot already booked')
    throw bookingError
  }

  const { error: updateError } = await supabase
    .from('booking_slots')
    .update({ status: 'booked' })
    .eq('id', data.slot_id)
  if (updateError) throw updateError

  return booking
}
