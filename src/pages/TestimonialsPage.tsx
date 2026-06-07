import { usePublicTestimonials } from '../hooks/useTestimonials'
import TestimonialCard, { TestimonialCardSkeleton } from '../components/TestimonialCard'

export default function TestimonialsPage() {
  const { testimonials, loading } = usePublicTestimonials()

  return (
    <div>
      {/* Hero */}
      <section className="bg-accent/5 border-b border-border py-16 text-center px-4">
        <p className="text-xs uppercase tracking-[0.1em] font-semibold text-accent mb-3">Customer Reviews</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary">What Our Customers Say</h1>
        <p className="mt-3 text-base text-secondary max-w-[480px] mx-auto">Real reviews from real customers</p>
      </section>

      {/* Testimonials grid */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="font-display text-xl text-primary mt-4">No testimonials yet</p>
            <p className="text-sm text-secondary mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
