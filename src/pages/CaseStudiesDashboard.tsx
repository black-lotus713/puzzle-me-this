import { useMemo, useState } from 'react'
import { useCaseStudies } from '../hooks/useCaseStudies'
import type { CaseStudy, CaseStudyFormData, CaseStudyStatus } from '../types/caseStudy'
import CaseStudyForm from '../components/CaseStudyForm'

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

function IconCycle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23,4 23,10 17,10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
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

function StatusBadge({ status }: { status: CaseStudyStatus }) {
  if (status === 'featured') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-warning/10 text-warning border border-warning/20">
        Featured
      </span>
    )
  }
  if (status === 'published') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-success-bg text-success border border-success/20">
        Published
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-subtle text-secondary border border-border">
      Draft
    </span>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-[14px]"><div className="skeleton w-12 h-12 rounded" /></td>
          {Array.from({ length: 4 }).map((_, j) => (
            <td key={j} className="px-4 py-[14px]">
              <div className={`skeleton h-4 rounded ${j === 3 ? 'w-16' : 'w-[65%]'}`} />
            </td>
          ))}
          <td className="px-4 py-[14px]"><div className="skeleton h-4 w-20 rounded" /></td>
          <td className="px-4 py-[14px]"><div className="skeleton h-4 w-24 rounded" /></td>
        </tr>
      ))}
    </>
  )
}

// ── Status cycle order ─────────────────────────────────────

const STATUS_CYCLE: CaseStudyStatus[] = ['draft', 'published', 'featured']
const STATUS_NEXT_LABEL: Record<CaseStudyStatus, string> = {
  draft: 'Publish',
  published: 'Feature',
  featured: 'Draft',
}

function nextStatus(current: CaseStudyStatus): CaseStudyStatus {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

type StatusFilter = 'all' | CaseStudyStatus

// ── Main component ─────────────────────────────────────────

export default function CaseStudiesDashboard() {
  const { caseStudies, loading, createCaseStudy, updateCaseStudy, deleteCaseStudy, updateStatus, uploadImage } = useCaseStudies()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<CaseStudy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CaseStudy | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(data: CaseStudyFormData, imageFile: File | null) {
    setSubmitting(true)
    try {
      let finalData = { ...data }
      if (imageFile) {
        const url = await uploadImage(imageFile)
        finalData = { ...finalData, image_url: url }
      }
      if (editTarget) {
        await updateCaseStudy(editTarget.id, finalData)
        setEditTarget(null)
      } else {
        await createCaseStudy(finalData)
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteCaseStudy(deleteTarget.id, deleteTarget.image_url)
    setDeleteTarget(null)
  }

  const filtered = useMemo(() => {
    return caseStudies.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [caseStudies, statusFilter, search])

  const totalPublished = caseStudies.filter((c) => c.status === 'published').length
  const totalFeatured = caseStudies.filter((c) => c.status === 'featured').length
  const totalDraft = caseStudies.filter((c) => c.status === 'draft').length

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
      active
        ? 'bg-accent-light border-accent text-accent font-semibold'
        : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
    }`

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl text-primary">Case Studies</h1>
          <p className="mt-1 text-sm text-secondary">Manage case studies and control what visitors can see</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-1 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        >
          + New Case Study
        </button>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4 mb-8 mt-8">
        <StatCard label="Total" value={caseStudies.length} />
        <StatCard label="Published" value={totalPublished} />
        <StatCard label="Featured" value={totalFeatured} />
        <StatCard label="Draft" value={totalDraft} />
      </div>

      {/* Table card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Filter + search bar */}
        <div className="p-4 border-b border-border flex items-center gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'published', 'featured', 'draft'] as StatusFilter[]).map((v) => (
              <button key={v} onClick={() => setStatusFilter(v)} className={pillClass(statusFilter === v)}>
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="h-9 px-3 text-sm bg-surface border border-border rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-[150ms] w-52"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-subtle border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-14">Img</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Client Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Service</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Created</th>
                <th className="px-4 py-3 w-[160px]" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-20 min-h-[280px]">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="font-display text-xl text-primary mt-4">No case studies</p>
                      <p className="text-sm text-secondary mt-2">
                        {statusFilter !== 'all' || search
                          ? 'No items match this filter.'
                          : 'Add the first case study to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="bg-surface border-b border-subtle last:border-0 hover:bg-base transition-colors duration-[100ms]"
                  >
                    <td className="px-4 py-[14px]">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-subtle border border-border flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-[14px] max-w-[200px]">
                      <span className="block truncate text-primary font-medium" title={c.title}>
                        {c.title}
                      </span>
                    </td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{c.client_type}</td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{c.service_used}</td>
                    <td className="px-4 py-[14px] text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap tabular-nums">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-[14px]">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        <button
                          onClick={() => updateStatus(c.id, nextStatus(c.status))}
                          title={`${STATUS_NEXT_LABEL[c.status]} (cycle status)`}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-secondary rounded-md hover:bg-subtle transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                        >
                          <IconCycle />
                          {STATUS_NEXT_LABEL[c.status]}
                        </button>
                        <button
                          onClick={() => setEditTarget(c)}
                          aria-label="Edit"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20 transition-all duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
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

      {/* Add / Edit Modal */}
      {(showForm || editTarget) && (
        <CaseStudyForm
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
              <h2 className="font-display text-xl text-primary">Delete case study?</h2>
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
            <p className="mt-3 text-sm font-medium text-error">This action cannot be undone.</p>
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
