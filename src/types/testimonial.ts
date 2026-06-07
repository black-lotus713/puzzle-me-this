export interface Testimonial {
  id: string
  customer_name: string
  review_text: string
  rating: number
  service_used: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type NewTestimonial = Omit<Testimonial, 'id' | 'status' | 'created_at'>
export type TestimonialStatus = Testimonial['status']
