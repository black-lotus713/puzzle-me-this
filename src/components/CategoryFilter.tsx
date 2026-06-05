const CATEGORIES = ['All', 'Home Decor', 'Kitchen', 'Textiles', 'Bathroom', 'Storage']

interface Props {
  selected: string
  onChange: (category: string) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 py-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
            selected === cat
              ? 'bg-accent-light border-accent text-accent font-semibold'
              : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
