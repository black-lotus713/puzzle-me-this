import { usePublicCaseStudies } from '../hooks/useCaseStudies'
import CaseStudyCard, { CaseStudyCardSkeleton } from '../components/CaseStudyCard'

export default function CaseStudiesPage() {
  const { caseStudies, loading } = usePublicCaseStudies()

  const featured = caseStudies.filter((c) => c.status === 'featured')
  const published = caseStudies.filter((c) => c.status === 'published')

  return (
    <div>
      {/* Hero */}
      <section className="bg-accent/5 border-b border-border py-16 text-center px-4">
        <p className="text-xs uppercase tracking-[0.1em] font-semibold text-accent mb-3">Our Portfolio</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary">Our Work</h1>
        <p className="mt-3 text-base text-secondary max-w-[480px] mx-auto">Real results for real clients.</p>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-16 space-y-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CaseStudyCardSkeleton key={i} />
            ))}
          </div>
        ) : caseStudies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <p className="font-display text-xl text-primary mt-4">No case studies published yet</p>
            <p className="text-sm text-secondary mt-2">Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {featured.length > 0 && (
              <section>
                <h2 className="font-display text-2xl text-primary mb-6">Featured Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured.map((c) => (
                    <CaseStudyCard key={c.id} caseStudy={c} featured />
                  ))}
                </div>
              </section>
            )}

            {/* All published section */}
            {published.length > 0 && (
              <section>
                <h2 className="font-display text-2xl text-primary mb-6">All Case Studies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {published.map((c) => (
                    <CaseStudyCard key={c.id} caseStudy={c} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
