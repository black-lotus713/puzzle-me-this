import { useState } from 'react'
import type { Product } from '../types/index'

interface Props {
  product: Product
}

function BrokenImagePlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-subtle">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
        <circle cx="12" cy="13" r="3" />
      </svg>
      <span className="mt-2 text-xs text-tertiary">No image</span>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 flex flex-col gap-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded mt-1" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-5 w-14 rounded mt-2" />
      </div>
    </div>
  )
}

export default function ProductCard({ product }: Props) {
  const [broken, setBroken] = useState(false)

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-[200ms] cursor-pointer overflow-hidden flex flex-col">
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-subtle relative">
        {broken || !product.image_url ? (
          <BrokenImagePlaceholder />
        ) : (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setBroken(true)}
          />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs uppercase tracking-[0.08em] font-semibold text-accent">
          {product.category}
        </span>
        <h3 className="font-display text-lg text-primary mt-1 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-secondary mt-1 line-clamp-2">{product.description}</p>
        )}
        <p className="text-xl font-semibold text-primary tabular-nums mt-auto pt-3">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
