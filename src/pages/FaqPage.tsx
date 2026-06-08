import { useEffect, useMemo, useState } from 'react'
import { usePublicFaq } from '../hooks/useFaq'
import type { FaqCategory } from '../types/faq'
import { FAQ_CATEGORIES } from '../types/faq'
import FaqAccordionItem from '../components/FaqAccordionItem'
import FaqSkeletonItem from '../components/FaqSkeletonItem'

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export default function FaqPage() {
  const { faqs, loading } = usePublicFaq()
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(rawSearch), 200)
    return () => clearTimeout(timer)
  }, [rawSearch])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return faqs.filter((f) => {
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false
      if (q && !f.question.toLowerCase().includes(q) && !f.answer.toLowerCase().includes(q)) return false
      return true
    })
  }, [faqs, search, categoryFilter])

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
      active
        ? 'bg-accent-light border-accent text-accent font-semibold'
        : 'bg-transparent border-border text-secondary hover:bg-subtle hover:border-border-strong'
    }`

  function handleToggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-accent/5 border-b border-border py-16 text-center px-4">
        <p className="text-xs uppercase tracking-[0.1em] font-semibold text-accent mb-3">Help Centre</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary">How Can We Help You?</h1>
        <p className="mt-3 text-base text-secondary max-w-[480px] mx-auto">
          Find answers to common questions about our products and services
        </p>
        {/* Search */}
        <div className="relative mt-8 mx-auto max-w-xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <IconSearch />
          </span>
          <input
            type="search"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search questions and answers…"
            className="w-full h-11 pl-11 pr-4 bg-surface border-[1.5px] border-border rounded-full text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-[150ms] shadow-xs"
          />
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-4 sm:px-8 py-12">
        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-8">
          <button onClick={() => setCategoryFilter('all')} className={pillClass(categoryFilter === 'all')}>
            All
          </button>
          {FAQ_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={pillClass(categoryFilter === cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && faqs.length > 0 && (
          <p className="text-sm text-tertiary mb-4 text-center">
            {filtered.length === faqs.length
              ? `Showing all ${faqs.length} article${faqs.length !== 1 ? 's' : ''}`
              : `Showing ${filtered.length} of ${faqs.length} article${faqs.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* FAQ list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaqSkeletonItem key={i} />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IconEmpty />
            <p className="font-display text-xl text-primary mt-4">No articles available yet</p>
            <p className="text-sm text-secondary mt-2">Check back soon!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IconEmpty />
            <p className="font-display text-xl text-primary mt-4">No articles match your search</p>
            <p className="text-sm text-secondary mt-2">Try different keywords or a different category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => (
              <FaqAccordionItem
                key={f.id}
                faq={f}
                isOpen={openId === f.id}
                onToggle={() => handleToggle(f.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
