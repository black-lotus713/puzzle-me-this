import { useEffect, useMemo, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../hooks/useProducts'
import type { Product } from '../types/index'
import ProductForm from '../components/ProductForm'

type FormData = Omit<Product, 'id' | 'created_at'>

// ── SVG Icons ──────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.827 2.827 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function IconStarFilled() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function IconStarEmpty() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
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

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary flex-shrink-0">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

// ── Sub-components ─────────────────────────────────────────

function IconButton({ onClick, label, danger = false, children }: {
  onClick: () => void
  label: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-8 h-8 rounded-full flex items-center justify-center border border-transparent transition-all duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
          danger
            ? 'hover:bg-error-bg hover:border-error hover:text-error text-tertiary'
            : 'hover:bg-subtle hover:border-border text-tertiary'
        }`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-inverse bg-primary rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-200 duration-[150ms]">
        {label}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: 'active' | 'draft' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-success-bg text-success border border-success/20">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.05em] bg-warning-bg text-warning border border-warning/20">
      Draft
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs px-6 py-5 flex-1">
      <p className="text-3xl font-bold text-primary tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-secondary">{label}</p>
    </div>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-[14px]">
              <div className={`skeleton h-4 rounded ${j === 0 ? 'w-[70%]' : j === 5 ? 'w-12' : 'w-[60%]'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'draft'>('All')

  async function load() {
    setLoading(true)
    try {
      setProducts(await getProducts())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: FormData) {
    if (modal === 'add') {
      await createProduct(data)
    } else if (modal) {
      await updateProduct((modal as Product).id, data)
    }
    setModal(null)
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteProduct(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [products, search, statusFilter])

  const totalActive = products.filter((p) => p.status === 'active').length
  const totalFeatured = products.filter((p) => p.featured).length

  const filterPillClass = (val: string) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
      statusFilter === val
        ? 'bg-accent-light border-accent text-accent font-semibold'
        : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
    }`

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-primary">Product Management</h1>
        <button
          onClick={() => setModal('add')}
          className="px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        >
          Add Product
        </button>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4 mb-8">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Active" value={totalActive} />
        <StatCard label="Featured" value={totalFeatured} />
      </div>

      {/* Table card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border flex-wrap">
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 w-[280px] bg-surface border-[1.5px] border-border rounded-md text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-[150ms]"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'active', 'draft'] as const).map((v) => (
              <button key={v} onClick={() => setStatusFilter(v)} className={filterPillClass(v)}>
                {v === 'active' ? 'Active' : v === 'draft' ? 'Draft' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-subtle border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[30%]">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[15%]">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[10%]">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[10%]">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-secondary w-[10%]">Featured</th>
                <th className="px-4 py-3 w-[12%]" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 min-h-[320px]">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      {search || statusFilter !== 'All' ? (
                        <>
                          <p className="font-display text-xl text-primary mt-4">No matching products</p>
                          <p className="text-sm text-secondary mt-2">Try adjusting your search or filter.</p>
                        </>
                      ) : (
                        <>
                          <p className="font-display text-xl text-primary mt-4">No products yet</p>
                          <p className="text-sm text-secondary mt-2">Add your first product to get started.</p>
                          <button
                            onClick={() => setModal('add')}
                            className="mt-6 px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                          >
                            Add Product
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="bg-surface border-b border-subtle last:border-0 hover:bg-base transition-colors duration-[100ms]"
                  >
                    <td className="px-4 py-[14px] font-medium text-primary">{p.name}</td>
                    <td className="px-4 py-[14px] text-secondary">{p.category}</td>
                    <td className="px-4 py-[14px] text-right tabular-nums text-secondary">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-[14px] text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-[14px] text-center">
                      {p.featured ? <IconStarFilled /> : <IconStarEmpty />}
                    </td>
                    <td className="px-4 py-[14px]">
                      <div className="flex items-center gap-1 justify-end">
                        <IconButton onClick={() => setModal(p)} label="Edit">
                          <IconEdit />
                        </IconButton>
                        <IconButton onClick={() => setDeleteTarget(p)} label="Delete" danger>
                          <IconTrash />
                        </IconButton>
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
      {modal !== null && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-lg">
            <div className="p-8">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
                <h2 className="font-display text-xl text-primary">
                  {modal === 'add' ? 'Add Product' : 'Edit Product'}
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                >
                  <IconX />
                </button>
              </div>
              <ProductForm
                product={modal === 'add' ? undefined : modal}
                onSave={handleSave}
                onCancel={() => setModal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-container bg-surface rounded-xl shadow-modal w-full max-w-[400px] p-8">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
              <h2 className="font-display text-xl text-primary">Delete product?</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:bg-subtle hover:text-primary transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                <IconX />
              </button>
            </div>

            <div className="bg-error-bg border-l-[3px] border-error rounded-md px-[14px] py-[10px] text-sm font-medium text-primary">
              {deleteTarget.name}
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
