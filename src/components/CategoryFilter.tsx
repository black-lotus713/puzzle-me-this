const CATEGORIES = ['All', 'Home Decor', 'Kitchen', 'Textiles', 'Bathroom', 'Storage']

interface Props {
  selected: string
  onChange: (category: string) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-olive text-white'
              : 'bg-tan text-charcoal hover:bg-olive/20'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
