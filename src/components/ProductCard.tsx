import type { Product } from '../types/index'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const fallback = `https://placehold.co/600x400?text=${encodeURIComponent(product.name)}`

  return (
    <div className="bg-tan rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <img
        src={product.image_url ?? fallback}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = fallback }}
      />
      <div className="p-4">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="text-charcoal font-semibold mt-1 text-base leading-snug">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-muted text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
        <p className="text-olive font-bold mt-2 text-lg">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
