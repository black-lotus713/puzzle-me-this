import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../hooks/useProducts'
import type { Product } from '../types/index'
import ProductForm from '../components/ProductForm'

type FormData = Omit<Product, 'id' | 'created_at'>

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-charcoal">Admin</h1>
        <button
          onClick={() => setModal('add')}
          className="px-4 py-2 bg-olive text-white text-sm rounded hover:bg-olive/80 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-tan">
          <table className="w-full text-sm">
            <thead className="bg-tan text-charcoal">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Price</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-cream'}>
                  <td className="px-4 py-3 text-charcoal font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3 text-charcoal">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'active'
                        ? 'bg-olive/20 text-olive'
                        : 'bg-tan text-muted'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.featured ? '★' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => setModal(p)}
                        className="text-olive hover:text-olive/70 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No products yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-charcoal mb-5">
              {modal === 'add' ? 'Add Product' : 'Edit Product'}
            </h2>
            <ProductForm
              product={modal === 'add' ? undefined : modal}
              onSave={handleSave}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-charcoal mb-2">Delete product?</h2>
            <p className="text-muted text-sm mb-6">
              "{deleteTarget.name}" will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm bg-tan text-charcoal rounded hover:bg-olive/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
