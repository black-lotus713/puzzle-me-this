import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../hooks/useProducts'
import type { Product } from '../types/index'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import heroImg from '../assets/hero.png'

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
      {/* ── Hero ── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 min-h-[calc(100vh-64px)] flex items-center py-20 md:py-0">
        <div className="w-full grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs uppercase tracking-[0.1em] font-semibold text-accent mb-4">
              Handcrafted Home Goods
            </p>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-primary leading-[1.15]">
              Thoughtfully Made,<br />Beautifully Designed
            </h1>
            <p className="mt-4 text-base text-secondary max-w-[420px]">
              Curated home goods crafted from natural materials for everyday living.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/products"
                className="px-5 py-[10px] text-sm font-semibold text-inverse bg-accent rounded-full border-[1.5px] border-transparent hover:bg-accent-hover transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              >
                Shop All Products
              </Link>
              <button className="px-5 py-[10px] text-sm font-medium text-secondary rounded-md hover:text-primary hover:bg-subtle transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent">
                Our Story
              </button>
            </div>
          </div>

          {/* Right: image */}
          <div className="aspect-[16/9] md:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-subtle">
            <img
              src={heroImg}
              alt="Handcrafted home goods"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 mt-24 pb-24">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl text-primary">Featured Picks</h2>
          <div className="mx-auto mt-3 mb-0 h-[2px] w-10 bg-accent" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="mt-4 text-lg text-secondary">No featured products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
