import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Testimonial, NewTestimonial, TestimonialStatus } from '../types/testimonial'

function useTestimonialsBase(approved: boolean) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setTestimonials(data)
    } catch (e) {
      setError('Failed to load testimonials.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchApproved() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (err) throw err
      setTestimonials(data)
    } catch (e) {
      setError('Failed to load testimonials.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (approved) {
      fetchApproved()
    } else {
      fetchAll()
    }
  }, [])

  async function addTestimonial(data: NewTestimonial): Promise<void> {
    const { error: err } = await supabase.from('testimonials').insert(data)
    if (err) throw err
    await (approved ? fetchApproved() : fetchAll())
  }

  async function updateStatus(id: string, status: TestimonialStatus): Promise<void> {
    const { error: err } = await supabase
      .from('testimonials')
      .update({ status })
      .eq('id', id)
    if (err) throw err
    await (approved ? fetchApproved() : fetchAll())
  }

  async function deleteTestimonial(id: string): Promise<void> {
    const { error: err } = await supabase.from('testimonials').delete().eq('id', id)
    if (err) throw err
    await (approved ? fetchApproved() : fetchAll())
  }

  return { testimonials, loading, error, addTestimonial, updateStatus, deleteTestimonial }
}

export function useTestimonials() {
  return useTestimonialsBase(false)
}

export function usePublicTestimonials() {
  return useTestimonialsBase(true)
}
