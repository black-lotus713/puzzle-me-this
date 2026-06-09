import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CaseStudy, CaseStudyFormData, CaseStudyStatus } from '../types/caseStudy'

function useCaseStudiesBase(publishedOnly: boolean) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function getCaseStudies() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setCaseStudies(data)
    } catch (e) {
      setError('Failed to load case studies.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function getPublishedCaseStudies() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('case_studies')
        .select('*')
        .in('status', ['published', 'featured'])
        .order('status', { ascending: false })
        .order('created_at', { ascending: false })
      if (err) throw err
      setCaseStudies(data)
    } catch (e) {
      setError('Failed to load case studies.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    if (publishedOnly) {
      await getPublishedCaseStudies()
    } else {
      await getCaseStudies()
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function createCaseStudy(data: CaseStudyFormData): Promise<void> {
    const { error: err } = await supabase.from('case_studies').insert(data)
    if (err) throw err
    await refresh()
  }

  async function updateCaseStudy(id: string, data: CaseStudyFormData): Promise<void> {
    const { error: err } = await supabase
      .from('case_studies')
      .update(data)
      .eq('id', id)
    if (err) throw err
    await refresh()
  }

  async function deleteCaseStudy(id: string, imageUrl: string | null): Promise<void> {
    if (imageUrl) {
      const parts = imageUrl.split('/case-study-images/')
      const filename = parts[1]
      if (filename) {
        await supabase.storage.from('case-study-images').remove([filename])
      }
    }
    const { error: err } = await supabase.from('case_studies').delete().eq('id', id)
    if (err) throw err
    await refresh()
  }

  async function updateStatus(id: string, status: CaseStudyStatus): Promise<void> {
    const { error: err } = await supabase
      .from('case_studies')
      .update({ status })
      .eq('id', id)
    if (err) throw err
    await refresh()
  }

  async function uploadImage(file: File): Promise<string> {
    const filename = `${Date.now()}-${file.name}`
    const { error: err } = await supabase.storage
      .from('case-study-images')
      .upload(filename, file)
    if (err) throw err
    const { data } = supabase.storage.from('case-study-images').getPublicUrl(filename)
    return data.publicUrl
  }

  return { caseStudies, loading, error, getCaseStudies, getPublishedCaseStudies, createCaseStudy, updateCaseStudy, deleteCaseStudy, updateStatus, uploadImage }
}

export function useCaseStudies() {
  return useCaseStudiesBase(false)
}

export function usePublicCaseStudies() {
  return useCaseStudiesBase(true)
}
