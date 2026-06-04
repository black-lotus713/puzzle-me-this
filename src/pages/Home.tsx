import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../hooks/useProducts'
import type { Product } from '../types/index'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeaturedProducts()
      .then(setFeatured)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-tan py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-charcoal leading-tight">
          Thoughtfully Made,<br />Beautifully Designed
        </h1>
        <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
          Curated home goods crafted from natural materials for everyday living.
        </p>
        <Link
          to="/products"
          className="inline-block mt-8 px-8 py-3 bg-olive text-white rounded-full font-medium hover:bg-olive/80 transition-colors"
        >
          Shop All Products
        </Link>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-charcoal mb-8">Featured Products</h2>
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : featured.length === 0 ? (
          <p className="text-muted">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
