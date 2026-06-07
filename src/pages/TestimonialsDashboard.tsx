import { useMemo, useState } from 'react'
import { useTestimonials } from '../hooks/useTestimonials'
import type { Testimonial, TestimonialStatus } from '../types/testimonial'
import StarRating from '../components/StarRating'
import TestimonialForm from '../components/TestimonialForm'
import type { NewTestimonial } from '../types/testimonial'

// ── Icons ──────────────────────────────────────────────────

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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

// ── Sub-components ─────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs px-6 py-5 flex-1">
      <p className="text-3xl font-bold text-primary tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-secondary">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: TestimonialStatus }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-success-bg text-success border border-success/20">
        Approved
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-error-bg text-error border border-error/20">
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-warning-bg text-warning border border-warning/20">
      Pending
    </span>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-[14px]">
              <div className={`skeleton h-4 rounded ${j === 0 ? 'w-[70%]' : j === 6 ? 'w-16' : 'w-[60%]'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────

type FilterValue = 'all' | TestimonialStatus

export default function TestimonialsDashboard() {
  const { testimonials, loading, addTestimonial, updateStatus, deleteTestimonial } = useTestimonials()
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')

  async function handleAdd(data: NewTestimonial) {
    await addTestimonial(data)
    setShowForm(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteTestimonial(deleteTarget.id)
    setDeleteTarget(null)
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return testimonials
    return testimonials.filter((t) => t.status === filter)
  }, [testimonials, filter])

  const totalApproved = testimonials.filter((t) => t.status === 'approved').length
  const totalPending = testimonials.filter((t) => t.status === 'pending').length
  const totalRejected = testimonials.filter((t) => t.status === 'rejected').length

  const pillClass = (val: FilterValue) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
      filter === val
        ? 'bg-accent-light border-accent text-accent font-semibold'
        : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
    }`

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl text-primary">Testimonials</h1>
          <p className="mt-1 text-sm text-secondary">Manage customer reviews and control what appears publicly</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-1 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        >
          + Add Testimonial
        </button>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4 mb-8 mt-8">
        <StatCard label="Total" value={testimonials.length} />
        <StatCard label="Approved" value={totalApproved} />
        <StatCard label="Pending" value={totalPending} />
        <StatCard label="Rejected" value={totalRejected} />
      </div>

      {/* Table card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as FilterValue[]).map((v) => (
            <button key={v} onClick={() => setFilter(v)} className={pillClass(v)}>
              {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-subtle border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[25%]">Review</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Submitted</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Status</th>
                <th className="px-4 py-3 w-[14%]" />
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
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <p className="font-display text-xl text-primary mt-4">No testimonials</p>
                      <p className="text-sm text-secondary mt-2">
                        {filter !== 'all' ? 'No testimonials match this filter.' : 'Add the first testimonial to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="bg-surface border-b border-subtle last:border-0 hover:bg-base transition-colors duration-[100ms]"
                  >
                    <td className="px-4 py-[14px] font-medium text-primary whitespace-nowrap">{t.customer_name}</td>
                    <td className="px-4 py-[14px]">
                      <StarRating rating={t.rating} size="sm" />
                    </td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{t.service_used}</td>
                    <td className="px-4 py-[14px] text-secondary max-w-[240px]">
                      <span
                        title={t.review_text}
                        className="block truncate"
                        style={{ maxWidth: '240px' }}
                      >
                        {t.review_text.length > 80 ? t.review_text.slice(0, 80) + '…' : t.review_text}
                      </span>
                    </td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap tabular-nums">
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-[14px] text-center">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-[14px]">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        {t.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(t.id, 'approved')}
                            className="px-2 py-1 text-xs font-medium rounded-md text-success hover:bg-success-bg transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                          >
                            Approve
                          </button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(t.id, 'rejected')}
                            className="px-2 py-1 text-xs font-medium rounded-md text-error hover:bg-error-bg transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                          >
                            Reject
                          </button>
                        )}
                        {t.status !== 'pending' && (
                          <button
                            onClick={() => updateStatus(t.id, 'pending')}
                            className="px-2 py-1 text-xs font-medium rounded-md text-warning hover:bg-warning-bg transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                          >
                            Pending
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(t)}
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

      {/* Add Testimonial Modal */}
      {showForm && (
        <TestimonialForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-[400px] p-8">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
              <h2 className="font-display text-xl text-primary">Delete testimonial?</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                <IconX />
              </button>
            </div>
            <div className="bg-error-bg border-l-[3px] border-error rounded-md px-[14px] py-[10px] text-sm font-medium text-primary">
              {deleteTarget.customer_name}
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
