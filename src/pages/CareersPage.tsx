import { useState } from 'react'
import { usePublicJobs } from '../hooks/useCareers'
import type { JobListing } from '../types/career'
import JobCard, { JobCardSkeleton } from '../components/JobCard'
import ApplicationForm from '../components/ApplicationForm'

export default function CareersPage() {
  const { jobs, loading } = usePublicJobs()
  const [applyTarget, setApplyTarget] = useState<JobListing | null>(null)

  return (
    <div>
      {/* Hero */}
      <section className="bg-accent/5 border-b border-border py-16 text-center px-4">
        <p className="text-xs uppercase tracking-[0.1em] font-semibold text-accent mb-3">Join the Team</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary">Careers</h1>
        <p className="mt-3 text-base text-secondary max-w-[480px] mx-auto">
          Help us craft goods people love. Browse our open roles below.
        </p>
      </section>

      <div className="max-w-[768px] mx-auto px-4 sm:px-8 py-16">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <p className="font-display text-xl text-primary mt-4">No open positions right now</p>
            <p className="text-sm text-secondary mt-2">Check back soon — new roles open up regularly.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-secondary mb-6">
              {jobs.length} open {jobs.length === 1 ? 'position' : 'positions'}
            </p>
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={setApplyTarget} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Apply modal */}
      {applyTarget && (
        <ApplicationForm job={applyTarget} onClose={() => setApplyTarget(null)} />
      )}
    </div>
  )
}
