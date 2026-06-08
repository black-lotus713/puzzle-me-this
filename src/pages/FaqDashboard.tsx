import { useMemo, useState } from 'react'
import { useFaq } from '../hooks/useFaq'
import type { FaqItem, FaqCategory } from '../types/faq'
import { FAQ_CATEGORIES } from '../types/faq'
import FaqForm from '../components/FaqForm'
import type { NewFaqItem } from '../types/faq'

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

// ── Sub-components ─────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs px-6 py-5 flex-1">
      <p className="text-3xl font-bold text-primary tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-secondary">{label}</p>
    </div>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  if (published) {
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
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-[14px]">
              <div className={`skeleton h-4 rounded ${j === 0 ? 'w-[70%]' : j === 4 ? 'w-16' : 'w-[60%]'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────

type StatusFilter = 'all' | 'published' | 'unpublished'

export default function FaqDashboard() {
  const { faqs, loading, addFaq, updateFaq, deleteFaq, togglePublished } = useFaq()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<FaqItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory | 'all'>('all')

  async function handleSave(data: NewFaqItem) {
    if (editTarget) {
      await updateFaq(editTarget.id, data)
      setEditTarget(null)
    } else {
      await addFaq(data)
      setShowForm(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteFaq(deleteTarget.id)
    setDeleteTarget(null)
  }

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      if (statusFilter === 'published' && !f.published) return false
      if (statusFilter === 'unpublished' && f.published) return false
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false
      return true
    })
  }, [faqs, statusFilter, categoryFilter])

  const totalPublished = faqs.filter((f) => f.published).length
  const totalUnpublished = faqs.filter((f) => !f.published).length

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
          <h1 className="font-display text-3xl text-primary">FAQ & Help Centre</h1>
          <p className="mt-1 text-sm text-secondary">Manage help articles and control what visitors can see</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-1 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        >
          + Add FAQ Item
        </button>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4 mb-8 mt-8">
        <StatCard label="Total" value={faqs.length} />
        <StatCard label="Published" value={totalPublished} />
        <StatCard label="Unpublished" value={totalUnpublished} />
      </div>

      {/* Table card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Filter bars */}
        <div className="p-4 border-b border-border space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'published', 'unpublished'] as StatusFilter[]).map((v) => (
              <button key={v} onClick={() => setStatusFilter(v)} className={pillClass(statusFilter === v)}>
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setCategoryFilter('all')} className={pillClass(categoryFilter === 'all')}>
              All Categories
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={pillClass(categoryFilter === cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-subtle border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[35%]">Question</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Category</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary">Last Updated</th>
                <th className="px-4 py-3 w-[18%]" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 min-h-[280px]">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="font-display text-xl text-primary mt-4">No FAQ items</p>
                      <p className="text-sm text-secondary mt-2">
                        {statusFilter !== 'all' || categoryFilter !== 'all'
                          ? 'No items match this filter.'
                          : 'Add the first FAQ item to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="bg-surface border-b border-subtle last:border-0 hover:bg-base transition-colors duration-[100ms]"
                  >
                    <td className="px-4 py-[14px] text-secondary max-w-[280px]">
                      <span
                        title={f.question}
                        className="block truncate text-primary font-medium"
                        style={{ maxWidth: '280px' }}
                      >
                        {f.question.length > 80 ? f.question.slice(0, 80) + '…' : f.question}
                      </span>
                    </td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap">{f.category}</td>
                    <td className="px-4 py-[14px] text-center">
                      <StatusBadge published={f.published} />
                    </td>
                    <td className="px-4 py-[14px] text-secondary whitespace-nowrap tabular-nums">
                      {new Date(f.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-[14px]">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        <button
                          onClick={() => togglePublished(f.id, f.published)}
                          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
                            f.published
                              ? 'text-secondary hover:bg-subtle'
                              : 'text-success hover:bg-success-bg'
                          }`}
                        >
                          {f.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => setEditTarget(f)}
                          aria-label="Edit"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20 transition-all duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
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
        <FaqForm
          initialData={editTarget ?? undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-[400px] p-8">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
              <h2 className="font-display text-xl text-primary">Delete FAQ item?</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                <IconX />
              </button>
            </div>
            <div className="bg-error-bg border-l-[3px] border-error rounded-md px-[14px] py-[10px] text-sm font-medium text-primary">
              {deleteTarget.question.length > 80 ? deleteTarget.question.slice(0, 80) + '…' : deleteTarget.question}
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
