import { Fragment, useMemo, useState } from 'react'
import { useJobListings, useApplications } from '../hooks/useCareers'
import type { JobListing, JobFormData, JobStatus, ApplicationStatus } from '../types/career'
import JobForm from '../components/JobForm'

// ── Icons ──────────────────────────────────────────────────

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

// ── Sub-components ─────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs px-6 py-5 flex-1">
      <p className="text-3xl font-bold text-primary tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-secondary">{label}</p>
    </div>
  )
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-success-bg text-success border border-success/20">
        Open
      </span>
    )
  }
  if (status === 'closed') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-error-bg text-error border border-error/20">
        Closed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-subtle text-secondary border border-border">
      Draft
    </span>
  )
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-[14px]">
              <div className={`skeleton h-4 rounded ${j === cols - 1 ? 'w-20' : 'w-[65%]'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function EmptyRow({ colSpan, title, subtitle }: { colSpan: number; title: string; subtitle: string }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center py-20 min-h-[280px]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="font-display text-xl text-primary mt-4">{title}</p>
          <p className="text-sm text-secondary mt-2">{subtitle}</p>
        </div>
      </td>
    </tr>
  )
}

// ── Status helpers ─────────────────────────────────────────

const JOB_STATUS_ACTION: Record<JobStatus, { label: string; next: JobStatus }> = {
  draft: { label: 'Publish', next: 'open' },
  open: { label: 'Close', next: 'closed' },
  closed: { label: 'Reopen', next: 'open' },
}

const APP_STATUSES: ApplicationStatus[] = ['new', 'reviewed', 'shortlisted', 'rejected']

const APP_STATUS_CLASS: Record<ApplicationStatus, string> = {
  new: 'bg-accent-light text-accent border-accent/20',
  reviewed: 'bg-subtle text-secondary border-border',
  shortlisted: 'bg-success-bg text-success border-success/20',
  rejected: 'bg-error-bg text-error border-error/20',
}

type JobFilter = 'all' | JobStatus
type AppFilter = 'all' | ApplicationStatus
type Tab = 'jobs' | 'applications'

const thClass = 'text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary'

// ── Main component ─────────────────────────────────────────

export default function CareersDashboard() {
  const { jobs, loading: jobsLoading, createJob, updateJob, deleteJob, updateJobStatus } = useJobListings()
  const { applications, loading: appsLoading, updateApplicationStatus } = useApplications()

  const [tab, setTab] = useState<Tab>('jobs')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<JobListing | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<JobListing | null>(null)
  const [jobFilter, setJobFilter] = useState<JobFilter>('all')
  const [appFilter, setAppFilter] = useState<AppFilter>('all')
  const [jobSearch, setJobSearch] = useState('')
  const [appSearch, setAppSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  async function handleSubmit(data: JobFormData) {
    setSubmitting(true)
    try {
      if (editTarget) {
        await updateJob(editTarget.id, data)
        setEditTarget(null)
      } else {
        await createJob(data)
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteJob(deleteTarget.id)
    setDeleteTarget(null)
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (jobFilter !== 'all' && j.status !== jobFilter) return false
      if (jobSearch && !j.title.toLowerCase().includes(jobSearch.toLowerCase())) return false
      return true
    })
  }, [jobs, jobFilter, jobSearch])

  const filteredApps = useMemo(() => {
    return applications.filter((a) => {
      if (appFilter !== 'all' && a.status !== appFilter) return false
      if (appSearch && !a.full_name.toLowerCase().includes(appSearch.toLowerCase())) return false
      return true
    })
  }, [applications, appFilter, appSearch])

  const newAppCount = applications.filter((a) => a.status === 'new').length

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
      active
        ? 'bg-accent-light border-accent text-accent font-semibold'
        : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
    }`

  const tabClass = (active: boolean) =>
    `px-5 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
      active
        ? 'bg-accent text-inverse border-transparent'
        : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
    }`

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl text-primary">Careers</h1>
          <p className="mt-1 text-sm text-secondary">Manage job listings and review applications</p>
        </div>
        {tab === 'jobs' && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          >
            + New Job
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-2 mt-6">
        <button onClick={() => setTab('jobs')} className={tabClass(tab === 'jobs')}>
          Job Listings
        </button>
        <button onClick={() => setTab('applications')} className={tabClass(tab === 'applications')}>
          Applications
          {newAppCount > 0 && (
            <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${tab === 'applications' ? 'bg-white/20 text-inverse' : 'bg-accent text-inverse'}`}>
              {newAppCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'jobs' ? (
        <>
          {/* Stat cards */}
          <div className="flex gap-4 mb-8 mt-8">
            <StatCard label="Total" value={jobs.length} />
            <StatCard label="Open" value={jobs.filter((j) => j.status === 'open').length} />
            <StatCard label="Draft" value={jobs.filter((j) => j.status === 'draft').length} />
            <StatCard label="Closed" value={jobs.filter((j) => j.status === 'closed').length} />
          </div>

          {/* Table card */}
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2 flex-wrap justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'open', 'draft', 'closed'] as JobFilter[]).map((v) => (
                  <button key={v} onClick={() => setJobFilter(v)} className={pillClass(jobFilter === v)}>
                    {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search by title…"
                className="h-9 px-3 text-sm bg-surface border border-border rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-[150ms] w-52"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-subtle border-b border-border">
                    <th className={thClass}>Title</th>
                    <th className={thClass}>Department</th>
                    <th className={thClass}>Location</th>
                    <th className={thClass}>Type</th>
                    <th className={`${thClass} text-center`}>Status</th>
                    <th className={thClass}>Created</th>
                    <th className="px-4 py-3 w-[170px]" />
                  </tr>
                </thead>
                <tbody>
                  {jobsLoading ? (
                    <TableSkeleton cols={7} />
                  ) : filteredJobs.length === 0 ? (
                    <EmptyRow
                      colSpan={7}
                      title="No job listings"
                      subtitle={jobFilter !== 'all' || jobSearch ? 'No items match this filter.' : 'Add the first job to get started.'}
                    />
                  ) : (
                    filteredJobs.map((j) => (
                      <tr
                        key={j.id}
                        className="bg-surface border-b border-subtle last:border-0 hover:bg-base transition-colors duration-[100ms]"
                      >
                        <td className="px-4 py-[14px] max-w-[220px]">
                          <span className="block truncate text-primary font-medium" title={j.title}>
                            {j.title}
                          </span>
                        </td>
                        <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{j.department}</td>
                        <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{j.location}</td>
                        <td className="px-4 py-[14px] text-secondary whitespace-nowrap capitalize">{j.employment_type}</td>
                        <td className="px-4 py-[14px] text-center">
                          <JobStatusBadge status={j.status} />
                        </td>
                        <td className="px-4 py-[14px] text-secondary whitespace-nowrap tabular-nums">
                          {new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-[14px]">
                          <div className="flex items-center gap-1 justify-end flex-wrap">
                            <button
                              onClick={() => updateJobStatus(j.id, JOB_STATUS_ACTION[j.status].next)}
                              className="px-2 py-1 text-xs font-medium text-secondary rounded-md hover:bg-subtle transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                            >
                              {JOB_STATUS_ACTION[j.status].label}
                            </button>
                            <button
                              onClick={() => setEditTarget(j)}
                              aria-label="Edit"
                              className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20 transition-all duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(j)}
                              aria-label="Delete"
                              className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary hover:bg-error-bg hover:text-error border border-transparent hover:border-error transition-all duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Stat cards */}
          <div className="flex gap-4 mb-8 mt-8">
            <StatCard label="Total" value={applications.length} />
            <StatCard label="New" value={newAppCount} />
            <StatCard label="Shortlisted" value={applications.filter((a) => a.status === 'shortlisted').length} />
            <StatCard label="Rejected" value={applications.filter((a) => a.status === 'rejected').length} />
          </div>

          {/* Table card */}
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2 flex-wrap justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', ...APP_STATUSES] as AppFilter[]).map((v) => (
                  <button key={v} onClick={() => setAppFilter(v)} className={pillClass(appFilter === v)}>
                    {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search by name…"
                className="h-9 px-3 text-sm bg-surface border border-border rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-[150ms] w-52"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-subtle border-b border-border">
                    <th className={thClass}>Applicant</th>
                    <th className={thClass}>Job</th>
                    <th className={thClass}>Phone</th>
                    <th className={`${thClass} text-center`}>CV</th>
                    <th className={thClass}>Applied</th>
                    <th className={`${thClass} text-center`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appsLoading ? (
                    <TableSkeleton cols={6} />
                  ) : filteredApps.length === 0 ? (
                    <EmptyRow
                      colSpan={6}
                      title="No applications"
                      subtitle={appFilter !== 'all' || appSearch ? 'No items match this filter.' : 'Applications submitted on the careers page will appear here.'}
                    />
                  ) : (
                    filteredApps.map((a) => (
                      <Fragment key={a.id}>
                        <tr
                          onClick={() => setExpandedApp(expandedApp === a.id ? null : a.id)}
                          className="bg-surface border-b border-subtle last:border-0 hover:bg-base transition-colors duration-[100ms] cursor-pointer"
                        >
                          <td className="px-4 py-[14px]">
                            <span className="block text-primary font-medium">{a.full_name}</span>
                            <span className="block text-xs text-tertiary mt-0.5">{a.email}</span>
                          </td>
                          <td className="px-4 py-[14px] text-secondary max-w-[180px]">
                            <span className="block truncate" title={a.job_listings?.title ?? ''}>
                              {a.job_listings?.title ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{a.phone ?? '—'}</td>
                          <td className="px-4 py-[14px] text-center">
                            <a
                              href={a.cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Open CV"
                              className="inline-flex w-7 h-7 rounded-full items-center justify-center text-tertiary hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20 transition-all duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                            >
                              <IconDownload />
                            </a>
                          </td>
                          <td className="px-4 py-[14px] text-secondary whitespace-nowrap tabular-nums">
                            {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-[14px] text-center">
                            <select
                              value={a.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateApplicationStatus(a.id, e.target.value as ApplicationStatus)}
                              className={`px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${APP_STATUS_CLASS[a.status]}`}
                            >
                              {APP_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {expandedApp === a.id && a.cover_note && (
                          <tr className="bg-base border-b border-subtle">
                            <td colSpan={6} className="px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tertiary mb-1">Cover note</p>
                              <p className="text-sm text-secondary whitespace-pre-line max-w-[720px]">{a.cover_note}</p>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {(showForm || editTarget) && (
        <JobForm
          initialData={editTarget ?? null}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
          submitting={submitting}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-[400px] p-8">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
              <h2 className="font-display text-xl text-primary">Delete job listing?</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                <IconX />
              </button>
            </div>
            <div className="bg-error-bg border-l-[3px] border-error rounded-md px-[14px] py-[10px] text-sm font-medium text-primary">
              {deleteTarget.title.length > 80 ? deleteTarget.title.slice(0, 80) + '…' : deleteTarget.title}
            </div>
            <p className="mt-3 text-sm font-medium text-error">
              This will also delete all applications for this job. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-subtle">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-secondary rounded-full border-[1.5px] border-accent hover:bg-accent-light transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-error rounded-full hover:bg-[#A93226] transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
