import type { CaseStudy } from '../types/caseStudy'

interface CaseStudyCardProps {
  caseStudy: CaseStudy
  featured?: boolean
}

export default function CaseStudyCard({ caseStudy, featured = false }: CaseStudyCardProps) {
  const { title, client_type, service_used, result, description, image_url } = caseStudy

  if (featured) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border border-l-4 border-l-accent bg-accent/[0.03] overflow-hidden flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {image_url ? (
            <>
              <img
                src={image_url}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-subtle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-subtle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          )}
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold uppercase tracking-[0.06em] bg-accent text-inverse rounded-full shadow-sm">
            Featured
          </span>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-3 flex-1">
          <span className="text-xs font-medium text-secondary bg-subtle px-2 py-1 rounded-full border border-border self-start">
            {client_type}
          </span>
          <h3 className="font-display text-xl text-primary leading-snug">{title}</h3>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-secondary">{service_used}</p>
          <p className="text-2xl font-bold text-accent">{result}</p>
          <p className="text-sm text-secondary leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        {image_url ? (
          <>
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-subtle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-subtle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <span className="text-xs font-medium text-secondary bg-subtle px-2 py-1 rounded-full border border-border self-start">
          {client_type}
        </span>
        <h3 className="font-display text-lg text-primary leading-snug">{title}</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-secondary">{service_used}</p>
        <p className="text-base font-semibold text-accent">{result}</p>
        <p className="text-sm text-secondary leading-relaxed line-clamp-2">{description}</p>
      </div>
    </div>
  )
}

export function CaseStudyCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
      <div className="aspect-video skeleton" />
      <div className="p-6 flex flex-col gap-3">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="flex flex-col gap-1.5">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
        </div>
      </div>
    </div>
  )
}
