import type { JobListing } from '../types/career'

interface JobCardProps {
  job: JobListing
  onApply: (job: JobListing) => void
}

const TYPE_LABEL: Record<JobListing['employment_type'], string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
}

function IconBriefcase() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconDollar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const requirements = job.requirements
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean)
  const visibleReqs = requirements.slice(0, 4)
  const hiddenCount = requirements.length - visibleReqs.length

  return (
    <article className="bg-surface border border-border rounded-xl shadow-sm p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl text-primary">{job.title}</h3>
        <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-accent-light text-accent border border-accent/20">
          {TYPE_LABEL[job.employment_type]}
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex items-center gap-5 flex-wrap text-sm text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <IconBriefcase />
          {job.department}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconPin />
          {job.location}
        </span>
        {job.salary_range && (
          <span className="inline-flex items-center gap-1.5">
            <IconDollar />
            {job.salary_range}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-secondary leading-relaxed line-clamp-3">{job.description}</p>

      {/* Requirements */}
      {visibleReqs.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {visibleReqs.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-secondary">
              <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-accent shrink-0" />
              {req}
            </li>
          ))}
          {hiddenCount > 0 && (
            <li className="text-xs text-tertiary pl-[13px]">+{hiddenCount} more</li>
          )}
        </ul>
      )}

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-subtle flex items-center justify-between">
        <span className="text-xs text-tertiary">
          Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          onClick={() => onApply(job)}
          className="px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        >
          Apply for this role
        </button>
      </div>
    </article>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="skeleton h-6 w-[45%] rounded" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex gap-5">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-[80%] rounded" />
      </div>
      <div className="mt-6 pt-5 border-t border-subtle flex justify-end">
        <div className="skeleton h-10 w-36 rounded-full" />
      </div>
    </div>
  )
}
