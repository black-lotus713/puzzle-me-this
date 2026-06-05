import { useEffect, useState } from 'react'
import { getProducts } from '../hooks/useProducts'
import type { Product } from '../types/index'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
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
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16">
      {/* Page header */}
      <div className="pt-20 pb-10">
        <h1 className="font-display text-4xl text-primary">Our Collection</h1>
        <p className="mt-2 text-base text-secondary">Browse our full catalog of handcrafted goods</p>
      </div>

      {/* Sticky category filter */}
      <div className="sticky top-16 z-10 bg-base/90 backdrop-blur-sm border-b border-border py-4 -mx-4 sm:-mx-8 lg:-mx-16 px-4 sm:px-8 lg:px-16">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {/* Product count + grid */}
      <div className="mt-8 pb-24">
        {!loading && (
          <p className="text-sm text-secondary text-right mb-4">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
              <polyline points="22,12 16,12 14,15 10,15 8,12 2,12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            <p className="font-display text-xl text-primary mt-4">No products in this category</p>
            <p className="text-sm text-secondary mt-2">Check back soon or browse another category.</p>
            <button
              onClick={() => setCategory('All')}
              className="mt-6 px-5 py-[10px] text-sm font-medium text-accent border-[1.5px] border-accent rounded-full hover:bg-accent-light transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              View All Products
            </button>
          </div>
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
