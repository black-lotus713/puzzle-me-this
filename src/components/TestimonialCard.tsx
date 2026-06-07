import type { Testimonial } from '../types/testimonial'
import StarRating from './StarRating'

interface Props {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: Props) {
  return (
    <div className="bg-surface rounded-lg shadow-sm p-6 flex flex-col gap-4 border border-border">
      <StarRating rating={testimonial.rating} />
      <blockquote className="text-sm text-secondary leading-relaxed flex-1">
        "{testimonial.review_text}"
      </blockquote>
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-subtle">
        <span className="text-sm font-semibold text-primary">{testimonial.customer_name}</span>
        <span className="text-xs font-medium text-secondary bg-subtle px-2 py-1 rounded-full border border-border">
          {testimonial.service_used}
        </span>
      </div>
    </div>
  )
}

export function TestimonialCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg shadow-sm p-6 flex flex-col gap-4 border border-border">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton w-[18px] h-[18px] rounded" />
        ))}
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-subtle">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}
