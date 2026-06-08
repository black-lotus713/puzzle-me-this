import type { FaqItem } from '../types/faq'

interface Props {
  faq: FaqItem
  isOpen: boolean
  onToggle: () => void
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  )
}

const categoryColors: Record<string, string> = {
  General: 'bg-accent/10 text-accent border-accent/20',
  Pricing: 'bg-success-bg text-success border-success/20',
  Services: 'bg-warning-bg text-warning border-warning/20',
  Support: 'bg-error-bg text-error border-error/20',
  Delivery: 'bg-subtle text-secondary border-border',
}

export default function FaqAccordionItem({ faq, isOpen, onToggle }: Props) {
  const badgeClass = categoryColors[faq.category] ?? categoryColors.General

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-subtle transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <span className={`inline-flex items-center px-2 py-[3px] rounded-full text-xs font-semibold border shrink-0 ${badgeClass}`}>
          {faq.category}
        </span>
        <span className="flex-1 text-sm font-medium text-primary">{faq.question}</span>
        <span className={`shrink-0 text-secondary transition-transform duration-[200ms] ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown />
        </span>
      </button>
      <div
        className={`transition-all duration-[250ms] overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-5 pt-1 border-t border-border text-sm text-secondary leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </div>
  )
}
