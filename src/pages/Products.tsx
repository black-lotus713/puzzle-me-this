import { useEffect, useState } from 'react'
import { getProducts } from '../hooks/useProducts'
import type { Product } from '../types/index'
import ProductCard from '../components/ProductCard'
import CategoryFilter from '../components/CategoryFilter'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProducts({ category, status: 'active' })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-charcoal mb-6">All Products</h1>
      <CategoryFilter selected={category} onChange={setCategory} />

      <div className="mt-8">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-muted">No products in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
