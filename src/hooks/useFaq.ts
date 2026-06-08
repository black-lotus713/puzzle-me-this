import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { FaqItem, NewFaqItem, FaqItemUpdate } from '../types/faq'

function useFaqBase(publishedOnly: boolean) {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('faq_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setFaqs(data)
    } catch (e) {
      setError('Failed to load FAQ items.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPublished() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('faq_items')
        .select('*')
        .eq('published', true)
        .order('updated_at', { ascending: false })
      if (err) throw err
      setFaqs(data)
    } catch (e) {
      setError('Failed to load FAQ items.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (publishedOnly) {
      fetchPublished()
    } else {
      fetchAll()
    }
  }, [])

  async function addFaq(data: NewFaqItem): Promise<void> {
    const { error: err } = await supabase.from('faq_items').insert(data)
    if (err) throw err
    await (publishedOnly ? fetchPublished() : fetchAll())
  }

  async function updateFaq(id: string, data: FaqItemUpdate): Promise<void> {
    const { error: err } = await supabase
      .from('faq_items')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    await (publishedOnly ? fetchPublished() : fetchAll())
  }

  async function deleteFaq(id: string): Promise<void> {
    const { error: err } = await supabase.from('faq_items').delete().eq('id', id)
    if (err) throw err
    await (publishedOnly ? fetchPublished() : fetchAll())
  }

  async function togglePublished(id: string, current: boolean): Promise<void> {
    await updateFaq(id, { published: !current })
  }

  return { faqs, loading, error, addFaq, updateFaq, deleteFaq, togglePublished }
}

export function useFaq() {
  return useFaqBase(false)
}

export function usePublicFaq() {
  return useFaqBase(true)
}
